import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PharmaPro — Genuine Medicines Delivered",
  description: "Order genuine medicines, upload prescriptions, and get doorstep delivery across Nepal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900`}>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
