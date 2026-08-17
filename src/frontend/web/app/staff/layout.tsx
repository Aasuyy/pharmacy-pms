"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Clock, ClipboardCheck, LogOut } from "lucide-react";

const navItems = [
  { href: "/staff/shift", label: "My Shifts", icon: Clock },
  { href: "/staff/stock-count", label: "Stock Count", icon: ClipboardCheck },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Simple staff auth check (you can enhance later)
  useEffect(() => {
    // Optional: redirect if no staff token
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900">PharmaPro</h1>
          <p className="text-xs text-slate-500">Staff Portal</p>
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
          <button
            onClick={() => window.location.href = "/login"}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Back to Login
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
