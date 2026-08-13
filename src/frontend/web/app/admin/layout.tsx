"use client";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import RoleGuard from "@/components/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-white">{children}</div>;
  }
  return (
    <RoleGuard>
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </RoleGuard>
  );
}
