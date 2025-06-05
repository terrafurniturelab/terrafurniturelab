'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import content from '@/content/content.json';
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [unreviewedCount, setUnreviewedCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUnreviewedCount = async () => {
      try {
        const response = await fetch('/api/reviews/unreviewed-count');
        if (response.ok) {
          const data = await response.json();
          setUnreviewedCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching unreviewed count:', error);
      }
    };

    fetchUnreviewedCount();
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
                priority
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
            {session ? (
              <>
                <Link
                  href="/chat"
                  className={`relative transition-colors duration-300 ${
                    isScrolled ? 'text-[#472D2D]' : 'text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {isActive('/chat') && (
                    <span className={`absolute -bottom-1 left-0 w-full h-0.5 transition-colors duration-300 ${
                      isScrolled ? 'bg-[#472D2D]' : 'bg-white'
                    }`} />
                  )}
                </Link>
                <Link
                  href="/cart"
                  className={`relative transition-colors duration-300 ${
                    isScrolled ? 'text-[#472D2D]' : 'text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {isActive('/cart') && (
                    <span className={`absolute -bottom-1 left-0 w-full h-0.5 transition-colors duration-300 ${
                      isScrolled ? 'bg-[#472D2D]' : 'bg-white'
                    }`} />
                  )}
                </Link>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`cursor-pointer flex items-center transition-colors duration-300 ${
                      isScrolled ? 'text-gray-700 hover:text-[#472D2D]' : 'text-white hover:text-[#472D2D]'
                    }`}
                  >
                    <div className="relative">
                      <Image
                        src={session.user?.image || "/user.png"}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full mr-2"
                      />
                      {unreviewedCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreviewedCount}
                        </span>
                      )}
                    </div>
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-[#472D2D]/20 backdrop-blur-sm">
                      <Link 
                        href="/profile" 
                        className={`flex items-center px-4 py-3 text-sm transition-all duration-300 hover:bg-gray-100 ${
                          isActive('/profile')
                            ? 'bg-gradient-to-r from-coklat-terang/20 to-coklat-terang/10 text-coklat-tua font-semibold'
                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-coklat-terang/20 hover:to-coklat-terang/10'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {content.navbar.userMenu.profile}
                      </Link>
                      <Link 
                        href="/orders" 
                        className={`flex items-center px-4 py-3 text-sm transition-all duration-300 hover:bg-gray-100 relative ${
                          isActive('/orders')
                            ? 'bg-gradient-to-r from-coklat-terang/20 to-coklat-terang/10 text-coklat-tua font-semibold'
                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-coklat-terang/20 hover:to-coklat-terang/10'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {content.navbar.userMenu.orders}
                        {unreviewedCount > 0 && (
                          <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreviewedCount}
                          </span>
                        )}
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`transition-all duration-300 p-2 rounded-lg ${
                isScrolled 
                  ? isMobileMenuOpen 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'text-gray-700 hover:text-coklat-muda'
                  : isMobileMenuOpen 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'text-white hover:text-coklat-terang'
              }`}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
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
                  href="/chat"
                  className={`block px-3 py-2 transition-colors duration-300 ${
                    isScrolled 
                      ? isActive('/chat')
                        ? 'bg-coklat-terang text-coklat-tua font-semibold'
                        : 'text-gray-700 hover:text-coklat-muda hover:bg-coklat-terang'
                      : isActive('/chat')
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-white hover:text-coklat-terang'
                  }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat
                  </div>
                </Link>
                <Link 
                  href="/cart"
                  className={`block px-3 py-2 transition-colors duration-300 ${
                    isScrolled 
                      ? isActive('/cart')
                        ? 'bg-coklat-terang text-coklat-tua font-semibold'
                        : 'text-gray-700 hover:text-coklat-muda hover:bg-coklat-terang'
                      : isActive('/cart')
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-white hover:text-coklat-terang'
                  }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Cart
                  </div>
                </Link>
                <div className="px-3 py-2">
                  <div className="flex items-center">
                    <Image
                      src={session.user?.image || "/user.png"}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full mr-2"
                    />
                    <span className={`${
                      isScrolled ? 'text-gray-700' : 'text-white'
                    }`}>
                      {session.user?.name}
                    </span>
                  </div>
                </div>
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
                  <div className="relative">
                    {content.navbar.userMenu.orders}
                    {unreviewedCount > 0 && (
                      <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreviewedCount}
                      </span>
                    )}
                  </div>
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