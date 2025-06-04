import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutState } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = {
      userId: session.user.id,
      ...(status && status !== "semua" && {
        state: statusMap[status] as CheckoutState,
      }),
    };

    const orders = await prisma.checkout.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

const statusMap: Record<string, CheckoutState> = {
  diproses: "PROCESSING",
  dikirim: "SHIPPED",
  selesai: "DELIVERED",
  ditunda: "PENDING",
  dibatalkan: "CANCELLED",
}; 