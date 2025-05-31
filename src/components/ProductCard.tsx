'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { StarIcon } from '@heroicons/react/24/solid';
import content from '@/content/content.json';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  rating: number;
  reviewCount: number;
}

export default function ProductCard({ id, name, image, price, description, rating, reviewCount }: Product) {
  const { addToCart } = useCart();
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative h-64 w-full overflow-hidden">
        <Link href={`/products/${id}`}>
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>
      <div className="p-6 space-y-4">
        <Link href={`/products/${id}`} className="block space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 hover:text-coklat-tua transition-colors">
            {name}
          </h3>
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <StarIcon
                  key={index}
                  className={`h-5 w-5 ${
                    index < Math.floor(rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({reviewCount})
            </span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">
            {description}
          </p>
        </Link>
        <div className="pt-2">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-coklat-tua">
              {formattedPrice}
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => addToCart({ id, name, image, price, quantity: 1 })}
                className="bg-coklat-tua text-white px-4 py-2 rounded-md hover:bg-coklat-muda transition-colors duration-300 text-sm font-medium"
              >
                {content.productCard.addToCart}
              </button>
              <Link
                href={`/checkout?productId=${id}`}
                className="bg-white text-coklat-tua border border-coklat-tua px-4 py-2 rounded-md hover:bg-coklat-tua hover:text-white transition-colors duration-300 text-sm font-medium"
              >
                Pesan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 