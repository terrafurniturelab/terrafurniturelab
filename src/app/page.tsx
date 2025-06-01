import React from 'react';
import Navbar from '@/components/Navbar';
import Banner from '@/components/Banner';
import ProductGrid from '@/components/ProductGrid';
import Testimonial from '@/components/Testimonial';
import Footer from '@/components/Footer';

async function getFeaturedProducts() {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products?limit=6`, { 
      cache: 'no-store' 
    });
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    const products = await res.json();
    return Array.isArray(products) ? products.slice(0, 6) : [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}
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

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
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
