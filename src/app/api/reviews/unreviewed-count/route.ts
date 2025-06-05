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

    // Get delivered orders that haven't been reviewed
    const unreviewedOrders = await prisma.checkout.findMany({
      where: {
        userId: session.user.id,
        state: 'DELIVERED',
        items: {
          some: {
            product: {
              reviews: {
                none: {
                  userId: session.user.id
                }
              }
            }
          }
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Count unique products that need review
    const productsToReview = new Set();
    unreviewedOrders.forEach(order => {
      order.items.forEach(item => {
        productsToReview.add(item.productId);
      });
    });

    return NextResponse.json({ 
      count: productsToReview.size,
      orders: unreviewedOrders.map(order => ({
        id: order.id,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity
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