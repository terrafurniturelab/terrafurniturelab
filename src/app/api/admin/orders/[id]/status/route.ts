import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CheckoutState } from '@prisma/client';

// Fungsi untuk mendapatkan ID dari URL
function getOrderIdFromUrl(url: string): string | null {
  const pathname = new URL(url).pathname;
  const parts = pathname.split('/');
  return parts[4] || null;
}

export async function PUT(request: Request) {
  try {
    const id = getOrderIdFromUrl(request.url);
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { newState } = body as { newState: CheckoutState };

    // Validate state
    if (!Object.values(CheckoutState).includes(newState)) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
    }

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