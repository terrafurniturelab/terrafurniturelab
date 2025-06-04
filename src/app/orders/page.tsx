"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Checkout, CheckoutItem, Product, CheckoutState } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Package, ShoppingBag, Truck, CheckCircle, Clock, XCircle, Star, MessageCircle } from "lucide-react";

type OrderWithDetails = Checkout & {
  items: (CheckoutItem & {
    product: Product;
  })[];
};

const statusTabs = [
  { value: "semua", label: "Semua", icon: Package },
  { value: "diproses", label: "Diproses", icon: ShoppingBag },
  { value: "dikirim", label: "Dikirim", icon: Truck },
  { value: "selesai", label: "Selesai", icon: CheckCircle },
  { value: "ditunda", label: "Ditunda", icon: Clock },
  { value: "dibatalkan", label: "Dibatalkan", icon: XCircle },
] as const;

const statusMap: Record<string, CheckoutState> = {
  diproses: "PROCESSING",
  dikirim: "SHIPPED",
  selesai: "DELIVERED",
  ditunda: "PENDING",
  dibatalkan: "CANCELLED",
};

const getStatusVariant = (state: CheckoutState) => {
  switch (state) {
    case "DELIVERED":
      return "success";
    case "CANCELLED":
      return "destructive";
    case "PROCESSING":
      return "secondary";
    case "SHIPPED":
      return "default";
    case "PENDING":
      return "outline";
    default:
      return "default";
  }
};

const getStatusIcon = (state: CheckoutState) => {
  switch (state) {
    case "DELIVERED":
      return CheckCircle;
    case "CANCELLED":
      return XCircle;
    case "PROCESSING":
      return ShoppingBag;
    case "SHIPPED":
      return Truck;
    case "PENDING":
      return Clock;
    default:
      return Package;
  }
};

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [review, setReview] = useState("");

  const currentStatus = searchParams.get("status") || "semua";

  useEffect(() => {
    fetchOrders();
  }, [currentStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?status=${currentStatus}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Gagal memuat pesanan");
    } finally {
      setLoading(false);
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

  const handleReviewSubmit = async () => {
    if (!selectedOrder || !review) return;

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          review,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      toast.success("Ulasan berhasil dikirim");
      setReviewDialogOpen(false);
      setReview("");
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Gagal mengirim ulasan");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-primary">Pesanan Saya</h1>

            <Tabs value={currentStatus} onValueChange={handleStatusChange} className="mb-8">
              <TabsList className="grid grid-cols-6 bg-white p-1 rounded-xl shadow-sm">
                {statusTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

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
                {orders.map((order) => {
                  const StatusIcon = getStatusIcon(order.state);
                  return (
                    <Card key={order.id} className="overflow-hidden border-none shadow-md">
                      <CardHeader className="bg-white border-b">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg text-primary">Pesanan #{order.id}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(order.createdAt), "dd MMMM yyyy", { locale: id })}
                            </p>
                          </div>
                          <Badge variant={getStatusVariant(order.state)} className="flex items-center gap-1">
                            <StatusIcon className="h-4 w-4" />
                            {order.state}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 bg-white">
                        <div className="space-y-6">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-6 p-4 bg-muted/50 rounded-xl">
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-28 h-28 object-cover rounded-lg shadow-sm"
                              />
                              <div className="flex-1">
                                <h3 className="font-medium text-lg text-primary">{item.product.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Jumlah: {item.quantity} x Rp {item.product.price.toLocaleString()}
                                </p>
                                <p className="text-sm font-medium mt-2 text-secondary">
                                  Total: Rp {(item.quantity * item.product.price).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div className="flex flex-wrap gap-3 pt-4 border-t">
                            <Button
                              variant="outline"
                              onClick={() => handleBuyAgain(order.items[0].productId)}
                              className="flex items-center gap-2 hover:bg-primary hover:text-white"
                            >
                              <ShoppingBag className="h-4 w-4" />
                              Beli Lagi
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleContactSeller(order.id)}
                              className="flex items-center gap-2 hover:bg-primary hover:text-white"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Hubungi Penjual
                            </Button>
                            {order.state === "DELIVERED" && (
                              <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedOrder(order)}
                                    className="flex items-center gap-2 hover:bg-primary hover:text-white"
                                  >
                                    <Star className="h-4 w-4" />
                                    Beri Ulasan
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Beri Ulasan</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Textarea
                                      placeholder="Tulis ulasan Anda..."
                                      value={review}
                                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReview(e.target.value)}
                                      className="min-h-[150px] resize-none"
                                    />
                                    <Button onClick={handleReviewSubmit} className="w-full">
                                      Kirim Ulasan
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 