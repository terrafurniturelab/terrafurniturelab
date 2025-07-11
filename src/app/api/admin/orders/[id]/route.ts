import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CheckoutState } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params since it's now a Promise
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.checkout.findUnique({
      where: { 
        id: id
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
        address: true,
      },
    });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order detail:', error);
    return NextResponse.json({ error: 'Failed to fetch order detail' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params since it's now a Promise
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body as { status: CheckoutState };

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

    // If status is being changed to 'processing', reduce the product stock
    if (status === 'PROCESSING' && currentOrder.state !== 'PROCESSING') {
      // Check if there's enough stock for all items
      for (const item of currentOrder.items) {
        if (item.product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Not enough stock available for ${item.product.name}` },
            { status: 400 }
          );
        }
      }

      // Update both order status and product stock in a transaction
      const [updatedOrder] = await prisma.$transaction([
        prisma.checkout.update({
          where: { id },
          data: { state: status },
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
    }

    // If status is being changed to 'cancelled' and current status is 'processing', restore the stock
    if (status === 'CANCELLED' && currentOrder.state === 'PROCESSING') {
      const [updatedOrder] = await prisma.$transaction([
        prisma.checkout.update({
          where: { id },
          data: { state: status },
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
    }

    // If status is not changing to 'processing' or 'cancelled', just update the order status
    const updatedOrder = await prisma.checkout.update({
      where: { id },
      data: { state: status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}