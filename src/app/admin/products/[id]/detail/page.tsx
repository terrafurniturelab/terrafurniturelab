'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: {
    name: string;
  };
  reviews: Review[];
}

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productId = params.id as string;
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const productId = params.id as string;
      const response = await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      // Update the product state by removing the deleted review
      setProduct(prev => {
        if (!prev) return null;
        return {
          ...prev,
          reviews: prev.reviews.filter(review => review.id !== reviewId)
        };
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-64 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error || 'Product not found'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-red-600 hover:text-red-800 underline"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="text-[#472D2D] hover:text-[#382525] mb-8 flex items-center"
        >
          ← Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-semibold text-[#472D2D] mb-4">{product.name}</h1>
            <div className="relative h-96 mb-6">
              <Image
                src={product.images[0] || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Description</h2>
                <p className="mt-1 text-gray-600">{product.description}</p>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Category</h2>
                <p className="mt-1 text-gray-600">{product.category.name}</p>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Price</h2>
                <p className="mt-1 text-gray-600">{formatCurrency(product.price)}</p>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Stock</h2>
                <p className="mt-1 text-gray-600">{product.stock} units</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#472D2D] mb-6">Reviews</h2>
            {product.reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet</p>
            ) : (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{review.user.name}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="mt-2 text-gray-600">{review.comment}</p>
                    <p className="mt-2 text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 