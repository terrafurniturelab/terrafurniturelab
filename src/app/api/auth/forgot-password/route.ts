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

    // Generate token and set expiration
    const token = generateToken();
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save reset token
    await prisma.resetToken.upsert({
      where: { email },
      update: {
        token,
        expiredAt
      },
      create: {
        email,
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
      subject: 'Reset Kata Sandi',
      text: `Kode verifikasi Anda adalah: ${token}\n\nKode ini akan kadaluarsa dalam 15 menit.`,
      html: `
        <h1>Reset Kata Sandi</h1>
        <p>Kode verifikasi Anda adalah: <strong>${token}</strong></p>
        <p>Kode ini akan kadaluarsa dalam 15 menit.</p>
      `
    });

    return NextResponse.json({
      message: 'Kode verifikasi telah dikirim ke email Anda'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses permintaan' },
      { status: 500 }
    );
  }
} 