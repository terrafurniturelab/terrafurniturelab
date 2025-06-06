import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
} 