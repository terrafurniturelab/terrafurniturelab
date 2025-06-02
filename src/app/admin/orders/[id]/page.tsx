"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/orders/${params.id}`);
        if (!res.ok) throw new Error("Gagal mengambil detail pesanan");
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchOrder();
  }, [params.id]);

  if (loading) return <div className="p-8 text-center">Memuat...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!order) return <div className="p-8 text-center">Pesanan tidak ditemukan</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <button
        className="mb-4 text-[#472D2D] hover:underline text-sm"
        onClick={() => router.back()}
      >
        &larr; Kembali ke daftar pesanan
      </button>
      <h1 className="text-2xl font-bold mb-4 text-[#472D2D]">Detail Pesanan</h1>
      <div className="mb-4 flex gap-4 items-center">
        <div className="w-20 h-20 relative">
          <Image
            src={order.product.images[0] || "/placeholder.png"}
            alt={order.product.name}
            fill
            className="object-cover rounded"
          />
        </div>
        <div>
          <div className="font-semibold text-lg">{order.product.name}</div>
          <div className="text-sm text-gray-500">Qty: {order.quantity}</div>
        </div>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Status:</span> <span className="inline-block px-2 py-1 rounded bg-gray-100 text-xs font-mono">{order.state}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Nama Pemesan:</span> {order.address.fullName}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Email:</span> {order.user.email}
      </div>
      <div className="mb-2">
        <span className="font-semibold">No. Telepon:</span> {order.address.phoneNumber}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Alamat Pengiriman:</span>
        <div className="text-xs text-gray-700 mt-1">
          {order.address.alamatLengkap}, {order.address.kecamatan}, {order.address.city}, {order.address.province}, {order.address.kodePos}
        </div>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Bukti Pembayaran:</span>
        {order.paymentProof ? (
          <a href={order.paymentProof} target="_blank" rel="noopener noreferrer" className="block mt-1">
            <Image src={order.paymentProof} alt="Bukti" width={120} height={120} className="rounded border" />
          </a>
        ) : (
          <span className="text-gray-400 ml-2">Belum ada</span>
        )}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Tanggal Pesanan:</span> {new Date(order.createdAt).toLocaleString("id-ID")}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Terakhir Diperbarui:</span> {new Date(order.updatedAt).toLocaleString("id-ID")}
      </div>
    </div>
  );
} 