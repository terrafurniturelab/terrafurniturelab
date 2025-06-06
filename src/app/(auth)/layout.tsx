'use client';

import React from 'react';
import NavbarAuth from "@/components/NavbarAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-700">
      <NavbarAuth />
      <main className='h-full bg-gray-700'>
        {children}
      </main>
    </div>
  );
}
