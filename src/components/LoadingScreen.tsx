'use client';

import React from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[#472D2D] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#472D2D] font-medium">Loading...</p>
      </div>
    </div>
  );
} 