import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function generateToken() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();
    
    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Check if email already exists in User table
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Check if email exists in pendingUser table
    const existingPendingUser = await prisma.pendingUser.findUnique({
      where: { email }
    });

    // Generate token and hash password
    const token = generateToken();
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Save to pendingUser
      await prisma.pendingUser.upsert({
        where: { email },
        update: {
          name: username,
          password: hashedPassword,
          token,
          expiredAt
        },
        create: {
          name: username,
          email,
          password: hashedPassword,
          token,
          expiredAt
        }
      });

      // Send verification email
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
      console.error('Database or email error:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return NextResponse.json(
        { error: 'Terjadi kesalahan saat menyimpan data atau mengirim email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
} 