import React from 'react';
import Navbar from '@/components/Navbar';
import Banner from '@/components/Banner';
import ProductGrid from '@/components/ProductGrid';
import FeaturedFeedbacks from '@/components/FeaturedFeedbacks';
import Footer from '@/components/Footer';

async function getFeaturedProducts() {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL2 || 'http://localhost:3000';
    console.log('Fetching from:', `${baseUrl}/api/products?limit=4`);
    
    const res = await fetch(`${baseUrl}/api/products?limit=4`, { 
      next: { 
        revalidate: 60 // Revalidate every 60 seconds
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error('API Response not OK:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
    }

    const products = await res.json();
    console.log('Fetched products:', products);
    
    if (!Array.isArray(products)) {
      console.error('Products is not an array:', products);
      return [];
    }

    return products.slice(0, 4);
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

      {featuredProducts.length > 0 ? (
        <ProductGrid title="Produk Terbaru" products={featuredProducts} />
      ) : (
        <div className="py-24 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Belum Ada Produk</h2>
          <p className="text-gray-600">Mohon maaf, saat ini belum ada produk yang tersedia.</p>
        </div>
      )}
      
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
