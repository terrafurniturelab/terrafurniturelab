import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const mona = Mona_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Furniture Lab - Premium Furniture Store",
  description: "Transform your space with our premium furniture collection.",
  icons: {
    icon: "/logoTF.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={mona.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
