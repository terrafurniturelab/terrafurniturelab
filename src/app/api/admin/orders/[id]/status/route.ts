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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    // Validasi input
    const { newState } = await req.json();
    if (!newState || !isValidState(newState)) {
      return NextResponse.json(
        { error: 'Invalid state provided' },
        { status: 400 }
      );
    }

    // Dapatkan ID order
    const orderId = getOrderIdFromUrl(req.url);
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Dapatkan data order saat ini
    const currentOrder = await prisma.checkout.findUnique({
      where: { id: orderId },
      include: { 
        items: {
          include: {
            product: true
          }
        }
      },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update status dan stok
    const result = await updateOrderStatusAndStock(
      orderId,
      newState,
      currentOrder.state,
      currentOrder.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    );

    // Jika result adalah array (hasil transaksi), ambil elemen pertama
    const updatedOrder = Array.isArray(result) ? result[0] : result;

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 