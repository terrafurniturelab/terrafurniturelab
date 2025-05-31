import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token } = body;

  if (!email || !token) {
      return NextResponse.json(
        { error: "Email dan token diperlukan" },
        { status: 400 }
      );
  }

    // Cek token di pendingUser
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { email }
    });

    if (!pendingUser) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak ditemukan" },
        { status: 400 }
      );
    }

    if (pendingUser.token !== token) {
      return NextResponse.json(
        { error: "Token tidak valid" },
        { status: 400 }
      );
  }

    if (pendingUser.expiredAt < new Date()) {
      return NextResponse.json(
        { error: "Token sudah kadaluarsa" },
        { status: 400 }
      );
  }

    // Buat user baru
    const user = await prisma.user.create({
    data: {
        name: pendingUser.name,
        email: pendingUser.email,
        password: pendingUser.password,
      }
  });

    // Hapus data pendingUser
    await prisma.pendingUser.delete({
      where: { email }
    });

    return NextResponse.json({
      message: 'Verifikasi berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat verifikasi" },
      { status: 500 }
    );
  }
} 