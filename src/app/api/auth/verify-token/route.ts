import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, token } = await req.json();
  if (!email || !token) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Cari pending_user
  const pending = await prisma.pending_user.findUnique({ where: { email } });
  if (!pending || pending.token !== token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
  if (pending.expiredAt < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 400 });
  }

  // Simpan ke tabel user
  await prisma.user.create({
    data: {
      nama: pending.nama,
      email: pending.email,
      pw: pending.pw,
    },
  });

  // Hapus dari pending_user
  await prisma.pending_user.delete({ where: { email } });

  return NextResponse.json({ message: 'Registration successful' });
} 