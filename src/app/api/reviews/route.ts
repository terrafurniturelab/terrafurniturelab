import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { orderId, productId, review, rating } = body;

    if (!orderId || !productId || !review || !rating) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get the order to check if it's delivered and belongs to the user
    const order = await prisma.checkout.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        state: "DELIVERED",
      },
      include: {
        items: {
          where: {
            productId: productId
          }
        }
      }
    });

    if (!order || order.items.length === 0) {
      return new NextResponse("Order or product not found or not eligible for review", { status: 404 });
    }

    // Check if user has already reviewed this product for this specific order
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        productId: productId,
        orderId: orderId,
        createdAt: {
          gt: order.createdAt
        }
      }
    });

    if (existingReview) {
      return new NextResponse("You have already reviewed this product for this order", { status: 400 });
    }

    // Create review for this product
    await prisma.review.create({
      data: {
        rating: rating,
        comment: review,
        productId: productId,
        userId: session.user.id,
        orderId: orderId // Add orderId to track which order this review is for
      }
    });

    // Update product rating
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        reviews: true,
      }
    });

    if (product) {
      const totalRating = product.reviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = totalRating / product.reviews.length;

      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: averageRating,
          reviewCount: product.reviews.length,
        }
      });
    }

    return new NextResponse("Review submitted successfully", { status: 200 });
  } catch (error) {
    console.error("[REVIEWS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 