import React from 'react';
import Navbar from '@/components/Navbar';
import Banner from '@/components/Banner';
import ProductGrid from '@/components/ProductGrid';
import FeaturedFeedbacks from '@/components/FeaturedFeedbacks';
import Footer from '@/components/Footer';

async function getFeaturedProducts() {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products?limit=4&sort=createdAt:desc`, { 
      next: { revalidate: 3600 } // Revalidate every hour
    });
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    const products = await res.json();
    return Array.isArray(products) ? products.slice(0, 4) : [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

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
          <FeaturedFeedbacks />
        </div>
      </section>

      <Footer />
    </main>
  );
}
