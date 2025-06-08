import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || !comment) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Validate rating is between 1 and 5
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return new NextResponse('Invalid rating value', { status: 400 });
    }

    // Validate comment is not empty and has reasonable length
    if (typeof comment !== 'string' || comment.trim().length === 0 || comment.length > 1000) {
      return new NextResponse('Invalid comment', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        rating: Number(rating),
        comment: comment.trim(),
        userId: user.id,
        isFeatured: false,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('[FEEDBACK_POST]', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';

    if (isAdmin) {
      // Get admin token from cookies
      const cookieStore = await cookies();
      const adminToken = cookieStore.get('adminToken');

      if (!adminToken) {
        console.log('No admin token found');
        return new NextResponse('Unauthorized', { status: 401 });
      }

      try {
        // Verify JWT token
        const decoded = jwt.verify(
          adminToken.value,
          process.env.JWT_SECRET || 'your-secret-key'
        ) as { id: string; email: string };

        console.log('Decoded admin token:', decoded);

        // Check if admin exists
        const admin = await prisma.admin.findUnique({
          where: { id: decoded.id }
        });

        if (!admin) {
          console.log('Admin not found:', decoded);
          return new NextResponse('Unauthorized', { status: 401 });
        }

        const feedbacks = await prisma.feedback.findMany({
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        console.log('Found feedbacks:', feedbacks.length);
        return NextResponse.json(feedbacks);
      } catch (error) {
        console.error('Token verification error:', error);
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    // For public access, only return featured feedbacks
    const featuredFeedbacks = await prisma.feedback.findMany({
      where: {
        isFeatured: true,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    return NextResponse.json(featuredFeedbacks);
  } catch (error) {
    console.error('[FEEDBACK_GET]', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    // Get admin token from cookies
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('adminToken');

    if (!adminToken) {
      console.log('No admin token found');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(
        adminToken.value,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as { id: string; email: string };

      console.log('Decoded admin token:', decoded);

      // Check if admin exists
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id }
      });

      if (!admin) {
        console.log('Admin not found:', decoded);
        return new NextResponse('Unauthorized', { status: 401 });
      }

      const body = await req.json();
      const { feedbackId, isFeatured } = body;

      if (typeof feedbackId !== 'string' || typeof isFeatured !== 'boolean') {
        return new NextResponse('Invalid request body', { status: 400 });
      }

      // If trying to feature a feedback, check if we already have 3 featured
      if (isFeatured) {
        const featuredCount = await prisma.feedback.count({
          where: { isFeatured: true }
        });

        if (featuredCount >= 3) {
          return new NextResponse(
            JSON.stringify({ error: 'Maksimal 3 feedback yang dapat ditampilkan' }), 
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      const feedback = await prisma.feedback.update({
        where: { id: feedbackId },
        data: {
          isFeatured,
          adminId: isFeatured ? admin.id : null,
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      return NextResponse.json(feedback);
    } catch (error) {
      console.error('Token verification error:', error);
      return new NextResponse('Unauthorized', { status: 401 });
    }
  } catch (error) {
    console.error('[FEEDBACK_PATCH]', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 