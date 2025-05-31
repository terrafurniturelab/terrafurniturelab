import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

function generateToken() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email harus diisi' },
        { status: 400 }
      );
    }

    // Check if email exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email tidak terdaftar' },
        { status: 404 }
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
      subject: 'Reset Kata Sandi - Kode Baru',
      text: `Kode verifikasi baru Anda adalah: ${token}\n\nKode ini akan kadaluarsa dalam 15 menit.`,
      html: `
        <h1>Reset Kata Sandi - Kode Baru</h1>
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