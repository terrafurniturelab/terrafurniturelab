import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define type for Cloudinary upload result
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
}

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

    // Convert file to buffer
    const bytes = await paymentProof.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'furniture-lab/payments',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      ).end(buffer);
    });

    try {
      // Update checkout with payment proof
      const checkout = await prisma.checkout.update({
        where: {
          id,
        },
        data: {
          paymentProof: result.secure_url,
          state: 'PROCESSING',
        },
      });
      console.log('Checkout updated successfully:', checkout.id);
      return NextResponse.json(checkout);
    } catch (error) {
      console.error('Error updating checkout:', error);
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