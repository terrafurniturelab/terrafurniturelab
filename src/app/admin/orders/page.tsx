"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PencilIcon, XCircleIcon, ClockIcon, CheckCircleIcon, TruckIcon, InboxIcon } from "@heroicons/react/24/outline";

interface Checkout {
  id: string;
  quantity: number;
  state: string;
  paymentProof: string | null;
  product: {
    id: string;
    name: string;
    images: string[];
    stock: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  address: {
    fullName: string;
    phoneNumber: string;
    province: string;
    city: string;
    kecamatan: string;
    kodePos: string;
    alamatLengkap: string;
  };
}

const CHECKOUT_STATES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_ICON: Record<string, React.ReactNode> = {
  PENDING: <ClockIcon className="h-5 w-5 text-yellow-500" />, // Pending
  PROCESSING: <CheckCircleIcon className="h-5 w-5 text-blue-500" />, // Processing
  SHIPPED: <TruckIcon className="h-5 w-5 text-orange-500" />, // Shipped
  DELIVERED: <InboxIcon className="h-5 w-5 text-green-500" />, // Delivered
  CANCELLED: <XCircleIcon className="h-5 w-5 text-red-500" />, // Cancelled
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Gagal mengambil data pesanan");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (order: Checkout, newState: string) => {
    setUpdatingId(order.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newState }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status pesanan");
      await fetchOrders();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#472D2D]">Kelola Pemesanan</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase w-20">Barang</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase w-16">Qty</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase">Email</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase">No. Telp</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase w-64">Alamat Pengiriman</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase w-24">Bukti</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase w-32">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 cursor-pointer group"
                onClick={e => {
                  // Prevent row click if status dropdown is clicked
                  if ((e.target as HTMLElement).tagName === 'SELECT') return;
                  router.push(`/admin/orders/${order.id}`);
                }}
              >
                <td className="px-2 py-2 text-center">
                  <div className="w-12 h-12 relative mx-auto">
                    <Image
                      src={order.product.images[0] || "/placeholder.png"}
                      alt={order.product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="truncate max-w-[80px] mx-auto text-xs mt-1">{order.product.name}</div>
                </td>
                <td className="px-2 py-2 text-center">{order.quantity}</td>
                <td className="px-2 py-2">{order.address.fullName}</td>
                <td className="px-2 py-2">{order.user.email}</td>
                <td className="px-2 py-2">{order.address.phoneNumber}</td>
                <td className="px-2 py-2 max-w-xs whitespace-pre-line break-words text-xs">
                  <span className="block truncate" title={order.address.alamatLengkap + ', ' + order.address.kecamatan + ', ' + order.address.city + ', ' + order.address.province + ', ' + order.address.kodePos}>
                    {order.address.alamatLengkap}, {order.address.kecamatan}, {order.address.city}, {order.address.province}, {order.address.kodePos}
                  </span>
                </td>
                <td className="px-2 py-2 text-center">
                  {order.paymentProof ? (
                    <a href={order.paymentProof} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                      <Image src={order.paymentProof} alt="Bukti" width={48} height={48} className="rounded border mx-auto" />
                    </a>
                  ) : (
                    <span className="text-gray-400">Belum ada</span>
                  )}
                </td>
                <td className="px-2 py-2 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="flex items-center gap-1 justify-center mb-1">
                      {STATUS_ICON[order.state]}
                      <span className="text-xs font-semibold">{order.state}</span>
                    </span>
                    <select
                      className="border rounded px-2 py-1 text-xs focus:ring-[#472D2D] focus:border-[#472D2D]"
                      value={order.state}
                      disabled={updatingId === order.id}
                      onClick={e => e.stopPropagation()}
                      onChange={e => handleStatusChange(order, e.target.value)}
                    >
                      {CHECKOUT_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <div className="mt-4 text-center text-gray-500">Memuat...</div>}
    </div>
  );
} 