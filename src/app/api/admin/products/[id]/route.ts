import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Await params since it's now a Promise
    const { id } = await params;
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const stock = parseInt(formData.get('stock') as string);
    const price = parseInt(formData.get('price') as string);
    const categoryId = formData.get('categoryId') as string;
    const images = formData.getAll('images[]') as string[];
    const newImages = formData.getAll('newImages') as File[];

    console.log('Received form data:', {
      name,
      description,
      stock,
      price,
      categoryId,
      existingImages: images.length,
      newImages: newImages.length
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
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
    let finalImages = [...images];
    
    if (newImages.length > 0) {
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

        const newImageUrls = await Promise.all(uploadPromises);
        finalImages = [...finalImages, ...newImageUrls];
      } catch (uploadError) {
        console.error('Error during image upload:', uploadError);
        return NextResponse.json(
          { error: 'Gagal mengunggah gambar: ' + (uploadError as Error).message },
          { status: 500 }
        );
      }
    }

    // Only validate total images if this is a new product
    if (!existingProduct && finalImages.length === 0) {
      return NextResponse.json(
        { error: 'Produk harus memiliki minimal 1 gambar' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        stock,
        price,
        images: finalImages.length > 0 ? finalImages : undefined, // Only update images if new ones are provided
        categoryId,
      },
      include: {
        category: true,
      },
    });

    console.log('Successfully updated product:', product);
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui produk: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Await params since it's now a Promise
    const { id } = await params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        cartItems: true,
        checkoutItems: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product is in use
    if (existingProduct.cartItems.length > 0 || existingProduct.checkoutItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product that is in use' },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}