'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import content from '@/content/content.json';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 py-4 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-[#472D2D]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src={isScrolled ? "/logo-1.png" : "/logo-w.png"}
                alt={content.navbar.brand}
                width={800}
                height={800}
                className="h-11 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`relative transition-colors duration-300 ${
                isScrolled 
                  ? isActive('/') 
                    ? 'text-[#472D2D] font-bold border-b-2 border-[#472D2D]' 
                    : 'text-gray-700 hover:text-[#472D2D]'
                  : isActive('/')
                    ? 'text-white font-bold border-b-2 border-white'
                    : 'text-white'
              }`}
            >
              {content.navbar.navigation.home}
              {isActive('/') && (
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 transition-colors duration-300 ${
                  isScrolled ? 'bg-coklat-tua' : 'bg-white'
                }`} />
              )}
            </Link>
            <Link 
              href="/products" 
              className={`relative transition-colors duration-300 ${
                isScrolled 
                  ? isActive('/products') 
                    ? 'text-[#472D2D] font-bold border-b-2 border-[#472D2D]' 
                    : 'text-gray-700 hover:text-[#472D2D]'
                  : isActive('/products')
                    ? 'text-white font-bold border-b-2 border-white'
                    : 'text-white'
              }`}
            >
              {content.navbar.navigation.products}
              {isActive('/products') && (
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 transition-colors duration-300 ${
                  isScrolled ? 'bg-coklat-tua' : 'bg-white'
                }`} />
              )}
            </Link>
            <Link 
              href="/categories" 
              className={`relative transition-colors duration-300 ${
                isScrolled 
                  ? isActive('/categories') 
                    ? 'text-[#472D2D] font-bold border-b-2 border-[#472D2D]' 
                    : 'text-gray-700 hover:text-[#472D2D]'
                  : isActive('/categories')
                    ? 'text-white font-bold border-b-2 border-white'
                    : 'text-white'
              }`}
            >
              {content.navbar.navigation.categories}
              {isActive('/categories') && (
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 transition-colors duration-300 ${
                  isScrolled ? 'bg-coklat-tua' : 'bg-white'
                }`} />
              )}
            </Link>
            <Link 
              href="/about" 
              className={`relative transition-colors duration-300 ${
                isScrolled 
                  ? isActive('/about') 
                    ? 'text-[#472D2D] font-bold border-b-2 border-[#472D2D]' 
                    : 'text-gray-700 hover:text-[#472D2D]'
                  : isActive('/about')
                    ? 'text-white font-bold border-b-2 border-white'
                    : 'text-white'
              }`}
            >
              {content.navbar.navigation.about}
              {isActive('/about') && (
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 transition-colors duration-300 ${
                  isScrolled ? 'bg-coklat-tua' : 'bg-white'
                }`} />
              )}
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/cart" 
              className={`relative transition-colors duration-300 ${
                isScrolled 
                  ? isActive('/cart') 
                    ? 'text-coklat-tua' 
                    : 'text-gray-700 hover:text-coklat-muda'
                  : isActive('/cart')
                    ? 'text-white'
                    : 'text-white hover:text-coklat-terang'
              }`}
            >
            </Link>
            {session ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {isActive('/cart') && (
                  <span className={`absolute -bottom-1 left-0 w-full h-0.5 transition-colors duration-300 ${
                    isScrolled ? 'bg-coklat-tua' : 'bg-white'
                  }`} />
                )}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`flex items-center transition-colors duration-300 ${
                      isScrolled ? 'text-gray-700 hover:text-coklat-muda' : 'text-white hover:text-coklat-terang'
                    }`}
                  >
                    <span className="mr-2">{session.user?.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-coklat-terang">
                      <Link 
                        href="/profile" 
                        className={`block px-4 py-2 text-sm transition-colors duration-300 ${
                          isActive('/profile')
                            ? 'bg-coklat-terang text-coklat-tua font-semibold'
                            : 'text-gray-700 hover:bg-coklat-terang hover:text-coklat-tua'
                        }`}
                      >
                        {content.navbar.userMenu.profile}
                      </Link>
                      <Link 
                        href="/orders" 
                        className={`block px-4 py-2 text-sm transition-colors duration-300 ${
                          isActive('/orders')
                            ? 'bg-coklat-terang text-coklat-tua font-semibold'
                            : 'text-gray-700 hover:bg-coklat-terang hover:text-coklat-tua'
                        }`}
                      >
                        {content.navbar.userMenu.orders}
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-coklat-terang hover:text-coklat-tua transition-colors duration-300"
                      >
                        {content.navbar.userMenu.signOut}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className={`relative transition-colors duration-300 px-4 py-2 rounded-md ${
                    isScrolled 
                      ? 'text-[#472D2D] border border-[#472D2D] hover:text-[#472D2D]'
                      : 'text-white border border-white hover:text-[#472D2D] hover:bg-white duration-400'
                  }`}
                >
                  {content.navbar.userMenu.login}
                  {isActive('/login') && (
                    <span className={`absolute -bottom-1 left-0 w-full h-0.5 transition-colors duration-300 ${
                      isScrolled ? 'bg-coklat-tua' : 'bg-white'
                    }`} />
                  )}
                </Link>
                <Link 
                  href="/register" 
                  className={`px-4 py-2 rounded-md transition-colors duration-300 ${
                    isScrolled 
                      ? 'text-white bg-[#472D2D] hover:bg-[#352121]'
                      : 'text-[#472D2D] bg-white hover:bg-gray-300'
                  }`}
                >
                  {content.navbar.userMenu.register}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`transition-colors duration-300 ${
                isScrolled ? 'text-gray-700 hover:text-coklat-muda' : 'text-white hover:text-coklat-terang'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 transition-colors duration-300 ${
            isScrolled ? 'bg-white border-t border-coklat-terang' : 'bg-[#472D2D]'
          }`}>
            <Link 
              href="/" 
              className={`block px-3 py-2 transition-colors duration-300 ${
                isScrolled 
                  ? isActive('/')
                    ? 'bg-coklat-terang text-coklat-tua font-semibold'
                    : 'text-gray-700 hover:text-coklat-muda hover:bg-coklat-terang'
                  : isActive('/')
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white hover:text-coklat-terang'
              }`}
            >
              {content.navbar.navigation.home}
            </Link>
            <Link 
              href="/products" 
              className={`block px-3 py-2 transition-colors duration-300 ${
                isScrolled 
                  ? isActive('/products')
                    ? 'bg-coklat-terang text-coklat-tua font-semibold'
                    : 'text-gray-700 hover:text-coklat-muda hover:bg-coklat-terang'
                  : isActive('/products')
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white hover:text-coklat-terang'
              }`}
            >
              {content.navbar.navigation.products}
            </Link>
            <Link 
              href="/categories" 
              className={`block px-3 py-2 transition-colors duration-300 ${
                isScrolled 
                  ? isActive('/categories')
                    ? 'bg-coklat-terang text-coklat-tua font-semibold'
                    : 'text-gray-700 hover:text-coklat-muda hover:bg-coklat-terang'
                  : isActive('/categories')
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white hover:text-coklat-terang'
              }`}
            >
              {content.navbar.navigation.categories}
            </Link>
            <Link 
              href="/about" 
              className={`block px-3 py-2 transition-colors duration-300 ${
                isScrolled 
                  ? isActive('/about')
                    ? 'bg-coklat-terang text-coklat-tua font-semibold'
                    : 'text-gray-700 hover:text-coklat-muda hover:bg-coklat-terang'
                  : isActive('/about')
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white hover:text-coklat-terang'
              }`}
            >
              {content.navbar.navigation.about}
            </Link>
            {session ? (
              <>
                <Link 
                  href="/profile" 
                  className={`block px-3 py-2 transition-colors duration-300 ${
                    isScrolled 
                      ? isActive('/profile')
                        ? 'bg-coklat-terang text-coklat-tua font-semibold'
                        : 'text-gray-700 hover:text-coklat-muda hover:bg-coklat-terang'
                      : isActive('/profile')
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-white hover:text-coklat-terang'
                  }`}
                >
                  {content.navbar.userMenu.profile}
                </Link>
                <Link 
                  href="/orders" 
                  className={`block px-3 py-2 transition-colors duration-300 ${
                    isScrolled 
                      ? isActive('/orders')
                        ? 'bg-coklat-terang text-coklat-tua font-semibold'
                        : 'text-gray-700 hover:text-coklat-muda hover:bg-coklat-terang'
                      : isActive('/orders')
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-white hover:text-coklat-terang'
                  }`}
                >
                  {content.navbar.userMenu.orders}
                </Link>
                <button
                  onClick={() => signOut()}
                  className={`block w-full text-left px-3 py-2 transition-colors duration-300 ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-coklat-muda hover:bg-coklat-terang' 
                      : 'text-white hover:text-coklat-terang'
                  }`}
                >
                  {content.navbar.userMenu.signOut}
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className={`block px-3 py-2 transition-colors duration-300 ${
                    isScrolled 
                      ? isActive('/login')
                        ? 'bg-coklat-terang text-coklat-tua font-semibold'
                        : 'text-gray-700 hover:text-coklat-muda hover:bg-coklat-terang'
                      : isActive('/login')
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-white hover:text-coklat-terang'
                  }`}
                >
                  {content.navbar.userMenu.login}
                </Link>
                <Link 
                  href="/register" 
                  className={`block px-3 py-2 transition-colors duration-300 ${
                    isScrolled 
                      ? isActive('/register')
                        ? 'bg-coklat-terang text-coklat-tua font-semibold'
                        : 'text-gray-700 hover:text-coklat-muda hover:bg-coklat-terang'
                      : isActive('/register')
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-white hover:text-coklat-terang'
                  }`}
                >
                  {content.navbar.userMenu.register}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 