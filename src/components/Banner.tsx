'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import content from '@/content/content.json';

export default function Banner() {
  return (
    <div className="relative bg-[#472D2D] mt-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {content.banner.hero.title}
            </h1>
            <p className="text-lg text-[#d1bebe]">
              {content.banner.hero.description}
            </p>
            <div className="flex space-x-4 justify-center sm:justify-start">
              <Link
                href="/products"
                className="cursor-pointer bg-white hover:bg-[#e9e9e9] text-[#472D2D] font-bold px-3 sm:px-6 py-3 rounded-md text-sm sm:text-lg transition-colors"
              >
                {content.banner.hero.cta.shopNow}<span className="text-sm sm:text-2xl ml-4">&rarr;</span>
              </Link>
            </div>
          </div>
          <div className="relative sm:h-[400px] h-[250px]">
            <Image
              src="/banner-image.jpg"
              alt={content.banner.hero.title}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">{content.banner.features.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center shadow-md p-8 rounded-lg">
              <div className="bg-[#ac8282] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{content.banner.features.quality.title}</h3>
              <p className="mt-2 text-gray-600">{content.banner.features.quality.description}</p>
            </div>
            <div className="text-center shadow-md p-8 rounded-lg">
              <div className="bg-[#ac8282] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{content.banner.features.delivery.title}</h3>
              <p className="mt-2 text-gray-600">{content.banner.features.delivery.description}</p>
            </div>
            <div className="text-center shadow-md p-8 rounded-lg">
              <div className="bg-[#ac8282] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{content.banner.features.payment.title}</h3>
              <p className="mt-2 text-gray-600">{content.banner.features.payment.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 