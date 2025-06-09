import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
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

interface UserUpdateData {
  name?: string;
  password?: string;
  image?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const profileImage = formData.get('profileImage') as File;

    const updateData: UserUpdateData = { name };

    // Handle password update if provided
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true }
      });

      if (!user?.password) {
        return NextResponse.json(
          { error: 'Password update not available for social login accounts' },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Handle profile image upload
    if (profileImage) {
      // Validate file type
      if (!profileImage.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'File harus berupa gambar' },
          { status: 400 }
        );
      }

      // Validate file size (max 2MB)
      if (profileImage.size > 2 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Ukuran file terlalu besar. Maksimal 2MB' },
          { status: 400 }
        );
      }

      try {
        // Convert file to buffer
        const bytes = await profileImage.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'furniture-lab/profiles',
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as CloudinaryUploadResult);
            }
          ).end(buffer);
        });

        updateData.image = result.secure_url;
      } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
          { error: 'Gagal mengupload gambar' },
          { status: 500 }
        );
      }
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate profil' },
      { status: 500 }
    );
  }
} 