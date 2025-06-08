'use client';

import React from 'react';
import NavbarAuth from "@/components/NavbarAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative z-0" style={{ backgroundImage: 'url(/bg.jpg)' }}>
      <div className="absolute inset-0 bg-white opacity-60 z-0"></div>
      <NavbarAuth />
      <main className='z-10 w-full flex justify-center items-center mt-8'>
        {children}
      </main>
    </div>
  );
}
