'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  CubeIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  InboxIcon
} from '@heroicons/react/24/outline';

interface Stats {
  totalCategories: number;
  totalProductTypes: number;
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  recentOrders: {
    id: string;
    state: string;
    createdAt: string;
    items: {
      quantity: number;
      product: {
        name: string;
        price: number;
      };
    }[];
    user: {
      name: string;
    };
  }[];
  productsByCategory: {
    categoryId: string;
    categoryName: string;
    count: number;
  }[];
  lowStockProducts: {
    id: string;
    name: string;
    stock: number;
    category: {
      name: string;
    };
  }[];
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  PENDING: <ClockIcon className="h-5 w-5 text-yellow-500" />,
  PROCESSING: <CheckCircleIcon className="h-5 w-5 text-blue-500" />,
  SHIPPED: <TruckIcon className="h-5 w-5 text-orange-500" />,
  DELIVERED: <InboxIcon className="h-5 w-5 text-green-500" />,
  CANCELLED: <ClockIcon className="h-5 w-5 text-red-500" />,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#472D2D]">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#472D2D] bg-opacity-10">
              <CubeIcon className="h-6 w-6 text-[#472D2D]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Kategori</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalCategories}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#472D2D] bg-opacity-10">
              <ShoppingBagIcon className="h-6 w-6 text-[#472D2D]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tipe Produk</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalProductTypes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#472D2D] bg-opacity-10">
              <CubeIcon className="h-6 w-6 text-[#472D2D]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Produk</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#472D2D] bg-opacity-10">
              <UserGroupIcon className="h-6 w-6 text-[#472D2D]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#472D2D] bg-opacity-10">
              <ShoppingBagIcon className="h-6 w-6 text-[#472D2D]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#472D2D] bg-opacity-10">
              <TruckIcon className="h-6 w-6 text-[#472D2D]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pesanan Terkirim</p>
              <p className="text-lg font-semibold text-gray-900">{stats.deliveredOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#472D2D] bg-opacity-10">
              <CurrencyDollarIcon className="h-6 w-6 text-[#472D2D]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#472D2D] mb-4">Produk per Kategori</h2>
          <div className="space-y-3">
            {stats.productsByCategory.map((category) => (
              <div key={category.categoryId} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{category.categoryName}</span>
                <span className="text-sm font-medium text-gray-900">{category.count} produk</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#472D2D] mb-4">Stok Menipis</h2>
          <div className="space-y-3">
            {stats.lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                  <span className="text-xs text-gray-500 block">{product.category.name}</span>
                </div>
                <span className="text-sm font-medium text-red-600">{product.stock} tersisa</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#472D2D] mb-4">Pesanan Terbaru</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <tr 
                  key={order.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="flex items-center text-sm">
                      {STATUS_ICON[order.state]}
                      <span className="ml-1">{order.state}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(order.items.reduce((total, item) => total + (item.product.price * item.quantity), 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 