import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

function generateToken() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const { username, email, password } = await req.json();
  if (!username || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Cek apakah email sudah terdaftar di user
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
  }

  // Generate token
  const token = generateToken();
  const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

  // Simpan ke pending_user
  await prisma.pending_user.upsert({
    where: { email },
    update: { nama: username, pw: password, token, expiredAt },
    create: { nama: username, email, pw: password, token, expiredAt },
  });

  // Konfigurasi Nodemailer pakai .env
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true jika port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your verification token',
    text: `Your verification token is: ${token}`,
  });

  return NextResponse.json({ message: 'Token sent to email' });
} 