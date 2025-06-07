import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        cart: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // If user doesn't have a cart, return 0
    if (!user.cart) {
      return NextResponse.json({ count: 0 });
    }

    // Calculate total quantity of all items in cart
    const totalQuantity = user.cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({ count: totalQuantity });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 