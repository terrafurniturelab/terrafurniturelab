import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const processingCount = await prisma.checkout.count({
      where: {
        state: 'PROCESSING'
      }
    });
    
    return NextResponse.json({ processingCount });
  } catch (error) {
    console.error('Error fetching processing orders count:', error);
    return NextResponse.json({ error: 'Failed to fetch processing orders count' }, { status: 500 });
  }
} 