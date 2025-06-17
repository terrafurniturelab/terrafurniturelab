import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken');

    if (!token) {
      console.log('No admin token found in cookies');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Fetching products...');
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log(`Found ${products.length} products`);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as { id: string };

    // Verify admin exists
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin tidak ditemukan' },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const stock = parseInt(formData.get('stock') as string);
    const price = parseInt(formData.get('price') as string);
    const categoryId = formData.get('categoryId') as string;
    const newImages = formData.getAll('newImages') as File[];

    console.log('Received form data:', {
      name,
      description,
      stock,
      price,
      categoryId,
      imageCount: newImages.length
    });

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Nama produk harus diisi' },
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        { error: 'Deskripsi produk harus diisi' },
        { status: 400 }
      );
    }

    if (isNaN(stock) || stock < 0) {
      return NextResponse.json(
        { error: 'Stok tidak valid' },
        { status: 400 }
      );
    }

    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Harga harus lebih dari 0' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Kategori harus dipilih' },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Handle image uploads
    if (newImages.length === 0) {
      return NextResponse.json(
        { error: 'Produk harus memiliki minimal 1 gambar' },
        { status: 400 }
      );
    }

    try {
      const uploadPromises = newImages.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Use absolute URL for production
        const uploadUrl = process.env.NODE_ENV === 'production' 
          ? 'https://www.terrafurniturelab.shop/api/upload'
          : '/api/upload';
          
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Gagal mengunggah gambar');
        }
        
        const data = await response.json();
        return data.url;
      });

      const imageUrls = await Promise.all(uploadPromises);
      console.log('Successfully uploaded images:', imageUrls);

      const product = await prisma.product.create({
        data: {
          name,
          description,
          stock,
          price,
          images: imageUrls,
          categoryId,
          adminId: admin.id,
        },
        include: {
          category: true,
        },
      });

      console.log('Successfully created product:', product);
      return NextResponse.json(product);
      
    } catch (uploadError) {
      console.error('Error during image upload:', uploadError);
      return NextResponse.json(
        { error: 'Gagal mengunggah gambar: ' + (uploadError as Error).message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat produk: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 