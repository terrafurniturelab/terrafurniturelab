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

      // Total Orders (count of checkout IDs)
      prisma.checkout.count(),

      // Delivered Orders (count of checkouts with DELIVERED status)
      prisma.checkout.count({
        where: {
          state: 'DELIVERED'
        }
      }),

      // Recent Orders
      prisma.checkout.findMany({
        take: 5,
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

    // Get total revenue (sum of all checkout items prices)
    const orders = await prisma.checkout.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    const totalRevenue = orders.reduce((total, order) => {
      const orderTotal = order.items.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);
      return total + orderTotal;
    }, 0);

    // Get category names for products by category
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: productsByCategory.map(p => p.categoryId)
        }
      }
    });

    const productsByCategoryWithNames = productsByCategory.map(p => ({
      categoryId: p.categoryId,
      count: p._count.categoryId,
      categoryName: categories.find(c => c.id === p.categoryId)?.name || 'Uncategorized'
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