import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "FIELDWORK — Everyday gear, built to last",
  description:
    "A full-stack storefront demo: Next.js, TypeScript, Stripe, real-time inventory, and animated cart.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Header />
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}
