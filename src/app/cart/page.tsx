'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useLoading } from '@/context/LoadingContext';
import { useSession } from 'next-auth/react';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
}

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setIsLoading: setGlobalIsLoading } = useLoading();

  // Check if any items are out of stock
  const hasOutOfStockItems = cartItems.some(item => item.quantity > item.product.stock);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setGlobalIsLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000' || process.env.NEXT_PUBLIC_BASE_URL2;
        const response = await fetch(`${baseUrl}/api/cart`, {
          cache: 'no-store',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }
        
        const data = await response.json();
        setCartItems(data);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      } finally {
        setIsLoading(false);
        setGlobalIsLoading(false);
      }
    };

    fetchCartItems();
  }, [setGlobalIsLoading]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      const data = await response.json();
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));

      // Dispatch cart count update event
      window.dispatchEvent(new CustomEvent('updateCartCount', { detail: { count: data.totalQuantity } }));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    if (!session) {
      // Store the intended destination
      sessionStorage.setItem('redirectAfterLogin', '/cart/checkout');
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    
    // Redirect to checkout page
    router.push('/cart/checkout');
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const formattedSubtotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(subtotal);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8 pb-16 mt-22">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600">Memuat keranjang belanja...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-8 pb-16 mt-22">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-[#472D2D] mb-8">Keranjang Belanja</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 mb-4">Keranjang belanja Anda kosong</p>
            <Link
              href="/products"
              className="inline-block bg-[#472D2D] text-white px-6 py-2 rounded-lg hover:bg-[#382525] transition-colors"
            >
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4"
                >
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.product.images[0] || '/placeholder.png'}
                      alt={item.product.name}
                      fill
                      className="object-contain rounded-lg"
                      unoptimized={item.product.images[0]?.startsWith('https://res.cloudinary.com')}
                    />
                  </div>
                  <div className="flex-grow">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-[#472D2D]"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-[#472D2D] font-semibold mt-1">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(item.product.price)}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center border rounded">
                        <span className="px-4 py-1">{item.quantity}x</span>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-600"
                        aria-label="Remove item"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                    {item.quantity > item.product.stock && (
                      <p className="text-red-500 text-sm mt-2">
                        Stok tersedia: {item.product.stock} item
                      </p>
                    )}
                    {item.quantity <= item.product.stock && (
                      <p className="text-green-500 text-sm mt-2">
                        Stok tersedia: {item.product.stock} item
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formattedSubtotal}</span>
                  </div>
                  {hasOutOfStockItems && (
                    <div className="text-red-500 text-sm">
                      Beberapa item melebihi stok yang tersedia. Silakan sesuaikan jumlah pesanan.
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <button
                      onClick={handleCheckout}
                      disabled={hasOutOfStockItems}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                        hasOutOfStockItems
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-[#472D2D] text-white hover:bg-[#382525] cursor-pointer'
                      }`}
                    >
                      Lanjut ke Pembayaran
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 