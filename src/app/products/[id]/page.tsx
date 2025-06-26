'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useLoading } from '@/context/LoadingContext';
import { useSession } from 'next-auth/react';

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
  reviews: Review[];
}

interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const { setIsLoading: setGlobalIsLoading } = useLoading();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setGlobalIsLoading(true);
        setError(null);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        console.log('Fetching from:', `${baseUrl}/api/products/${params.id}`);
        const res = await fetch(`${baseUrl}/api/products/${params.id}`, { 
          cache: 'no-store',
          next: { revalidate: 60 }, // Revalidate every 60 seconds
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch product');
        }
        
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error instanceof Error ? error.message : 'Failed to load product');
      } finally {
        setGlobalIsLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, setGlobalIsLoading]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const newQuantity = prev + delta;
      return newQuantity < 1 ? 1 : newQuantity > (product?.stock || 1) ? (product?.stock || 1) : newQuantity;
    });
  };

  const handleImageClick = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIdx((prev) => (prev === 0 ? (product?.images.length || 1) - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIdx((prev) => (prev === (product?.images.length || 1) - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = async () => {
    if (!product) return;

        // Check if user is logged in using NextAuth session
    if (!session) {
      window.location.href = '/login';
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL2 || process.env.NEXT_PUBLIC_BASE_URL3 || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const data = await response.json();
      setShowCartModal(true);

      // Dispatch cart count update event
      window.dispatchEvent(new CustomEvent('updateCartCount', { detail: { count: data.totalQuantity } }));
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // Check if user is logged in using NextAuth session
    if (!session) {
      // Store the intended destination
      sessionStorage.setItem('redirectAfterLogin', `/products/${product.id}/checkout`);
      // Store checkout data
      const checkoutData = {
        items: [{
          productId: product.id,
          quantity: quantity,
          price: product.price,
          name: product.name,
          image: product.images[0]
        }]
      };
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    
    const checkoutData = {
      items: [{
        productId: product.id,
        quantity: quantity,
        price: product.price,
        name: product.name,
        image: product.images[0]
      }]
    };
    
    // Store checkout data in sessionStorage
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    // Redirect to checkout page with product ID
    window.location.href = `/products/${product.id}/checkout`;
  };

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8 pb-16 mt-22">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600">{error || 'Product not found'}</p>
            <Link href="/products" className="mt-4 inline-block text-[#472D2D] hover:underline">
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <main className="min-h-screen bg-gray-50 pt-8 pb-16 mt-22">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-4 mb-4">
        <Link href="/products" className="inline-flex items-center text-[#472D2D] hover:underline font-medium mb-2">
          <span className="mr-1">&#8592;</span> Kembali
        </Link>
      </div>
      {/* Breadcrumb */}
      <nav className="max-w-5xl mx-auto px-4 text-xs text-gray-500 mb-8">
        <ol className="flex space-x-2">
          <li><Link href="/">Beranda</Link> /</li>
          <li><Link href="/products">Produk</Link> /</li>
          <li className="text-gray-700 font-semibold">{product.name}</li>
        </ol>
      </nav>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 mb-12 px-4">
        {/* Images */}
        <div className="flex-1 flex flex-col items-center">
          <div 
            className="relative w-full h-64 sm:h-96 mb-4 cursor-zoom-in"
            onClick={handleImageClick}
          >
            <Image
              src={product.images[selectedImageIdx] || '/placeholder.png'}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain rounded-lg bg-gray-100"
              priority
              loading="eager"
              unoptimized={product.images[selectedImageIdx]?.startsWith('https://res.cloudinary.com')}
            />
            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage(e);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage(e);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-800" />
            </button>
          </div>
          <div className="w-full overflow-x-auto pb-4 -mb-4">
            <div className="flex gap-2 w-[1280px] xl:w-[1024px] lg:w-[768px] md:w-[640px] sm:w-[480px]">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-16 h-16 flex-shrink-0 border rounded overflow-hidden bg-gray-100 focus:outline-none ${selectedImageIdx === idx ? 'border-[#472D2D] ring-1 ring-[#472D2D]' : 'border-gray-300'}`}
                  aria-label={`Pilih gambar ${idx + 1}`}
                >
                  <Image 
                    src={img || '/placeholder.png'} 
                    alt={`${product.name} - Image ${idx + 1}`} 
                    fill 
                    sizes="64px"
                    className="object-contain"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Details */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 text-sm mb-2">{product.description}</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-[#472D2D] font-semibold text-sm">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({product.reviewCount} ulasan)</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{formattedPrice}</div>
          
          {/* Quantity selector and stock info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border rounded px-2 py-1">
              <button 
                className="text-lg px-2"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-2">{quantity}</span>
              <button 
                className="text-lg px-2"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
            <span className={`text-sm ${product.stock === 0 ? 'text-red-500' : product.stock <= 10 ? 'text-orange-500' : 'text-green-500'} font-semibold`}>
                {product.stock === 0 
                ? 'Habis' 
                : product.stock <= 10 
                ? 'Hanya ' + product.stock + ' Item Tersedia!'
                : product.stock + ' Item Tersedia'}
            </span>
          </div>
          {/* Actions */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex gap-4">
              <button
                disabled={product.stock === 0}
                className={`${product.stock === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer border-[#472D2D] text-[#472D2D] hover:bg-[#472D2D] hover:text-white'} flex-1 border  py-3 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2`}
                onClick={product.stock === 0 ? undefined : handleAddToCart}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" className='text-[12px] md:text-[16px] px-0 mx-0' />
                </svg>
                <span className='text-[12px] md:text-[16px] px-0 mx-0'>{product.stock === 0 ? 'Habis' : 'Tambah ke Keranjang'}</span>
              </button>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_SELLER_PHONE}?text=Halo, saya tertarik dengan produk ${product.name} (${window.location.href})`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white py-3 w-1/2 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2 hover:bg-green-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span className='text-[12px] md:text-[16px] px-0 mx-0'>Hubungi Penjual</span>
              </a>
            </div>
            <button
              disabled={product.stock === 0}
              className={`${product.stock === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-[#382525] '} bg-[#472D2D] text-white flex-1  py-3 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2`}
              onClick={product.stock === 0 ? undefined : handleBuyNow}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" className='text-[12px] md:text-[16px] px-0 mx-0'/>
              </svg>
              <span className='text-[12px] md:text-[16px] px-0 mx-0'>{product.stock === 0 ? 'Habis' : 'Beli Sekarang'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={handleCloseFullscreen}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={handleCloseFullscreen}
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
          
          <button
            className="absolute left-4 text-white hover:text-gray-300"
            onClick={handlePrevImage}
          >
            <ChevronLeftIcon className="h-8 w-8" />
          </button>
          
          <button
            className="absolute right-4 text-white hover:text-gray-300"
            onClick={handleNextImage}
          >
            <ChevronRightIcon className="h-8 w-8" />
          </button>

          <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4">
            <Image
              src={product.images[selectedImageIdx] || '/placeholder.png'}
              alt={product.name}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIdx(idx);
                }}
                className={`w-2 h-2 rounded-full ${
                  selectedImageIdx === idx ? 'bg-white' : 'bg-gray-500'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cart Success Modal */}
      {showCartModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Berhasil Ditambahkan ke Keranjang</h3>
              <p className="text-sm text-gray-500 mb-4">Produk telah ditambahkan ke keranjang belanja Anda</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCartModal(false)}
                  className="flex-1 border border-[#472D2D] text-[#472D2D] py-2 px-4 rounded-lg hover:bg-[#472D2D] hover:text-white transition-colors"
                >
                  Lanjut Belanja
                </button>
                <Link
                  href="/cart"
                  className="flex-1 bg-[#472D2D] text-white py-2 px-4 rounded-lg hover:bg-[#382525] transition-colors text-center"
                >
                  Lihat Keranjang
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <section className="max-w-5xl mx-auto px-4 mt-12">
        <h2 className="text-xl font-bold text-[#472D2D] mb-6">Ulasan Pembeli ({product.reviewCount})</h2>
        <div className="space-y-6">
          {!product.reviews || product.reviews.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Belum ada ulasan untuk produk ini</p>
            </div>
          ) : (
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">
                          <Image src={review.user?.image || '/user.png'} alt={review.user?.name || 'Anonymous'} width={48} height={48} className="rounded-full" />
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, idx) => (
                          <StarIcon
                            key={idx}
                            className={`h-4 w-4 ${idx < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{review.comment || 'Tidak ada komentar'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
} 