'use client';

import React, { useState, useEffect } from "react";
import CardAuth from "@/components/CardAuth";
import GoogleButton from "@/components/GoogleButton";
import Link from "next/link";
import ModalCenter from "@/components/ModalCenter";
import LoadingScreen from "@/components/LoadingScreen";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'error' | 'success' | 'info'>("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'OAuthAccountNotLinked') {
      setModalTitle("Login gagal");
      setModalDesc("Akun Google Anda belum terdaftar. Silahkan daftar terlebih dahulu.");
      setModalStatus('error');
      setModalOpen(true);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      });

      if (result?.error) {
        setModalTitle("Login gagal");
        setModalDesc(result.error);
        setModalStatus('error');
        setModalOpen(true);
        return;
      }

      setModalTitle("Login berhasil");
      setModalDesc("Selamat datang kembali!");
      setModalStatus('success');
      setModalOpen(true);

      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      setModalTitle("Login gagal");
      setModalDesc(error instanceof Error ? error.message : 'Terjadi kesalahan saat login');
      setModalStatus('error');
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <CardAuth title="Selamat Datang" subtitle="Silahkan masuk untuk melanjutkan pembelian">
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-[#472D2D]">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda" 
              placeholder="Masukkan email" 
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#472D2D]">Kata Sandi</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda" 
              placeholder="Masukkan kata sandi" 
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-coklatmuda hover:text-[#553939]">
              Lupa kata sandi?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-coklat text-white rounded-lg font-semibold bg-[#553939] hover:bg-[#3f2a2a] transition cursor-pointer disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-2 text-gray-400 text-xs">Atau</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>
        <GoogleButton>Masuk dengan Akun Google</GoogleButton>
        <p className="text-center text-xs text-gray-400 mt-6">
          Belum punya akun? <Link href="/register" className="text-coklatmuda underline hover:text-[#553939]">Daftar</Link>
        </p>
      </CardAuth>
      <ModalCenter
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        status={modalStatus}
        title={modalTitle}
        description={modalDesc}
        okText="OK"
      />
    </>
  );
}
