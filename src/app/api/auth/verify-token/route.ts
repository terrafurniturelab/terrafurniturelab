import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, token } = await req.json();
  if (!email || !token) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Cari pendingUser
  const pending = await prisma.pendingUser.findUnique({ where: { email } });
  if (!pending || pending.token !== token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
  if (pending.expiredAt < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 400 });
  }

  // Simpan ke tabel User
  await prisma.user.create({
    data: {
      email: pending.email,
      password: pending.password,
      name: pending.name,
    },
  });

  // Hapus dari pendingUser
  await prisma.pendingUser.delete({ where: { email } });

  return NextResponse.json({ message: 'Registration successful' });
} 