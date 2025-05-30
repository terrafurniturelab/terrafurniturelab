"use client";

import React, { useState } from "react";
import CardAuth from "@/components/CardAuth";
import GoogleButton from "@/components/GoogleButton";
import Link from "next/link";
import Modal from "@/components/Modal";

export default function Register() {
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMsg, setModalMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (form.password !== form.confirmPassword) {
      setModalTitle("Registrasi Gagal");
      setModalMsg("Password dan konfirmasi tidak sama.");
      setModalOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowTokenInput(true);
        setEmail(form.email);
        setMessage({ type: 'success', text: 'Token sent to your email. Please check your inbox.' });
      } else {
        setModalTitle("Registrasi Gagal");
        setModalMsg(data.error || 'Registration failed.');
        setModalOpen(true);
      }
    } catch (err) {
      setModalTitle("Registrasi Gagal");
      setModalMsg('Something went wrong.');
      setModalOpen(true);
    }
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json();
      if (res.ok) {
        setModalTitle("Registrasi Berhasil");
        setModalMsg('Akun Anda berhasil dibuat! Silakan login.');
        setModalOpen(true);
        setShowTokenInput(false);
      } else {
        setModalTitle("Verifikasi Gagal");
        setModalMsg(data.error || 'Token verification failed.');
        setModalOpen(true);
      }
    } catch (err) {
      setModalTitle("Verifikasi Gagal");
      setModalMsg('Something went wrong.');
      setModalOpen(true);
    }
    setLoading(false);
  };

  const handleResendToken = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/resend-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Token berhasil dikirim ulang ke email Anda.' });
      } else {
        setModalTitle("Resend Token Gagal");
        setModalMsg(data.error || 'Gagal mengirim ulang token.');
        setModalOpen(true);
      }
    } catch (err) {
      setModalTitle("Resend Token Gagal");
      setModalMsg('Something went wrong.');
      setModalOpen(true);
    }
    setLoading(false);
  };

  return (
    <CardAuth title="Daftar Akun" subtitle="Silahkan daftar untuk melanjutkan pembelian">
      {message && (
        <div className={`mb-4 p-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.text}</div>
      )}
      {!showTokenInput ? (
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-[#472D2D]">Username</label>
            <input name="username" type="text" className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda" placeholder="Username" required value={form.username} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#472D2D]">Email</label>
            <input name="email" type="email" className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda" placeholder="Email address" required value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#472D2D]">Password</label>
            <input name="password" type="password" className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda" placeholder="Password" required value={form.password} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#472D2D]">Confirm Password</label>
            <input name="confirmPassword" type="password" className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda" placeholder="Confirm Password" required value={form.confirmPassword} onChange={handleChange} />
          </div>
          <button type="submit" className="mt-4 w-full py-2 bg-coklat text-white rounded-lg font-semibold bg-[#553939] hover:bg-[#3f2a2a] transition cursor-pointer" disabled={loading}>{loading ? 'Mendaftar...' : 'Daftar'}</button>
        </form>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-coklat mb-2 text-center">Verifikasi Email</h2>
          <p className="text-sm text-gray-600 mb-4 text-center">Masukkan 6 digit token yang telah dikirim ke email Anda.</p>
          <form className="space-y-4" onSubmit={handleVerify}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Verification Token</label>
              <input type="text" maxLength={6} className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda" placeholder="Enter 6-digit token" required value={token} onChange={e => setToken(e.target.value)} />
            </div>
            <button type="submit" className="w-full py-2 bg-coklat text-white rounded-lg font-semibold hover:bg-coklatmuda transition" disabled={loading}>{loading ? 'Verifying...' : 'Verify Token'}</button>
          </form>
          <button className="mt-4 w-full text-coklat underline text-sm" onClick={handleResendToken} disabled={loading}>Kirim ulang token</button>
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
        <p>{modalMsg}</p>
      </Modal>
    </CardAuth>
  );
}
