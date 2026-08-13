"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStaffToken } from "@/lib/rbac";
import { LayoutDashboard, FileText, CreditCard, Pill, Users, Clock, TrendingUp } from "lucide-react";

export default function StaffDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); if (!getStaffToken()) router.push("/staff/login"); }, [router]);
  if (!mounted) return null;

  const stats = [
    { label: "Pending Rx", value: 12, icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Today Sales", value: "Rs. 4,250", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Low Stock", value: 5, icon: Pill, color: "text-red-600", bg: "bg-red-50" },
    { label: "Patients", value: 28, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  const recent = [
    { id: "RX-20260812-001", patient: "Ram Sharma", status: "Pending", time: "10 min ago" },
    { id: "BILL-20260812-089", patient: "Sita Gurung", status: "Paid", time: "25 min ago" },
    { id: "RX-20260812-002", patient: "Hari Prasad", status: "Dispensed", time: "1 hr ago" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Staff Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Daily operations overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><Clock size={16} /> Recent Activity</h2>
        <div className="space-y-3">
          {recent.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-800">{r.id}</p>
                <p className="text-xs text-slate-400">{r.patient}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${
                  r.status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  r.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-blue-50 text-blue-700 border-blue-200"
                }`}>{r.status}</span>
                <p className="text-[10px] text-slate-400 mt-1">{r.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
