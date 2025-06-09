import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const stats = await prisma.checkout.groupBy({
      by: ['state'],
      where: {
        userId: session.user.id,
      },
      _count: {
        _all: true,
      },
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[ORDER_STATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 