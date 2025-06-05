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
import { Package, ShoppingBag, Truck, CheckCircle, Clock, XCircle, MessageCircle, Star } from "lucide-react";

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

  const handleReviewSubmit = async (itemId: string) => {
    if (!review) {
      toast.error("Mohon isi ulasan Anda");
      return;
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          review,
          rating,
          itemId,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      toast.success("Ulasan berhasil dikirim");
      setReviewDialogOpen(false);
      setReview("");
      setRating(5);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Gagal mengirim ulasan");
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
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-full sm:w-28 h-48 sm:h-28 object-cover rounded-lg shadow-sm"
              />
              <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-lg text-[#472D2D]">{item.product.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Jumlah: {item.quantity} item
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Harga Satuan: Rp {item.product.price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-base font-semibold">
                    Total:
                    <span className="font-bold text-xl sm:text-2xl ml-2 text-[#472D2D]">
                      Rp{(item.quantity * item.product.price).toLocaleString()}
                    </span>
                  </p>
                  <div className="flex flex-col gap-2 mt-2">
                    {order.state === "DELIVERED" && (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#472D2D]">Status Ulasan:</p>
                          {item.hasReview ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Sudah Diberi Ulasan
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Belum Diberi Ulasan
                            </span>
                          )}
                        </div>
                        {!item.hasReview && (
                          <Button
                            variant="outline"
                            className="flex items-center gap-2 bg-[#472D2D] text-white cursor-pointer w-full sm:w-auto"
                            onClick={() => {
                              setSelectedItem(item);
                              setReviewDialogOpen(true);
                            }}
                          >
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
              >
                Batal
              </Button>
              <Button
                onClick={() => {
                  if (selectedItem) {
                    handleReviewSubmit(selectedItem.id);
                  }
                }}
                className="flex-1 bg-[#472D2D] text-white hover:bg-[#472D2D]/90"
              >
                Kirim Ulasan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 