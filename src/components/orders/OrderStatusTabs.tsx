import { Package, ShoppingBag, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

const statusTabs = [
  { value: "semua", label: "Semua", icon: Package },
  { value: "diproses", label: "Diproses", icon: ShoppingBag },
  { value: "dikirim", label: "Dikirim", icon: Truck },
  { value: "selesai", label: "Selesai", icon: CheckCircle },
  { value: "ditunda", label: "Ditunda", icon: Clock },
  { value: "dibatalkan", label: "Dibatalkan", icon: XCircle },
] as const;

interface OrderStatusTabsProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

export function OrderStatusTabs({ currentStatus, onStatusChange }: OrderStatusTabsProps) {
  const [unreviewedCount, setUnreviewedCount] = useState(0);

  useEffect(() => {
    const fetchUnreviewedCount = async () => {
      try {
        const response = await fetch('/api/reviews/unreviewed-count');
        if (response.ok) {
          const data = await response.json();
          setUnreviewedCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching unreviewed count:', error);
      }
    };

    fetchUnreviewedCount();

    // Listen for updates to unreviewed count
    const handleUnreviewedCountUpdate = (event: CustomEvent) => {
      setUnreviewedCount(event.detail.count);
    };

    window.addEventListener('updateUnreviewedCount', handleUnreviewedCountUpdate as EventListener);

    return () => {
      window.removeEventListener('updateUnreviewedCount', handleUnreviewedCountUpdate as EventListener);
    };
  }, []);

  return (
    <Tabs value={currentStatus} onValueChange={onStatusChange} className="mb-8">
      <TabsList className="grid grid-cols-6 bg-white p-1 rounded-xl shadow-sm">
        {statusTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="cursor-pointer flex items-center gap-2 data-[state=active]:bg-[#472D2D] data-[state=active]:text-white relative"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.value === "selesai" && unreviewedCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreviewedCount}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
} 