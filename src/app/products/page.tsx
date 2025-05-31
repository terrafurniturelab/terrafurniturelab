'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import content from '@/content/content.json';

// Temporary mock data - replace with your actual data fetching
const mockProducts = [
  {
    id: '1',
    name: 'Modern Sofa Set',
    image: '/products/sofa-1.jpg',
    price: 4500000,
    description: 'Elegant modern sofa set with premium fabric and comfortable cushions',
    rating: 4.5,
    reviewCount: 128
  },
  {
    id: '2',
    name: 'Wooden Dining Table',
    image: '/products/table-1.jpg',
    price: 2800000,
    description: 'Solid wood dining table with 6 chairs, perfect for family gatherings',
    rating: 4.8,
    reviewCount: 95
  },
  // Add more mock products as needed
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);

  useEffect(() => {
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  return (
    <main className="min-h-screen bg-gray-50 mt-16">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#472D2D]">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {content.products.title}
          </h1>
          <p className="text-[#d1bebe] max-w-2xl mx-auto">
            {content.products.description}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder={content.products.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            />
            <MagnifyingGlassIcon className="h-6 w-6 text-white absolute left-4 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {content.products.noResults}
            </p>
          </div>
        )}
      </div>
    </main>
  );
} 