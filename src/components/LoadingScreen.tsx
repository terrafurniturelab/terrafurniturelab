'use client';

import React from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-white/90 p-8 rounded-lg shadow-xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#472D2D] border-t-transparent"></div>
        <p className="mt-4 text-[#472D2D] font-medium">Memuat...</p>
      </div>
    </div>
  );
} 