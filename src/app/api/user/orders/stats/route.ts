import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await prisma.order.groupBy({
      by: ['status'],
      where: {
        userId: session.user.id,
      },
      _count: {
        id: true,
      },
    });

    const formattedStats = {
      total: 0,
      delivered: 0,
      processing: 0,
      pending: 0,
    };

    stats.forEach((stat) => {
      formattedStats.total += stat._count.id;
      switch (stat.status) {
        case 'DELIVERED':
          formattedStats.delivered = stat._count.id;
          break;
        case 'PROCESSING':
          formattedStats.processing = stat._count.id;
          break;
        case 'PENDING':
          formattedStats.pending = stat._count.id;
          break;
      }
    });

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order statistics' },
      { status: 500 }
    );
  }
} 