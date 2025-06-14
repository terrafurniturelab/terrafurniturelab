import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <h1 className="text-6xl font-bold text-[#472D2D] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 text-center mb-8 max-w-md">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. 
          Silakan kembali ke halaman utama atau coba cari produk yang Anda inginkan.
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="bg-[#472D2D] hover:bg-[#472D2D]/90 text-white px-6 py-3 rounded-md transition-colors"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/products"
            className="bg-white border border-[#472D2D] text-[#472D2D] hover:bg-gray-50 px-6 py-3 rounded-md transition-colors"
          >
            Lihat Produk
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
} 