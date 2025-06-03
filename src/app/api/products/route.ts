import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
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

    // If no IDs provided, return all products
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 