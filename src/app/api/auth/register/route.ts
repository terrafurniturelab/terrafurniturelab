import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function generateToken() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password diperlukan" },
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

    // Generate token dan hash password
    const token = generateToken();
    const hashedPassword = await bcrypt.hash(password, 10);
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

    // Simpan ke pendingUser
    await prisma.pendingUser.upsert({
        where: { email },
        update: {
        name,
          password: hashedPassword,
          token,
          expiredAt
        },
        create: {
        name,
          email,
          password: hashedPassword,
          token,
          expiredAt
        }
      });

    // Kirim email verifikasi
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Verifikasi Email Anda',
        text: `Kode verifikasi Anda adalah: ${token}\n\nKode ini akan kadaluarsa dalam 15 menit.`,
        html: `
          <h1>Verifikasi Email Anda</h1>
          <p>Kode verifikasi Anda adalah: <strong>${token}</strong></p>
          <p>Kode ini akan kadaluarsa dalam 15 menit.</p>
        `
      });

      return NextResponse.json({
        message: 'Kode verifikasi telah dikirim ke email Anda'
      });
    } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftar" },
      { status: 500 }
    );
  }
} 