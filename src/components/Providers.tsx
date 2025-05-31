'use client';

import { SessionProvider } from 'next-auth/react';
import { LoadingProvider } from '@/context/LoadingContext';
import { CartProvider } from '@/context/CartContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </CartProvider>
    </SessionProvider>
  );
} 