import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PharmaPro — Genuine Medicines Delivered",
  description: "Order genuine medicines, upload prescriptions, and get doorstep delivery across Nepal.",
};


function BottomNavWrapper() {
  "use client";
  if (typeof window === "undefined") return null;
  const path = window.location.pathname;
  if (path.startsWith("/admin") || path.startsWith("/staff")) return null;
  return <BottomNav />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900`}>
        {children}
        <BottomNavWrapper />
      </body>
    </html>
  );
}
