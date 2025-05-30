import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";

const mona_sans = Mona_Sans({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-mona-sans',
  preload: true,
});

export const metadata: Metadata = {
  title: "FURNITURE LAB",
  description: "Furniture Lab is a furniture store that sells furniture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={mona_sans.className}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
