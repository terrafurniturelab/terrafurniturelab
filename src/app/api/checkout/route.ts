import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('No user session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Received checkout data:', body);

    const { productId, quantity, addressId, paymentProof } = body;

    if (!productId || !quantity || !addressId) {
      console.error('Missing required fields:', { productId, quantity, addressId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Cari admin pertama yang ada di database
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      return NextResponse.json({ error: 'No admin found' }, { status: 500 });
    }

    console.log('Creating checkout with data:', {
      userId: session.user.id,
      productId,
      quantity,
      addressId,
      paymentProof,
      adminId: admin.id,
    });

    const result = await prisma.$queryRaw`
      INSERT INTO "Checkout" (
        "id", "quantity", "state", "paymentProof", "createdAt", "updatedAt",
        "userId", "productId", "addressId", "adminId"
      )
      VALUES (
        gen_random_uuid(), ${quantity}, 'PENDING', ${paymentProof || null},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
        ${session.user.id}, ${productId}, ${addressId}, ${admin.id}
      )
      RETURNING *;
    `;

    const checkout = Array.isArray(result) ? result[0] : result;
    console.log('Checkout created successfully:', checkout);
    return NextResponse.json(checkout);
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 