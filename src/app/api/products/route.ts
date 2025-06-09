import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const ids = searchParams.get('ids');

    if (ids) {
      // Handle multiple product IDs
      const productIds = ids.split(',').filter(Boolean);
      if (productIds.length === 0) {
        return NextResponse.json({ error: 'No product IDs provided' }, { status: 400 });
      }

      const products = await prisma.product.findMany({
        where: {
          id: {
            in: productIds
          }
        },
        include: {
          category: true
        }
      });

      return NextResponse.json(products);
    }

    // If no IDs provided, return all products with optional limit
    const products = await prisma.product.findMany({
      take: limit ? parseInt(limit) : undefined,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        category: true
      }
    });

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'No products found' }, { status: 404 });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 