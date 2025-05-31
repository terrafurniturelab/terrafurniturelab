'use client';

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import CardAuth from "@/components/CardAuth";
import GoogleRegisterButton from "@/components/GoogleRegisterButton";
import Link from "next/link";
import ModalCenter from "@/components/ModalCenter";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'error' | 'success' | 'info'>("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [token, setToken] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setModalTitle("Registrasi gagal");
      setModalDesc("Password dan konfirmasi password tidak sesuai");
      setModalStatus('error');
      setModalOpen(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat mendaftar');
      }

      setModalTitle("Registrasi berhasil");
      setModalDesc("Silahkan cek email Anda untuk verifikasi akun");
      setModalStatus('success');
      setModalOpen(true);
      setShowTokenInput(true);
      setRegisteredEmail(formData.email);
    } catch (error) {
      setModalTitle("Registrasi gagal");
      setModalDesc(error instanceof Error ? error.message : 'Terjadi kesalahan saat mendaftar');
      setModalStatus('error');
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registeredEmail,
          token: token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token tidak valid atau sudah kadaluarsa');
      }

      setModalTitle("Registrasi berhasil");
      setModalDesc("Selamat datang! Akun Anda telah berhasil dibuat.");
      setModalStatus('success');
      setModalOpen(true);
      
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      setModalTitle("Verifikasi gagal");
      setModalDesc(error instanceof Error ? error.message : 'Terjadi kesalahan saat verifikasi');
      setModalStatus('error');
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendToken = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/resend-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registeredEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim ulang token');
      }

      setModalTitle("Token terkirim");
      setModalDesc("Token baru telah dikirim ke email Anda");
      setModalStatus('success');
      setModalOpen(true);
    } catch (error) {
      setModalTitle("Gagal mengirim ulang token");
      setModalDesc(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim ulang token');
      setModalStatus('error');
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (message: string) => {
    setModalTitle("Registrasi gagal");
    setModalDesc(message);
    setModalStatus('error');
    setModalOpen(true);
  };

  const handleGoogleSuccess = () => {
    setModalTitle("Registrasi berhasil");
    setModalDesc("Selamat datang! Akun Anda telah berhasil dibuat.");
    setModalStatus('success');
    setModalOpen(true);

    setTimeout(async () => {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      });
      if (result?.ok) {
        router.push('/');
      }
    }, 2000);
  };

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <CardAuth title="Daftar" subtitle="Buat akun baru untuk mulai berbelanja">
        {!showTokenInput ? (
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-[#472D2D]">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda" 
                placeholder="Masukkan nama lengkap" 
                required
                disabled={isLoading}
              />
            </div>
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
            <div>
              <label className="block text-sm font-medium text-[#472D2D]">Konfirmasi Kata Sandi</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda" 
                placeholder="Masukkan ulang kata sandi" 
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="mt-4 w-full py-2 bg-coklat text-white rounded-lg font-semibold bg-[#553939] hover:bg-[#3f2a2a] transition cursor-pointer disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Memuat...' : 'Daftar'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-coklat mb-2 text-center">Verifikasi Email</h2>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Masukkan 6 digit token yang telah dikirim ke email Anda.
            </p>
            <form onSubmit={handleVerify}>
              <div>
                <label className="block text-sm font-medium text-[#472D2D]">Token Verifikasi</label>
                <input
                  type="text"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda"
                  placeholder="Masukkan 6 digit token"
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className="mt-4 w-full py-2 bg-coklat text-white rounded-lg font-semibold bg-[#553939] hover:bg-[#3f2a2a] transition cursor-pointer disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
            </form>
            <button
              onClick={handleResendToken}
              className="w-full text-coklat underline text-sm"
              disabled={isLoading}
            >
              Kirim ulang token
            </button>
          </div>
        )}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-2 text-gray-400 text-xs">Atau</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>
        <GoogleRegisterButton>Daftar dengan Akun Google</GoogleRegisterButton>
        <p className="text-center text-xs text-gray-400 mt-6">
          Sudah punya akun? <Link href="/login" className="text-coklatmuda underline hover:text-[#553939]">Masuk</Link>
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
