import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const order = await prisma.checkout.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Add hasReview flag to each item
    const itemsWithReviewStatus = await Promise.all(
      order.items.map(async (item) => {
        const review = await prisma.review.findFirst({
          where: {
            userId: session.user.id,
            productId: item.productId,
          },
        });
        return {
          ...item,
          hasReview: !!review,
        };
      })
    );

    return NextResponse.json({
      ...order,
      items: itemsWithReviewStatus,
    });
  } catch (error) {
    console.error("[ORDER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 