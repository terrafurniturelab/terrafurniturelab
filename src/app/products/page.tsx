'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import LoadingScreen from '@/components/LoadingScreen';
import { MagnifyingGlassIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import content from '@/content/content.json';

interface Category {
  id: string;
  name: string;
}
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
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('default');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);
        
        if (!productsRes.ok) {
          throw new Error('Failed to fetch products');
        }
        if (!categoriesRes.ok) {
          throw new Error('Failed to fetch categories');
        }

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        if (!Array.isArray(productsData)) {
          throw new Error('Invalid products data format');
        }
        if (!Array.isArray(categoriesData)) {
          throw new Error('Invalid categories data format');
        }

        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
        setProducts([]);
        setFilteredProducts([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    try {
      let filtered = products.filter(product => 
        (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedCategories.length === 0 || selectedCategories.includes(product.categoryId))
      );
      filtered = filtered.sort((a, b) => {
        switch (sortBy) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          default:
            return 0;
        }
      });
      setFilteredProducts(filtered);
    } catch (error) {
      console.error('Error filtering products:', error);
      setError('Error filtering products');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, products, selectedCategories, sortBy]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 mt-16">
      {isLoading && <LoadingScreen isLoading={isLoading} />}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#472D2D]">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {content.products.title}
          </h1>
          <p className="text-[#d1bebe] max-w-2xl mx-auto">
            {content.products.description}
          </p>
        </div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
          <div className="relative" ref={categoryRef}>
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#472D2D] focus:border-transparent"
            >
              <span className="text-sm font-medium text-gray-700">
                {selectedCategories.length > 0 
                  ? `${selectedCategories.length} Kategori Dipilih`
                  : 'Semua Kategori'}
              </span>
              <ChevronDownIcon className={`h-5 w-5 text-gray-500 transition-transform ${isCategoryOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isCategoryOpen && (
              <div className="absolute z-10 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200">
                <div className="py-1">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                        className="hidden"
                      />
                      <div className={`w-5 h-5 border rounded flex items-center justify-center mr-3 ${
                        selectedCategories.includes(category.id)
                          ? 'bg-[#472D2D] border-[#472D2D]'
                          : 'border-gray-300'
                      }`}>
                        {selectedCategories.includes(category.id) && (
                          <CheckIcon className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#472D2D] focus:border-transparent"
            >
              <option value="default">Default</option>
              <option value="name-asc">Nama (A-Z)</option>
              <option value="name-desc">Nama (Z-A)</option>
              <option value="price-asc">Harga (Termurah)</option>
              <option value="price-desc">Harga (Termahal)</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
            />
          ))}
        </div>
        {(!Array.isArray(filteredProducts) || filteredProducts.length === 0) && !isLoading && (
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