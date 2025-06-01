import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('Login attempt:', { 
      email, 
      passwordLength: password?.length,
      password: password // temporary for debugging
    });

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    console.log('Found admin:', {
      found: !!admin,
      adminEmail: admin?.email,
      storedPasswordHash: admin?.password?.substring(0, 10) + '...',
      storedPasswordLength: admin?.password?.length
    });

    if (!admin) {
      console.log('Admin not found with email:', email);
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    console.log('Password validation:', {
      isValid: isValidPassword,
      inputPassword: password, // temporary for debugging
      inputPasswordLength: password?.length,
      storedHashLength: admin.password?.length
    });

    if (!isValidPassword) {
      console.log('Invalid password for admin:', email);
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id,
        email: admin.email
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Set cookie
    const response = NextResponse.json(
      { 
        message: 'Login berhasil',
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name
        }
      },
      { status: 200 }
    );

    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
} 