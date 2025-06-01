'use client';

import React from 'react';
import NavbarAuth from "@/components/NavbarAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavbarAuth />
      <main>
        {children}
      </main>
    </div>
  );
}
