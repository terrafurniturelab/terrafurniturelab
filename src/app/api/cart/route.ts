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
            items: {
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
            },
          },
        },
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // If user doesn't have a cart, create one
    if (!user.cart) {
      try {
        const newCart = await prisma.cart.create({
          data: {
            userId: user.id,
          },
          include: {
            items: {
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
            },
          },
        });
        return NextResponse.json(newCart.items);
      } catch (error) {
        // If cart creation fails due to unique constraint, try to fetch existing cart
        const existingCart = await prisma.cart.findUnique({
          where: { userId: user.id },
          include: {
            items: {
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
            },
          },
        });
        if (existingCart) {
          return NextResponse.json(existingCart.items);
        }
        throw error;
      }
    }

    return NextResponse.json(user.cart.items);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

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

    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    // Create cart if it doesn't exist
    let cart = user.cart;
    if (!cart) {
      try {
        cart = await prisma.cart.create({
          data: {
            userId: user.id,
          },
        });
      } catch (error) {
        // If cart creation fails due to unique constraint, try to fetch existing cart
        cart = await prisma.cart.findUnique({
          where: { userId: user.id },
        });
        if (!cart) {
          throw error;
        }
      }
    }

    // Check if product is already in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity if product is already in cart
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
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
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
        },
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
    }

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 