import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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
        const bytes = await profileImage.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const filename = `profile-${uniqueSuffix}.${profileImage.name.split('.').pop()}`;
        
        // Ensure uploads directory exists
        const publicDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(publicDir)) {
          await mkdir(publicDir, { recursive: true });
        }
        
        // Save file
        await writeFile(join(publicDir, filename), buffer);
        
        updateData.image = `/uploads/${filename}`;
      } catch (error) {
        console.error('Error saving image:', error);
        return NextResponse.json(
          { error: 'Gagal menyimpan gambar' },
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