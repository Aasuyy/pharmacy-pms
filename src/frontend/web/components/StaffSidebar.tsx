"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Pill, DollarSign, Package, Users, FileText,
  ClipboardCheck, ClipboardList, Search, LogOut, ChevronLeft, ChevronRight, Shield, ShoppingCart
} from "lucide-react";
import { logoutStaff } from "@/lib/rbac";

const links = [
  { href: "/staff/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/staff/prescriptions", icon: FileText, label: "Prescriptions" },
  { href: "/staff/dispense", icon: Pill, label: "Dispense" },
  { href: "/staff/billing", icon: DollarSign, label: "Billing" },
  { href: "/staff/pos", icon: ShoppingCart, label: "Quick POS" },
  { href: "/staff/inventory", icon: Package, label: "Inventory" },
  { href: "/staff/stock-count", icon: Search, label: "Stock Count" },
  { href: "/staff/patients", icon: Users, label: "Patients" },
  { href: "/staff/shift", icon: ClipboardList, label: "Shift Handover" },
];

export default function StaffSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? "w-20" : "w-64"} bg-white border-r border-slate-100 h-screen sticky top-0 flex flex-col transition-all duration-300`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          {!collapsed && <span className="font-bold text-slate-900 text-sm">PharmaPro</span>}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-all">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"}`}>
              <l.icon size={18} />
              {!collapsed && <span>{l.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-100">
        <button onClick={() => { logoutStaff(); window.location.href = "/login"; }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full">
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}