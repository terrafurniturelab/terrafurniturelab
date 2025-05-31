'use client';

import React, { useState } from "react";
import CardAuth from "@/components/CardAuth";
import Link from "next/link";
import ModalCenter from "@/components/ModalCenter";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'error' | 'success' | 'info'>("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setModalTitle("Gagal");
        setModalDesc(data.error || "Terjadi kesalahan saat memproses permintaan");
        setModalStatus('error');
        setModalOpen(true);
        return;
      }

      setModalTitle("Berhasil");
      setModalDesc("Silahkan cek email Anda untuk kode verifikasi");
      setModalStatus('success');
      setModalOpen(true);
      setShowResetForm(true);
    } catch (error) {
      console.error('Request reset error:', error);
      setModalTitle("Gagal");
      setModalDesc("Terjadi kesalahan saat memproses permintaan");
      setModalStatus('error');
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setModalTitle("Gagal");
      setModalDesc("Password dan konfirmasi password tidak cocok");
      setModalStatus('error');
      setModalOpen(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setModalTitle("Gagal");
        setModalDesc(data.error || "Token tidak valid atau sudah kadaluarsa");
        setModalStatus('error');
        setModalOpen(true);
        return;
      }

      setModalTitle("Berhasil");
      setModalDesc("Password Anda telah berhasil diubah. Silahkan login dengan password baru.");
      setModalStatus('success');
      setModalOpen(true);
      
      // Redirect to login page after successful password reset
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      setModalTitle("Gagal");
      setModalDesc("Terjadi kesalahan saat mengubah password");
      setModalStatus('error');
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendToken = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/resend-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setModalTitle("Gagal");
        setModalDesc(data.error || "Gagal mengirim ulang token");
        setModalStatus('error');
        setModalOpen(true);
        return;
      }

      setModalTitle("Berhasil");
      setModalDesc("Token baru telah dikirim ke email Anda");
      setModalStatus('success');
      setModalOpen(true);
    } catch (error) {
      console.error('Resend token error:', error);
      setModalTitle("Gagal");
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
      <CardAuth title="Lupa Kata Sandi" subtitle="Masukkan email Anda untuk reset kata sandi">
        {!showResetForm ? (
          <form className="space-y-4" onSubmit={handleRequestReset}>
            <div>
              <label className="block text-sm font-medium text-[#472D2D]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda"
                placeholder="Masukkan email"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="mt-4 w-full py-2 bg-coklat text-white rounded-lg font-semibold bg-[#553939] hover:bg-[#3f2a2a] transition cursor-pointer disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Memuat...' : 'Kirim Kode Verifikasi'}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-sm font-medium text-[#472D2D]">Kode Verifikasi</label>
              <input
                type="text"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda"
                placeholder="Masukkan 6 digit kode"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#472D2D]">Kata Sandi Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda"
                placeholder="Masukkan kata sandi baru"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#472D2D]">Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda"
                placeholder="Konfirmasi kata sandi baru"
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
              {isLoading ? 'Memuat...' : 'Reset Kata Sandi'}
            </button>
            <button
              type="button"
              onClick={handleResendToken}
              className="w-full text-coklat underline text-sm"
              disabled={isLoading}
            >
              Kirim ulang kode
            </button>
          </form>
        )}
        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/login" className="text-coklatmuda underline hover:text-[#553939]">Kembali ke Login</Link>
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