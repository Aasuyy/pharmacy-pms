"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { TrendingUp, ShoppingBag, AlertTriangle, Calendar } from "lucide-react";

export default function AdminReports() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); if (!getAdminToken()) router.push("/admin/login"); }, [router]);
  if (!mounted) return null;

  const stats = [
    { label: "Today Sales", value: "Rs. 12,450", change: "+12%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Orders", value: "34", change: "+5", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Low Stock Items", value: "5", change: "-2", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Expiring Soon", value: "3", change: "0", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const topSelling = [
    { name: "Paracetamol 500mg", qty: 120, revenue: 1800 },
    { name: "Amoxicillin 500mg", qty: 85, revenue: 3825 },
    { name: "Vitamin C 1000mg", qty: 64, revenue: 2240 },
    { name: "ORS Powder", qty: 200, revenue: 6000 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-400 text-sm mt-0.5">Business intelligence and trends</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={16} className={s.color} />
            </div>
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
            <p className={`text-xs font-medium mt-1 ${s.change.startsWith("+") ? "text-emerald-600" : s.change.startsWith("-") ? "text-red-600" : "text-slate-400"}`}>{s.change} vs yesterday</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Top Selling Medicines</h2>
          <div className="space-y-3">
            {topSelling.map((m, i) => (
              <div key={m.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">{m.name}</span>
                    <span className="text-xs text-slate-500">Rs. {m.revenue}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${(m.qty / 200) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Inventory Alerts</h2>
          <div className="space-y-3">
            {[
              { name: "Vitamin C 1000mg", issue: "Low stock (12 remaining)", severity: "warning" },
              { name: "Insulin Glargine", issue: "Low stock (5 remaining)", severity: "critical" },
              { name: "Cetirizine 10mg", issue: "Low stock (8 remaining)", severity: "warning" },
              { name: "Insulin Glargine", issue: "Expiring 2026-10-01", severity: "warning" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${a.severity === "critical" ? "bg-red-500" : "bg-amber-500"}`} />
                <div>
                  <p className="text-sm font-medium text-slate-800">{a.name}</p>
                  <p className="text-xs text-slate-400">{a.issue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
