'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CardAuth from '@/components/CardAuth';
import LoadingScreen from '@/components/LoadingScreen';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', { email, passwordLength: password.length });
      
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat login');
      }

      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
        <CardAuth title="Admin Login" subtitle="Silahkan masukkan email dan password">  
          <div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#472D2D]">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    placeholder="Masukkan email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#472D2D] focus:border-[#472D2D]"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#472D2D]">
                    Kata Sandi
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    placeholder="Masukkan kata sandi"
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#472D2D] focus:border-[#472D2D]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/forgot-password')}
                    className="cursor-pointer text-sm text-[#472D2D] hover:text-[#382525]"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-coklat text-white rounded-lg font-semibold bg-[#553939] hover:bg-[#3f2a2a] transition cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Memproses...' : 'Masuk'}
                </button>
              </div>
            </form>
          </div>
        </CardAuth>
    </>
  );
} 