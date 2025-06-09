import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { itemId } = await params;

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        cart: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (!user.cart) {
      return new NextResponse('Cart not found', { status: 404 });
    }

    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return new NextResponse('Invalid quantity', { status: 400 });
    }

    // Check if cart item exists and belongs to user's cart
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: user.cart.id,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      return new NextResponse('Cart item not found', { status: 404 });
    }

    // Check if quantity exceeds product stock
    if (quantity > cartItem.product.stock) {
      return new NextResponse('Quantity exceeds available stock', { status: 400 });
    }

    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true,
          },
        },
      },
    });

    // Get updated cart count
    const updatedCart = await prisma.cart.findUnique({
      where: { id: user.cart.id },
      include: {
        items: true,
      },
    });

    if (!updatedCart) {
      return new NextResponse('Failed to fetch updated cart', { status: 500 });
    }

    const totalQuantity = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      cartItem: updatedCartItem,
      totalQuantity,
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { itemId } = await params;

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        cart: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (!user.cart) {
      return new NextResponse('Cart not found', { status: 404 });
    }

    // Check if cart item exists and belongs to user's cart
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: user.cart.id,
      },
    });

    if (!cartItem) {
      return new NextResponse('Cart item not found', { status: 404 });
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    // Get updated cart count
    const updatedCart = await prisma.cart.findUnique({
      where: { id: user.cart.id },
      include: {
        items: true,
      },
    });

    if (!updatedCart) {
      return new NextResponse('Failed to fetch updated cart', { status: 500 });
    }

    const totalQuantity = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({ totalQuantity });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 