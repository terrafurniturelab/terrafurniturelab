import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all required statistics in parallel
    const [
      totalCategories,
      totalProductTypes,
      totalProducts,
      totalUsers,
      totalOrders,
      deliveredOrders,
      recentOrders,
      productsByCategory,
      lowStockProducts
    ] = await Promise.all([
      // Total Categories (count of category IDs)
      prisma.category.count(),

      // Total Product Types (count of product IDs)
      prisma.product.count(),

      // Total Products (sum of all product stocks)
      prisma.product.aggregate({
        _sum: {
          stock: true
        }
      }),

      // Total Users (count of user IDs)
      prisma.user.count(),

      // Total Orders (count of checkout IDs, excluding CANCELLED)
      prisma.checkout.count({
        where: {
          state: {
            not: 'CANCELLED'
          }
        }
      }),

      // Delivered Orders (count of checkouts with DELIVERED status)
      prisma.checkout.count({
        where: {
          state: 'DELIVERED'
        }
      }),

      // Recent Orders (excluding CANCELLED)
      prisma.checkout.findMany({
        take: 5,
        where: {
          state: {
            not: 'CANCELLED'
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: true,
          address: true
        }
      }),

      // Products by Category
      prisma.product.groupBy({
        by: ['categoryId'],
        _count: {
          categoryId: true
        }
      }),

      // Low Stock Products (less than 10 items)
      prisma.product.findMany({
        where: {
          stock: {
            lt: 10
          }
        },
        include: {
          category: true
        }
      })
    ]);

    // Get total revenue (sum of all checkout items prices, excluding CANCELLED orders)
    const orders = await prisma.checkout.findMany({
      where: {
        state: {
          not: 'CANCELLED'
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

    // Calculate total revenue
    const totalRevenue = orders.reduce((total, order) => {
      const orderTotal = order.items.reduce((orderSum, item) => {
        return orderSum + (item.product.price * item.quantity);
      }, 0);
      return total + orderTotal;
    }, 0);

    // Get category names for products by category
    const categoryNames = await prisma.category.findMany({
      select: {
        id: true,
        name: true
      }
    });

    // Map category IDs to names
    const productsByCategoryWithNames = productsByCategory.map(cat => ({
      categoryId: cat.categoryId,
      categoryName: categoryNames.find(c => c.id === cat.categoryId)?.name || 'Unknown',
      count: cat._count.categoryId
    }));

    return NextResponse.json({
      totalCategories,
      totalProductTypes,
      totalProducts: totalProducts._sum.stock || 0,
      totalUsers,
      totalOrders,
      deliveredOrders,
      totalRevenue,
      recentOrders,
      productsByCategory: productsByCategoryWithNames,
      lowStockProducts
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
} 