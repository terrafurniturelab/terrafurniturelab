import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, image } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email dan nama diperlukan" },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        email,
        name,
        image,
      }
    });

    return NextResponse.json({
      message: 'Registrasi berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image
      }
    });
  } catch (error) {
    console.error("Google registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftar" },
      { status: 500 }
    );
  }
} 