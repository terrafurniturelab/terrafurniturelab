'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShoppingBagIcon, 
  UsersIcon, 
  ShoppingCartIcon,
  TagIcon,
  CubeIcon,
  ArchiveBoxIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Stats {
  totalCategories: number;
  totalProductTypes: number;
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalDelivered: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      name: 'Total Kategori',
      value: stats?.totalCategories || 0,
      icon: TagIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Tipe Produk',
      value: stats?.totalProductTypes || 0,
      icon: CubeIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Produk',
      value: stats?.totalProducts || 0,
      icon: ArchiveBoxIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Pengguna',
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Total Pesanan',
      value: stats?.totalOrders || 0,
      icon: ShoppingCartIcon,
      color: 'bg-red-500',
    },
    {
      name: 'Pesanan Terkirim',
      value: stats?.totalDelivered || 0,
      icon: TruckIcon,
      color: 'bg-indigo-500',
    },
    {
      name: 'Total Pendapatan',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: CurrencyDollarIcon,
      color: 'bg-emerald-500',
    },
    {
      name: 'Rata-rata Pesanan',
      value: formatCurrency(stats?.averageOrderValue || 0),
      icon: ChartBarIcon,
      color: 'bg-pink-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#472D2D]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#472D2D] mb-6">Dashboard Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-[#472D2D] mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-[#472D2D] mb-4">Aktivitas Terbaru</h2>
        <p className="text-gray-600">Belum ada aktivitas</p>
      </div>
    </div>
  );
} 