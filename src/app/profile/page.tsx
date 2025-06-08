'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, CheckCircle, Clock, ShoppingBag, Settings, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  state: 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  items: {
    quantity: number;
    product: {
      price: number;
    };
  }[];
}

interface OrderStats {
  total: number;
  delivered: number;
  processing: number;
  pending: number;
  cancelled: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    delivered: 0,
    processing: 0,
    pending: 0,
    cancelled: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersResponse = await fetch('/api/orders?status=semua');
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          // Sort by createdAt in descending order and take first 5
          const sortedOrders = ordersData.sort((a: Order, b: Order) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ).slice(0, 5);
          setRecentOrders(sortedOrders);

          // Calculate stats from orders data
          const stats = {
            total: ordersData.length,
            delivered: ordersData.filter((order: Order) => order.state === 'DELIVERED').length,
            processing: ordersData.filter((order: Order) => order.state === 'PROCESSING').length,
            pending: ordersData.filter((order: Order) => order.state === 'PENDING').length,
            cancelled: ordersData.filter((order: Order) => order.state === 'CANCELLED').length,
          };
          setStats(stats);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hari ini';
    } else if (diffDays === 1) {
      return 'Kemarin';
    } else {
      return `${diffDays} hari yang lalu`;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-50 text-gray-600';
    
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-50 text-green-600';
      case 'PROCESSING':
        return 'bg-yellow-50 text-yellow-600';
      case 'PENDING':
        return 'bg-blue-50 text-blue-600';
      case 'CANCELLED':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getStatusText = (status: string | undefined) => {
    if (!status) return 'Tidak diketahui';
    
    switch (status) {
      case 'DELIVERED':
        return 'Dikirim';
      case 'PROCESSING':
        return 'Diproses';
      case 'PENDING':
        return 'Menunggu';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#472D2D]">My Account</h1>
            <p className="text-[#8B6B4A] mt-1">Welcome back, {session.user?.name}</p>
          </div>
          <Button 
            onClick={() => router.push('/profile/editprofile')}
            className="bg-[#472D2D] hover:bg-[#472D2D]/90 text-white px-6"
          >
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1 bg-white shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-[#472D2D]/10">
                  <Image
                    src={session.user?.image || '/user.png'}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-6 text-center">
                  <h2 className="text-xl font-semibold text-[#472D2D]">{session.user?.name}</h2>
                  <p className="text-[#8B6B4A] mt-1">{session.user?.email}</p>
                </div>
                <div className="w-full mt-8 space-y-3">
                  <Button 
                    variant="outline" 
                    className="cursor-pointer w-full justify-start gap-2 text-white bg-[#472D2D] hover:bg-[#291818]"
                    onClick={() => router.push('/orders')}
                  >
                    <Package className="h-5 w-5" />
                    Pesanan Saya
                  </Button>
                  <Button 
                    variant="outline" 
                    className="cursor-pointer w-full justify-start gap-2 text-[#472D2D] hover:text-[#472D2D] hover:border-[#472D2D]"
                    onClick={() => router.push('/profile/editprofile')}
                  >
                    <Settings className="h-5 w-5" />
                    Pengaturan Akun
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats and Orders Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-[#472D2D]/10">
                        <ShoppingBag className="h-5 w-5 text-[#472D2D]" />
                      </div>
                      <p className="text-sm font-medium text-[#8B6B4A]">Total Pesanan</p>
                    </div>
                    <p className="text-2xl font-semibold text-[#472D2D]">{stats.total}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-green-50">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-[#8B6B4A]">Dikirim</p>
                    </div>
                    <p className="text-2xl font-semibold text-[#472D2D]">{stats.delivered}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-yellow-50">
                        <Truck className="h-5 w-5 text-yellow-600" />
                      </div>
                      <p className="text-sm font-medium text-[#8B6B4A]">Diproses</p>
                    </div>
                    <p className="text-2xl font-semibold text-[#472D2D]">{stats.processing}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-[#8B6B4A]">Menunggu</p>
                    </div>
                    <p className="text-2xl font-semibold text-[#472D2D]">{stats.pending}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-red-50">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <p className="text-sm font-medium text-[#8B6B4A]">Dibatalkan</p>
                    </div>
                    <p className="text-2xl font-semibold text-[#472D2D]">{stats.cancelled}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-[#472D2D]">Pesanan Terbaru</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-[#472D2D]/10">
                              <Package className="h-5 w-5 text-[#472D2D]" />
                            </div>
                            <div>
                              <p className="font-medium text-[#472D2D]">Order #{order.id}</p>
                              <p className="text-sm text-[#8B6B4A]">
                                {order.items.length} items • {formatPrice(order.items.reduce((total, item) => total + (item.quantity * item.product.price), 0))}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.state)}`}>
                              {getStatusText(order.state)}
                            </span>
                            <p className="text-xs text-[#8B6B4A] mt-1">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-[#8B6B4A]">Belum ada pesanan</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 