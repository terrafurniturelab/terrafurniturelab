'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  HomeIcon,
  TagIcon,
  CubeIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

const navigation = [
  { name: 'Dasbor', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Kelola Kategori', href: '/admin/categories', icon: TagIcon },
  { name: 'Kelola Produk', href: '/admin/products', icon: CubeIcon },
  { name: 'Kelola Pemesanan', href: '/admin/orders', icon: ShoppingCartIcon },
  { name: 'Pesan', href: '/admin/messages', icon: ChatBubbleLeftRightIcon },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch admin info
    fetch('/api/admin/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.name && data.email) setAdmin({ name: data.name, email: data.email });
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className={`bg-[#472D2D] text-white h-screen ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 fixed left-0 top-0`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col items-center space-y-2">
            <Image src="/logo-w.png" alt="Logo" width={170} height={170} className={`border-b-2 border-white ${!isSidebarOpen && 'hidden'}`} />
            <h1 className={`font-bold text-xl ${!isSidebarOpen && 'hidden'}`}>
              Admin Panel
            </h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#382525]"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              )}
            </svg>
          </button>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#382525] text-white'
                    : 'text-gray-300 hover:bg-[#382525] hover:text-white'
                }`}
              >
                <item.icon className="w-6 h-6" />
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          {admin && (
            <div className="flex items-center mb-2 space-x-2 p-2 bg-[#382525] rounded-lg">
              <UserCircleIcon className="w-8 h-8 text-gray-300" />
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{admin.name}</span>
                  <span className="text-xs text-gray-400">{admin.email}</span>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="cursor-pointer flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-[#382525] hover:text-white transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
            {isSidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </div>
    </div>
  );
} 