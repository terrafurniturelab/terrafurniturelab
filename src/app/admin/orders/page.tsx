"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PencilIcon, XCircleIcon, ClockIcon, CheckCircleIcon, TruckIcon, InboxIcon} from "@heroicons/react/24/outline";

interface CheckoutItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    images: string[];
    stock: number;
    price: number;
  };
}

interface Checkout {
  id: string;
  state: string;
  paymentProof: string | null;
  createdAt: string;
  items: CheckoutItem[];
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

const renderStatusBadge = (state: string) => (
  <span className="flex items-center gap-1">
    {STATUS_ICON[state]}
    <span className="text-sm font-medium">{state}</span>
  </span>
);

type SortOrder = 'newest' | 'oldest';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [processingCount, setProcessingCount] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();

  const handleEditClick = (order: Checkout) => {
    router.push(`/admin/orders/${order.id}`);
  };

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
    // Fetch processing count
    fetch('/api/admin/orders/count')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data.processingCount === 'number') {
          setProcessingCount(data.processingCount);
        }
      });
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

  // Filter dan sort orders
  const filteredAndSortedOrders = orders
    .filter(order => statusFilter === 'ALL' || order.state === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-[#472D2D]">Kelola Pemesanan</h1>
      
      {/* Filter dan Sort Controls */}
      <div className="mb-4 flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <div className="relative">
            <button
              className="border rounded px-2 py-1 text-sm focus:ring-[#472D2D] focus:border-[#472D2D] min-w-[120px] flex items-center justify-between"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              {processingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {processingCount}
                </span>
              )}
              <span>{statusFilter === 'ALL' ? 'Semua Status' : statusFilter}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isFilterOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                <button
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                    statusFilter === 'ALL' ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => {
                    setStatusFilter('ALL');
                    setIsFilterOpen(false);
                  }}
                >
                  Semua Status
                </button>
                {CHECKOUT_STATES.map(state => (
                  <button
                    key={state}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between relative ${
                      statusFilter === state ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => {
                      setStatusFilter(state);
                      setIsFilterOpen(false);
                    }}
                  >
                    <span>{state}</span>
                    {state === 'PROCESSING' && processingCount > 0 && (
                      <span className="absolute right-0 top-1 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {processingCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Urutkan:</label>
          <select
            className="border rounded px-2 py-1 text-sm focus:ring-[#472D2D] focus:border-[#472D2D]"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase w-32">Barang</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase w-8">Qty</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase w-20">Nama</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase w-28">Email</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase w-14">No. Telp</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase w-28">Alamat Pengiriman</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase w-12">Bukti</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase w-20">Total</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase w-20">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-2 py-4 text-center text-gray-500">
                  Belum ada pemesanan
                </td>
              </tr>
            ) : (
              filteredAndSortedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 cursor-pointer group"
                  onClick={e => {
                    if ((e.target as HTMLElement).tagName === 'SELECT') return;
                    router.push(`/admin/orders/${order.id}`);
                  }}
                >
                  <td className="px-2 py-2">
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="w-12 h-12 relative">
                            <Image
                              src={item.product.images[0] || "/images/placeholder.png"}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                              {item.product.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center">
                    {order.items.reduce((total, item) => total + item.quantity, 0)}
                  </td>
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
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(order.items.reduce((total, item) => total + (item.product.price * item.quantity), 0))}
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
              ))
            )}
          </tbody>
        </table>
      </div>
      {loading && <div className="mt-4 text-center text-gray-500">Memuat...</div>}
    </div>
  );
} 