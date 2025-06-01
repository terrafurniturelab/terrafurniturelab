import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all required statistics in parallel
    const [
      totalCategories,
      totalProductTypes,
      totalUsers,
      totalOrders,
      totalDelivered,
      totalRevenue,
      averageOrderValue
    ] = await Promise.all([
      // Total Categories
      prisma.category.count(),
      
      // Total Products
      prisma.product.count(),
      
      // Total Users
      prisma.user.count(),
      
      // Total Orders (Checkouts)
      prisma.checkout.count(),
      
      // Total Delivered Orders
      prisma.checkout.count({
        where: {
          state: 'DELIVERED'
        }
      }),
      
      // Total Revenue
      prisma.checkout.aggregate({
        where: {
          state: {
            in: ['DELIVERED', 'SHIPPED', 'PROCESSING']
          }
        },
        _sum: {
          quantity: true
        }
      }).then(async (result) => {
        const totalQuantity = result._sum.quantity || 0;
        const checkouts = await prisma.checkout.findMany({
          where: {
            state: {
              in: ['DELIVERED', 'SHIPPED', 'PROCESSING']
            }
          },
          include: {
            product: true
          }
        });
        return checkouts.reduce((sum, checkout) => 
          sum + (checkout.quantity * checkout.product.price), 0
        );
      }),
      
      // Average Order Value
      prisma.checkout.aggregate({
        where: {
          state: {
            in: ['DELIVERED', 'SHIPPED', 'PROCESSING']
          }
        },
        _avg: {
          quantity: true
        }
      }).then(async (result) => {
        const avgQuantity = result._avg.quantity || 0;
        const checkouts = await prisma.checkout.findMany({
          where: {
            state: {
              in: ['DELIVERED', 'SHIPPED', 'PROCESSING']
            }
          },
          include: {
            product: true
          }
        });
        const totalValue = checkouts.reduce((sum, checkout) => 
          sum + (checkout.quantity * checkout.product.price), 0
        );
        return checkouts.length > 0 ? totalValue / checkouts.length : 0;
      })
    ]);

    return NextResponse.json({
      totalCategories,
      totalProductTypes, // Using categories as product types
      totalProducts: await prisma.product.aggregate({
        _sum: {
          stock: true
        }
      }).then(result => result._sum.stock || 0),
      totalUsers,
      totalOrders,
      totalDelivered,
      totalRevenue,
      averageOrderValue
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 