'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Banner from '@/components/Banner';
import ProductGrid from '@/components/ProductGrid';
import Testimonial from '@/components/Testimonial';
import Footer from '@/components/Footer';

// Mock data for products
const featuredProducts = [
  {
    id: '1',
    name: 'Modern Sofa Set',
    image: '/products/sofa-1.jpg',
    price: 4500000,
    description: 'Elegant and comfortable modern sofa set perfect for your living room.',
    rating: 4.5,
    reviewCount: 128
  },
  {
    id: '2',
    name: 'Wooden Dining Table',
    image: '/products/table-1.jpg',
    price: 2800000,
    description: 'Solid wood dining table with six matching chairs.',
    rating: 4.8,
    reviewCount: 95
  },
  {
    id: '3',
    name: 'Queen Size Bed',
    image: '/products/bed-1.jpg',
    price: 3500000,
    description: 'Comfortable queen size bed with premium mattress.',
    rating: 4.7,
    reviewCount: 156
  },
  {
    id: '4',
    name: 'Bookshelf',
    image: '/products/shelf-1.jpg',
    price: 1200000,
    description: 'Spacious bookshelf with multiple compartments.',
    rating: 4.3,
    reviewCount: 82
  },
];

// Mock data for testimonials
const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Homeowner',
    image: '/testimonials/user-1.jpg',
    content: 'The quality of furniture is exceptional. I love how it transformed my living space!',
  },
  {
    name: 'Michael Chen',
    role: 'Interior Designer',
    image: '/testimonials/user-2.jpg',
    content: 'As a designer, I appreciate the attention to detail and craftsmanship in every piece.',
  },
  {
    name: 'Emma Davis',
    role: 'Customer',
    image: '/testimonials/user-3.jpg',
    content: 'Great customer service and fast delivery. Will definitely shop here again!',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Banner />
      {/* Featured Products Section */}
      <ProductGrid title="Produk Terbaru" products={featuredProducts} />
      
      {/* Testimonials Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-coklat text-center mb-8">
            Apa Kata Mereka
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Testimonial
                key={index}
                name={testimonial.name}
                role={testimonial.role}
                image={testimonial.image}
                content={testimonial.content}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
