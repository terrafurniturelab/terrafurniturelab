import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CheckoutState } from '@prisma/client';

interface CheckoutItem {
  productId: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('No user session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Received checkout data:', body);

    const { items, addressId } = body as {
      items: CheckoutItem[];
      addressId: string;
    };

    if (!items || !Array.isArray(items) || items.length === 0 || !addressId) {
      console.error('Missing required fields:', { items, addressId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the first admin
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      console.error('No admin found');
      return NextResponse.json({ error: 'No admin found' }, { status: 500 });
    }

    // Verify that the address exists
    const address = await prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!address) {
      console.error('Address not found');
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // Verify that all products exist and have enough stock
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        console.error(`Product not found: ${item.productId}`);
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        console.error(`Not enough stock for product: ${item.productId}`);
        return NextResponse.json(
          { error: `Not enough stock for product: ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Create checkout with items and reduce stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the checkout
      const checkout = await tx.checkout.create({
        data: {
          userId: session.user.id,
          addressId,
          adminId: admin.id,
          state: 'PROCESSING' as CheckoutState,
        },
      });

      // Create checkout items and reduce stock
      const checkoutItems = await Promise.all(
        items.map(async (item) => {
          // Create checkout item
          const checkoutItem = await tx.checkoutItem.create({
            data: {
              checkoutId: checkout.id,
              productId: item.productId,
              quantity: item.quantity,
            },
          });

          // Reduce product stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });

          return checkoutItem;
        })
      );

      return { checkout, items: checkoutItems };
    });

    console.log('Checkout created successfully:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 