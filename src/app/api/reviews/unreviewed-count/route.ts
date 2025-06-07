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

    // Get all delivered orders
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
                reviews: {
                  where: {
                    userId: session.user.id
                  }
                }
              }
            }
          }
        }
      }
    });

    // Count unreviewed items per order
    const unreviewedItems = [];
    deliveredOrders.forEach(order => {
      order.items.forEach(item => {
        // Check if this specific order item hasn't been reviewed
        // A review is considered for this order if it was created after the order
        const hasReviewed = item.product.reviews.some(review => 
          review.createdAt > order.createdAt
        );
        
        if (!hasReviewed) {
          unreviewedItems.push({
            orderId: order.id,
            productId: item.productId,
            productName: item.product.name,
            orderDate: order.createdAt
          });
          console.log('Item needs review:', {
            orderId: order.id,
            productName: item.product.name,
            orderDate: order.createdAt
          });
        }
      });
    });

    return NextResponse.json({ 
      count: unreviewedItems.length,
      orders: deliveredOrders.map(order => ({
        id: order.id,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          hasReviewed: item.product.reviews.some(review => 
            review.createdAt > order.createdAt
          )
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