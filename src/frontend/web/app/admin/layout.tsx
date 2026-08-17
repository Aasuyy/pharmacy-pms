"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, ShoppingCart, Package, Users, FileText, LogOut } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pos", label: "POS", icon: ShoppingCart },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: TrendingUp },
  { href: "/admin/prescriptions", label: "Prescriptions", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, logout } = useAdminAuthStore();

  // ALL hooks must be called BEFORE any return statement
  useEffect(() => {
    if (!admin && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [admin, pathname, router]);

  // 1. Login page renders WITHOUT the admin shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // 2. Don't render admin shell while redirecting
  if (!admin) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  const handleLogout = () => {
    logout();
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900">PharmaPro</h1>
          <p className="text-xs text-slate-500">Admin Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="mb-3">
            <p className="text-sm font-medium text-slate-900">{admin.full_name}</p>
            <p className="text-xs text-slate-500">{admin.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
