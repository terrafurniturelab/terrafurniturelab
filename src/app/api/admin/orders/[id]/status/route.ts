import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CheckoutState } from '@prisma/client';

// Fungsi untuk mendapatkan ID dari URL
function getOrderIdFromUrl(url: string): string | null {
  const pathname = new URL(url).pathname;
  const parts = pathname.split('/');
  return parts[4] || null;
}

// Fungsi untuk memvalidasi state
function isValidState(state: string): state is CheckoutState {
  return Object.values(CheckoutState).includes(state as CheckoutState);
}

// Fungsi untuk mengecek ketersediaan stok
async function checkStockAvailability(items: { productId: string; quantity: number }[]): Promise<{ hasStock: boolean; productName?: string }> {
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { stock: true, name: true }
    });
    if (!product || product.stock < item.quantity) {
      return { hasStock: false, productName: product?.name };
    }
  }
  return { hasStock: true };
}

// Fungsi untuk mengupdate status dan stok dalam satu transaksi
async function updateOrderStatusAndStock(
  orderId: string,
  newState: CheckoutState,
  currentState: CheckoutState,
  items: { productId: string; quantity: number }[]
) {
  // Jika mengubah dari PROCESSING ke CANCELLED, kembalikan stok
  if (currentState === 'PROCESSING' && newState === 'CANCELLED') {
    return prisma.$transaction([
      prisma.checkout.update({
        where: { id: orderId },
        data: { state: newState },
        include: { items: { include: { product: true } }, user: true, address: true },
      }),
      ...items.map(item =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      ),
    ]);
  }

  // Untuk perubahan status lainnya
  return prisma.checkout.update({
    where: { id: orderId },
    data: { state: newState },
    include: { items: { include: { product: true } }, user: true, address: true },
  });
}

export async function PUT(request: Request) {
  try {
    const id = getOrderIdFromUrl(request.url);
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { newState } = body as { newState: CheckoutState };

    // Get the current order with items and product details
    const currentOrder = await prisma.checkout.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if there's enough stock when changing to PROCESSING
    if (newState === 'PROCESSING') {
      for (const item of currentOrder.items) {
        if (item.product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Not enough stock available for ${item.product.name}` },
            { status: 400 }
          );
        }
      }
    }

    // Handle stock changes based on status transitions
    if (newState === 'PROCESSING' && currentOrder.state !== 'PROCESSING') {
      // Reduce stock when changing to PROCESSING
      const [updatedOrder] = await prisma.$transaction([
        prisma.checkout.update({
          where: { id },
          data: { state: newState },
        }),
        ...currentOrder.items.map(item =>
          prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            },
          })
        ),
      ]);
      return NextResponse.json(updatedOrder);
    } else if (newState === 'CANCELLED' && currentOrder.state === 'PROCESSING') {
      // Restore stock when changing from PROCESSING to CANCELLED
      const [updatedOrder] = await prisma.$transaction([
        prisma.checkout.update({
          where: { id },
          data: { state: newState },
        }),
        ...currentOrder.items.map(item =>
          prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            },
          })
        ),
      ]);
      return NextResponse.json(updatedOrder);
    } else {
      // For other status changes, just update the order status
      const updatedOrder = await prisma.checkout.update({
        where: { id },
        data: { state: newState },
      });
      return NextResponse.json(updatedOrder);
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 