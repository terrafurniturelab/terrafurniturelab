'use client';

import React from 'react';
import ProductCard from './ProductCard';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  rating: number;
  reviewCount: number;
}

interface ProductGridProps {
  title: string;
  products: Product[];
}

export default function ProductGrid({ title, products }: ProductGridProps) {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-coklat-tua">{title}</h2>
          <Link href="/products" className="text-[#472D2D] hover:text-[#2c1818]">
            Lihat Semua &#10140;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
} 