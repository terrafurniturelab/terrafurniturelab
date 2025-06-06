import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First get all delivered orders
    const deliveredOrders = await prisma.checkout.findMany({
      where: {
        userId: session.user.id,
        state: 'DELIVERED'
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                reviews: true
              }
            }
          }
        }
      }
    });

    console.log('Total delivered orders:', deliveredOrders.length);

    // Count unique products that need review
    const productsToReview = new Set();
    deliveredOrders.forEach(order => {
      order.items.forEach(item => {
        // Check if the product hasn't been reviewed by this user
        const hasReviewed = item.product.reviews.some(review => review.userId === session.user.id);
        if (!hasReviewed) {
          productsToReview.add(item.productId);
          console.log('Product needs review:', item.product.name);
        }
      });
    });

    console.log('Products to review:', productsToReview.size);

    return NextResponse.json({ 
      count: productsToReview.size,
      orders: deliveredOrders.map(order => ({
        id: order.id,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          hasReviewed: item.product.reviews.some(review => review.userId === session.user.id)
        }))
      }))
    });
  } catch (error) {
    console.error('Error getting unreviewed orders:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 