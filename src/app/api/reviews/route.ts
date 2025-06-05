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
    const { orderId, review, rating } = body;

    if (!orderId || !review || !rating) {
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
        items: true,
      },
    });

    if (!order) {
      return new NextResponse("Order not found or not eligible for review", { status: 404 });
    }

    // Create reviews for all products in the order
    const reviewPromises = order.items.map(async (item) => {
      // Check if user has already reviewed this product
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: session.user.id,
          productId: item.productId,
        },
      });

      if (!existingReview) {
        // Create review for this product
        await prisma.review.create({
          data: {
            rating: rating,
            comment: review,
            productId: item.productId,
            userId: session.user.id,
          },
        });

        // Update product rating
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            reviews: true,
          },
        });

        if (product) {
          const totalRating = product.reviews.reduce((acc, review) => acc + review.rating, 0);
          const averageRating = totalRating / product.reviews.length;

          await prisma.product.update({
            where: { id: item.productId },
            data: {
              rating: averageRating,
              reviewCount: product.reviews.length,
            },
          });
        }
      }
    });

    await Promise.all(reviewPromises);

    return new NextResponse("Review submitted successfully", { status: 200 });
  } catch (error) {
    console.error("[REVIEWS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 