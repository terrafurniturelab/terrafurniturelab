import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

function generateToken() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email diperlukan' },
        { status: 400 }
      );
    }

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Email tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if there's an existing reset token
    const existingToken = await prisma.resetToken.findUnique({
      where: { email }
    });

    if (!existingToken) {
      return NextResponse.json(
        { error: 'Tidak ada permintaan reset password yang aktif' },
        { status: 400 }
      );
    }

    // Generate new token and set expiration
    const token = generateToken();
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update reset token
    await prisma.resetToken.update({
      where: { email },
      data: {
        token,
        expiredAt
      }
    });

    // Send email
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
      subject: 'Reset Kata Sandi Admin - Kode Baru',
      text: `Kode verifikasi baru Anda adalah: ${token}\n\nKode ini akan kadaluarsa dalam 15 menit.`,
      html: `
        <h1>Reset Kata Sandi Admin - Kode Baru</h1>
        <p>Kode verifikasi baru Anda adalah: <strong>${token}</strong></p>
        <p>Kode ini akan kadaluarsa dalam 15 menit.</p>
      `
    });

    return NextResponse.json({
      message: 'Kode verifikasi baru telah dikirim ke email Anda'
    });
  } catch (error) {
    console.error('Resend token error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim ulang token' },
      { status: 500 }
    );
  }
} 