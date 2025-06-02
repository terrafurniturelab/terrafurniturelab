import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Received address data:', body);

    const { fullName, phoneNumber, province, city, kecamatan, kodePos, alamatLengkap } = body;

    // Validate all required fields
    const missingFields = [];
    if (!fullName) missingFields.push('fullName');
    if (!phoneNumber) missingFields.push('phoneNumber');
    if (!province) missingFields.push('province');
    if (!city) missingFields.push('city');
    if (!kecamatan) missingFields.push('kecamatan');
    if (!kodePos) missingFields.push('kodePos');
    if (!alamatLengkap) missingFields.push('alamatLengkap');

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await prisma.$queryRaw`
      INSERT INTO "Address" ("id", "fullName", "phoneNumber", "province", "city", "kecamatan", "kodePos", "alamatLengkap", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${fullName}, ${phoneNumber}, ${province}, ${city}, ${kecamatan}, ${kodePos}, ${alamatLengkap}, NOW(), NOW())
      RETURNING *
    `;

    const address = Array.isArray(result) ? result[0] : result;
    console.log('Address created successfully:', address);
    return NextResponse.json(address);
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 