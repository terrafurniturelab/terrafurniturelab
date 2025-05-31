import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

function generateToken() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  // Cari pendingUser
  const pending = await prisma.pendingUser.findUnique({ where: { email } });
  if (!pending) {
    return NextResponse.json({ error: 'No pending registration for this email' }, { status: 400 });
  }

  // Generate token baru
  const token = generateToken();
  const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

  // Update pendingUser
  await prisma.pendingUser.update({
    where: { email },
    data: { token, expiredAt },
  });

  // Kirim ulang email
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
    subject: 'Your verification token (Resend)',
    text: `Your new verification token is: ${token}`,
  });

  return NextResponse.json({ message: 'Token resent to email' });
} 