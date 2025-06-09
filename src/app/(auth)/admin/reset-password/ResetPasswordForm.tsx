'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CardAuth from '@/components/CardAuth';
import LoadingScreen from '@/components/LoadingScreen';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setError('Token reset password tidak valid');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat mereset password');
      }

      setSuccess('Password berhasil direset. Silakan login dengan password baru Anda.');
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mereset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <CardAuth 
        title="Reset Password Gagal" 
        subtitle="Token reset password tidak valid atau telah kadaluarsa"
      >
        <div className="text-center">
          <button
            onClick={() => router.push('/admin/login')}
            className="text-sm text-[#472D2D] hover:text-[#382525]"
          >
            Kembali ke halaman login
          </button>
        </div>
      </CardAuth>
    );
  }

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <CardAuth 
        title="Reset Password" 
        subtitle="Masukkan password baru Anda"
      >
        <div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm">
                {success}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#472D2D]">
                  Password Baru
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  placeholder="Masukkan password baru"
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#472D2D] focus:border-[#472D2D]"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#472D2D]">
                  Konfirmasi Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  placeholder="Konfirmasi password baru"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#472D2D] focus:border-[#472D2D]"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#472D2D] hover:bg-[#382525] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#472D2D] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Memproses...' : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      </CardAuth>
    </>
  );
} 