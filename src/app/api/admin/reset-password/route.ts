import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, token, newPassword } = await request.json();

    // Validate input
    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Check reset token
    const resetRequest = await prisma.resetToken.findUnique({
      where: { email }
    });

    if (!resetRequest) {
      return NextResponse.json(
        { error: 'Permintaan reset password tidak ditemukan' },
        { status: 404 }
      );
    }

    if (resetRequest.token !== token) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 400 }
      );
    }

    if (resetRequest.expiredAt < new Date()) {
      return NextResponse.json(
        { error: 'Token sudah kadaluarsa' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update admin password
    await prisma.admin.update({
      where: { email },
      data: { password: hashedPassword }
    });

    // Delete reset token
    await prisma.resetToken.delete({
      where: { email }
    });

    return NextResponse.json({
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengubah password' },
      { status: 500 }
    );
  }
} 