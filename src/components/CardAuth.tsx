import React from 'react';
import Image from 'next/image';

interface CardAuthProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function CardAuth({ title, subtitle, children }: CardAuthProps) {
  return (
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-[#553939] mt-16">
        <div className="flex flex-col items-center mb-6">
          <Image 
            src="/logoTF.png" 
            alt="logo" 
            width={100} 
            height={100} 
            priority
            className="w-auto h-auto" 
          />
          <h1 className="text-2xl font-bold mt-4 mb-1 text-coklat text-center">{title}</h1>
          <p className="text-gray-500 text-sm text-center">{subtitle}</p>
        </div>
        {children}
      </div>
  );
} 