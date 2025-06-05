import { Package, ShoppingBag, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  return (
    <Tabs value={currentStatus} onValueChange={onStatusChange} className="mb-8">
      <TabsList className="grid grid-cols-6 bg-white p-1 rounded-xl shadow-sm">
        {statusTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="cursor-pointer flex items-center gap-2 data-[state=active]:bg-[#472D2D] data-[state=active]:text-white"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
} 