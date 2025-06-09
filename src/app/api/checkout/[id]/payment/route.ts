import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Checking checkout:', {
      checkoutId: id,
      userId: session.user.id
    });

    // Verify checkout exists and belongs to user
    const existingCheckout = await prisma.checkout.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCheckout) {
      console.log('Checkout not found:', {
        checkoutId: id,
        userId: session.user.id
      });
      return NextResponse.json(
        { error: 'Checkout not found or unauthorized' },
        { status: 404 }
      );
    }

    console.log('Checkout found:', existingCheckout);

    const formData = await request.formData();
    const paymentProof = formData.get('paymentProof') as File;
    const bank = formData.get('bank') as string;

    if (!paymentProof || !bank) {
      console.log('Missing required fields:', { paymentProof: !!paymentProof, bank: !!bank });
      return NextResponse.json(
        { error: 'Payment proof and bank are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!paymentProof.type.startsWith('image/')) {
      console.log('Invalid file type:', paymentProof.type);
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'payments');
    if (!existsSync(uploadsDir)) {
      try {
        await mkdir(uploadsDir, { recursive: true });
        console.log('Created uploads directory:', uploadsDir);
      } catch (error) {
        console.error('Error creating uploads directory:', error);
        return NextResponse.json(
          { error: 'Failed to create uploads directory' },
          { status: 500 }
        );
      }
    }

    // Generate unique filename
    const bytes = await paymentProof.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${paymentProof.name}`;
    const filepath = join(uploadsDir, filename);

    try {
      // Save file
      await writeFile(filepath, buffer);
      console.log('File saved successfully:', filepath);
    } catch (error) {
      console.error('Error saving file:', error);
      return NextResponse.json(
        { error: 'Failed to save payment proof file' },
        { status: 500 }
      );
    }

    try {
      // Update checkout with payment proof
      const checkout = await prisma.checkout.update({
        where: {
          id,
        },
        data: {
          paymentProof: `/uploads/payments/${filename}`,
          state: 'PROCESSING',
        },
      });
      console.log('Checkout updated successfully:', checkout.id);
      return NextResponse.json(checkout);
    } catch (error) {
      console.error('Error updating checkout:', error);
      // Try to delete the uploaded file if database update fails
      try {
        await writeFile(filepath, ''); // Clear the file
        console.log('Cleared uploaded file after database error');
      } catch (deleteError) {
        console.error('Error clearing uploaded file:', deleteError);
      }
      return NextResponse.json(
        { error: 'Failed to update checkout with payment proof' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in payment proof upload:', error);
    return NextResponse.json(
      { error: 'Failed to upload payment proof' },
      { status: 500 }
    );
  }
} 