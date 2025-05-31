import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

function generateToken() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email diperlukan" },
        { status: 400 }
      );
    }

    // Cek apakah ada data pending
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { email }
    });

    if (!pendingUser) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak ditemukan" },
        { status: 400 }
      );
    }

    // Generate token baru
    const token = generateToken();
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

    // Update token
    await prisma.pendingUser.update({
      where: { email },
      data: {
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
      message: 'Token baru telah dikirim ke email Anda'
    });
  } catch (error) {
    console.error("Resend token error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengirim ulang token" },
      { status: 500 }
    );
  }
} 