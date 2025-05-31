'use client';

import React, { useState } from "react";
import CardAuth from "@/components/CardAuth";
import GoogleButton from "@/components/GoogleButton";
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
    username: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setModalTitle("Registrasi gagal");
      setModalDesc("Password dan konfirmasi password tidak cocok");
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
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setModalTitle("Registrasi gagal");
        setModalDesc(data.error || "Terjadi kesalahan saat registrasi");
        setModalStatus('error');
        setModalOpen(true);
        return;
      }

      setModalTitle("Registrasi berhasil");
      setModalDesc("Silahkan cek email Anda untuk verifikasi");
      setModalStatus('success');
      setModalOpen(true);
      setShowTokenInput(true);
      setRegisteredEmail(formData.email);
    } catch (error) {
      console.error('Registration error:', error);
      setModalTitle("Registrasi gagal");
      setModalDesc("Terjadi kesalahan saat registrasi");
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
        setModalTitle("Verifikasi gagal");
        setModalDesc(data.error || "Token tidak valid atau sudah kadaluarsa");
        setModalStatus('error');
        setModalOpen(true);
        return;
      }

      setModalTitle("Verifikasi berhasil");
      setModalDesc("Akun Anda telah terverifikasi. Silahkan login.");
      setModalStatus('success');
      setModalOpen(true);
      
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Verification error:', error);
      setModalTitle("Verifikasi gagal");
      setModalDesc("Terjadi kesalahan saat verifikasi");
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
        setModalTitle("Gagal mengirim ulang token");
        setModalDesc(data.error || "Gagal mengirim ulang token");
        setModalStatus('error');
        setModalOpen(true);
        return;
      }

      setModalTitle("Token terkirim");
      setModalDesc("Token baru telah dikirim ke email Anda");
      setModalStatus('success');
      setModalOpen(true);
    } catch (error) {
      console.error('Resend token error:', error);
      setModalTitle("Gagal mengirim ulang token");
      setModalDesc("Terjadi kesalahan saat mengirim ulang token");
      setModalStatus('error');
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <CardAuth title="Daftar" subtitle="Buat akun baru untuk melanjutkan">
        {!showTokenInput ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-[#472D2D]">Nama</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda"
                placeholder="Masukkan nama"
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
                minLength={6}
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
                placeholder="Konfirmasi kata sandi"
                required
                minLength={6}
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
        <GoogleButton>Daftar dengan Akun Google</GoogleButton>
        <p className="text-center text-xs text-gray-400 mt-6">
          Sudah punya akun? <Link href="/login" className="text-coklatmuda underline hover:text-[#553939]">Masuk</Link>
        </p>
        <ModalCenter
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          status={modalStatus}
          title={modalTitle}
          description={modalDesc}
          okText="OK"
        />
      </CardAuth>
    </>
  );
}
