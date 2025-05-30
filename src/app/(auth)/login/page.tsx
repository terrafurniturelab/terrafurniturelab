"use client";

import React, { useState } from "react";
import CardAuth from "@/components/CardAuth";
import GoogleButton from "@/components/GoogleButton";
import Modal from "@/components/Modal";
import Link from "next/link";

export default function Login() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  // Dummy handleLogin, ganti dengan logic backend
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // ...login logic...
    // Jika gagal:
    setModalMsg("Akun tidak ditemukan atau password salah.");
    setModalOpen(true);
  };

  return (
    <CardAuth title="Selamat Datang" subtitle="Silahkan masuk untuk melanjutkan pembelian">
      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-medium text-[#472D2D]">Email</label>
          <input type="email" className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda" placeholder="Masukkan Email" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#472D2D]">Kata Sandi</label>
          <input type="password" className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coklatmuda" placeholder="Masukkan Kata Sandi" required />
        </div>
        <button type="submit" className="mt-4 w-full py-2 bg-coklat text-white rounded-lg font-semibold bg-[#553939] hover:bg-[#3f2a2a] transition cursor-pointer">Masuk</button>
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Login Gagal">
        <p>{modalMsg}</p>
      </Modal>
    </CardAuth>
  );
}
