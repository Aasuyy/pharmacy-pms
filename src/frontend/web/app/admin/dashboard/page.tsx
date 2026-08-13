"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { ShoppingBag, Users, FileText, Activity, ArrowUpRight, AlertTriangle, CheckCircle, Clock, Truck, Package, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!getAdminToken()) router.push("/admin/login");
  }, [router]);

  if (!mounted) return null;

  const stats = [
    { label: "Total Orders", value: "1,247", change: "+12%", icon: ShoppingBag, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
    { label: "Active Users", value: "3,892", change: "+8%", icon: Users, color: "bg-violet-50 text-violet-600", border: "border-violet-100" },
    { label: "Pending Rx", value: "23", change: "-3", icon: FileText, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
    { label: "System Health", value: "99.9%", change: "Stable", icon: Activity, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
  ];

  const recentOrders = [
    { id: "ORD-20260812-A7B3", customer: "Ram Sharma", total: 1250, status: "pending", time: "2 min ago" },
    { id: "ORD-20260812-C9D1", customer: "Sita Gurung", total: 450, status: "confirmed", time: "15 min ago" },
    { id: "ORD-20260812-E2F8", customer: "Hari Prasad", total: 2800, status: "shipped", time: "1 hr ago" },
    { id: "ORD-20260812-G4H6", customer: "Anjali Rai", total: 890, status: "delivered", time: "3 hrs ago" },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      confirmed: "bg-blue-50 text-blue-700 border-blue-200",
      shipped: "bg-violet-50 text-violet-700 border-violet-200",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return map[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className={`p-5 rounded-2xl bg-white border ${s.border} shadow-sm hover:shadow-md transition-all`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}><s.icon size={20} /></div>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${s.change.startsWith("+") ? "text-emerald-600" : s.change.startsWith("-") ? "text-red-500" : "text-slate-500"}`}>
                {s.change} <ArrowUpRight size={12} />
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800">Recent Orders</h2>
              <p className="text-slate-400 text-xs mt-0.5">Latest pharmacy orders across the platform</p>
            </div>
            <Link href="/admin/orders" className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-all">View All</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <ShoppingBag size={16} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-800">{order.id}</span>
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold capitalize ${statusBadge(order.status)}`}>{order.status}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-slate-900">Rs. {order.total}</p>
                  <p className="text-slate-400 text-xs">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Alert */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Review Prescriptions", href: "/admin/prescriptions", icon: FileText, count: 23, color: "text-amber-600 bg-amber-50" },
                { label: "Manage Orders", href: "/admin/orders", icon: ShoppingBag, count: 12, color: "text-blue-600 bg-blue-50" },
                { label: "User Management", href: "#", icon: Users, count: null, color: "text-violet-600 bg-violet-50" },
                { label: "Audit Logs", href: "#", icon: Activity, count: null, color: "text-slate-600 bg-slate-50" },
              ].map((a) => (
                <Link key={a.label} href={a.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group">
                  <div className={`w-9 h-9 rounded-lg ${a.color} flex items-center justify-center`}><a.icon size={16} /></div>
                  <span className="text-sm text-slate-700 font-medium flex-1">{a.label}</span>
                  {a.count !== null && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">{a.count}</span>}
                  <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/10">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-white/80" />
              <h3 className="font-bold text-sm">System Alert</h3>
            </div>
            <p className="text-white/70 text-xs leading-relaxed mb-3">3 prescription uploads are pending review for more than 24 hours.</p>
            <Link href="/admin/prescriptions" className="inline-flex items-center gap-1 text-xs font-medium text-white/90 hover:text-white transition-colors">
              Review Now <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
