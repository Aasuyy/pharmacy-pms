"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import Link from "next/link";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  FileText, 
  Settings, 
  LogOut, 
  TrendingUp 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, logout } = useAdminAuthStore();

  useEffect(() => {
    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [token, pathname, router]);

  if (!token && pathname !== "/admin/login") {
    return null;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white p-4 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold mb-8 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" /> Admin Portal
          </h1>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="block py-2 px-4 rounded hover:bg-slate-800">Dashboard</Link>
            <Link href="/admin/orders" className="block py-2 px-4 rounded hover:bg-slate-800">Orders</Link>
            <Link href="/admin/users" className="block py-2 px-4 rounded hover:bg-slate-800">Users</Link>
            <Link href="/admin/audit-logs" className="block py-2 px-4 rounded hover:bg-slate-800">Audit Logs</Link>
          </nav>
        </div>
        <button onClick={logout} className="flex items-center gap-2 py-2 px-4 rounded bg-red-600 hover:bg-red-700">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
