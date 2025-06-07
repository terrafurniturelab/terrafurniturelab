import { Checkout, CheckoutItem, Product, CheckoutState } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Package, ShoppingBag, Truck, CheckCircle, Clock, XCircle, MessageCircle, Star, Loader2 } from "lucide-react";

type CheckoutItemWithProduct = CheckoutItem & {
  product: Product;
  hasReview: boolean;
};

type OrderWithDetails = Checkout & {
  items: CheckoutItemWithProduct[];
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
      return <CheckCircle className="h-4 w-4" />;
    case "CANCELLED":
      return <XCircle className="h-4 w-4" />;
    case "PROCESSING":
      return <ShoppingBag className="h-4 w-4" />;
    case "SHIPPED":
      return <Truck className="h-4 w-4" />;
    case "PENDING":
      return <Clock className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

interface OrderCardProps {
  order: OrderWithDetails;
  onBuyAgain: (productId: string) => void;
  onContactSeller: (orderId: string) => void;
}

export function OrderCard({ order, onBuyAgain, onContactSeller }: OrderCardProps) {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [selectedItem, setSelectedItem] = useState<CheckoutItemWithProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleReviewSubmit = async () => {
    if (!review || !selectedItem) {
      toast.error("Mohon isi ulasan Anda");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          productId: selectedItem.productId,
          review,
          rating,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      // Update unreviewed count in navbar
      const unreviewedResponse = await fetch('/api/reviews/unreviewed-count');
      if (unreviewedResponse.ok) {
        const data = await unreviewedResponse.json();
        // Dispatch custom event to update navbar
        window.dispatchEvent(new CustomEvent('updateUnreviewedCount', { 
          detail: { count: data.count } 
        }));
      }

      // Update order items to reflect reviewed status
      const updatedOrderResponse = await fetch(`/api/orders/${order.id}`);
      if (updatedOrderResponse.ok) {
        const updatedOrder = await updatedOrderResponse.json();
        // Dispatch custom event to update order items
        window.dispatchEvent(new CustomEvent('updateOrderItems', { 
          detail: { orderId: order.id, items: updatedOrder.items } 
        }));
      }

      setReviewDialogOpen(false);
      setShowSuccessModal(true);
      setReview("");
      setRating(5);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Gagal mengirim ulasan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <CardHeader className="bg-white border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="sm:text-lg text-sm text-[#472D2D]">Pesanan #{order.id}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(order.createdAt), "dd MMMM yyyy", { locale: id })}
            </p>
          </div>
          <Badge variant={getStatusVariant(order.state)} className="flex items-center gap-1">
            {getStatusIcon(order.state)}
            {order.state}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-white">
        <div className="space-y-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 bg-muted/50 rounded-xl">
              <img
                src={item.product?.images?.[0] || '/placeholder.png'}
                alt={item.product?.name || 'Product'}
                className="w-full sm:w-28 h-48 sm:h-28 object-cover rounded-lg shadow-sm"
              />
              <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-lg text-[#472D2D]">{item.product?.name || 'Product not found'}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Jumlah: {item.quantity} item
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Harga Satuan: Rp {item.product?.price?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-base font-semibold">
                    Subtotal:
                    <span className="font-bold text-xl sm:text-2xl ml-2 text-[#472D2D]">
                      Rp{((item.quantity * (item.product?.price || 0))).toLocaleString()}
                    </span>
                  </p>
                  <div className="flex flex-col gap-2 mt-2">
                    {order.state === "DELIVERED" && (
                      <>
                        {!item.hasReview && (
                          <Button
                            variant="outline"
                            className="mt-2 flex items-center gap-2 bg-[#472D2D] text-white cursor-pointer w-full sm:w-auto relative"
                            onClick={() => {
                              setSelectedItem(item);
                              setReviewDialogOpen(true);
                            }}
                          >
                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              !
                            </div>
                            <Star className="h-4 w-4" />
                            Beri Ulasan
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-6 p-4 bg-[#472D2D]/5 rounded-xl">
            <p className="sm:text-lg text-xs sm:text-right text-left font-semibold">
              Total Keseluruhan:
              <span className="font-bold text-2xl ml-2 text-[#472D2D]">
                Rp{order.items.reduce((total, item) => total + (item.quantity * (item.product?.price || 0)), 0).toLocaleString()}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-4 border-t justify-end">
            <Button
              variant="outline"
              onClick={() => onBuyAgain(order.items[0].productId)}
              className="flex items-center gap-2 bg-[#472D2D] text-white cursor-pointer w-full sm:w-auto"
            >
              <ShoppingBag className="h-4 w-4" />
              Beli Lagi
            </Button>
            <Button
              variant="outline"
              onClick={() => onContactSeller(order.id)}
              className="flex items-center gap-2 hover:bg-[#472D2D] hover:text-white cursor-pointer w-full sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              Hubungi Penjual
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-[#472D2D]">Beri Ulasan</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Bagikan pengalaman Anda dengan produk ini
            </p>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium text-[#472D2D]">Rating Produk</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRating(value)}
                    className="focus:outline-none transform transition-transform hover:scale-110"
                    disabled={isSubmitting}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        value <= rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {rating === 5 ? "Sangat Puas" :
                 rating === 4 ? "Puas" :
                 rating === 3 ? "Cukup" :
                 rating === 2 ? "Kurang Puas" :
                 "Sangat Kurang Puas"}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="review" className="text-sm font-medium text-[#472D2D]">
                Ulasan Anda
              </label>
              <Textarea
                id="review"
                placeholder="Bagikan pengalaman Anda dengan produk ini..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-[150px] resize-none border-coklat-terang/20 focus:border-coklat-terang focus:ring-coklat-terang/20"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setReviewDialogOpen(false);
                  setReview("");
                  setRating(5);
                  setSelectedItem(null);
                }}
                className="flex-1 border-coklat-terang/20 text-coklat-tua hover:bg-coklat-terang/10"
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                onClick={handleReviewSubmit}
                className="flex-1 bg-[#472D2D] text-white hover:bg-[#472D2D]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Ulasan'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-[#472D2D] text-center">Ulasan Terkirim!</DialogTitle>
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Terima kasih telah berbagi pengalaman Anda dengan produk ini
            </p>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="bg-[#472D2D] text-white hover:bg-[#472D2D]/90"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 