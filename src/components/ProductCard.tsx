'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';

interface Product {
  id: string;
  name: string;
  images: string[];
  description: string;
  stock: number;
  price: number;
  rating: number;
  reviewCount: number;
  categoryId: string;
  category: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export default function ProductCard(product: Product) {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);

  // Ensure we have a valid image URL
  const imageUrl = product.images[0] || '/placeholder.png';

  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-square w-full overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={false}
            unoptimized={imageUrl.startsWith('https://res.cloudinary.com')}
          />
        </Link>
      </div>
      <div className="p-3 sm:p-6 flex flex-col flex-grow">
        <Link href={`/products/${product.id}`} className="block space-y-1 sm:space-y-2">
          <span className="inline-block bg-[#472D2D] text-white text-[10px] sm:text-xs px-2 py-1 rounded-md">
            {product.category?.name}
          </span>
          <h3 className="text-base sm:text-xl font-semibold text-gray-900 hover:text-coklat-tua transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <StarIcon
                  key={index}
                  className={`h-3 w-3 sm:h-5 sm:w-5 ${
                    index < Math.floor(product.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-gray-600">
              {product.rating} ({product.reviewCount} ulasan)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        </Link>
        <div className="mt-auto pt-4">
          <div className="mb-4 sm:mb-4">
            <span className="text-lg sm:text-xl font-bold text-[#472D2D]">
              {formattedPrice}
            </span>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link
              href={`/products/${product.id}`}
              className="cursor-pointer flex items-center justify-center bg-white border border-[#472D2D] text-[#472D2D] px-2 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-[#e9e9e9] transition-colors duration-300 text-xs sm:text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>
            <Link
              href={`/products/${product.id}`}
              className="w-full text-center  bg-[#472D2D] hover:bg-[#382525] text-white border border-[#472D2D] px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors duration-300 text-[10px] sm:text-sm font-medium"
            >
              Buat Pesanan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 