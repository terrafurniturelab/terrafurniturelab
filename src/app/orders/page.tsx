"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Checkout, CheckoutItem, Product } from "@prisma/client";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { OrderStatusTabs } from "@/components/orders/OrderStatusTabs";
import { OrderCard } from "@/components/orders/OrderCard";

type CheckoutItemWithProduct = CheckoutItem & {
  product: Product;
  hasReview: boolean;
};

type OrderWithDetails = Checkout & {
  items: CheckoutItemWithProduct[];
};

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreviewedOrders, setUnreviewedOrders] = useState<OrderWithDetails[]>([]);

  const currentStatus = searchParams.get("status") || "semua";

  useEffect(() => {
    fetchOrders();
    if (currentStatus === "selesai") {
      fetchUnreviewedOrders();
    }

    const handleOrderItemsUpdate = (event: CustomEvent) => {
      const { orderId, items } = event.detail;
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, items } 
            : order
        )
      );
    };

    window.addEventListener('updateOrderItems', handleOrderItemsUpdate as EventListener);

    return () => {
      window.removeEventListener('updateOrderItems', handleOrderItemsUpdate as EventListener);
    };
  }, [currentStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?status=${currentStatus}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      
      // Fetch review status for each order's items
      const ordersWithReviewStatus = await Promise.all(
        data.map(async (order: OrderWithDetails) => {
          const orderResponse = await fetch(`/api/orders/${order.id}`);
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            return orderData;
          }
          return order;
        })
      );
      
      setOrders(ordersWithReviewStatus);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreviewedOrders = async () => {
    try {
      const response = await fetch('/api/reviews/unreviewed-count');
      if (!response.ok) throw new Error("Failed to fetch unreviewed orders");
      const data = await response.json();
      setUnreviewedOrders(data.orders);
    } catch (error) {
      console.error("Error fetching unreviewed orders:", error);
    }
  };

  const handleStatusChange = (status: string) => {
    router.push(`/orders?status=${status}`);
  };

  const handleBuyAgain = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleContactSeller = (orderId: string) => {
    router.push(`/chat/${orderId}`);
  };

  const handleReview = (productId: string) => {
    router.push(`/products/${productId}/review`);
  };

  return (
    <main className="flex-1 mt-16">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-primary mt-12">Pesanan Saya</h1>

          <OrderStatusTabs currentStatus={currentStatus} onStatusChange={handleStatusChange} />

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Memuat pesanan...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Tidak ada pesanan</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onBuyAgain={handleBuyAgain}
                  onContactSeller={handleContactSeller}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 