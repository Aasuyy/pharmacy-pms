"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStaffToken } from "@/lib/rbac";
import { Pill, Search, AlertTriangle } from "lucide-react";

interface Stock { id: string; name: string; generic: string; batch: string; qty: number; min: number; expiry: string; price: number; }

export default function StaffInventory() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [stocks] = useState<Stock[]>([
    { id: "1", name: "Paracetamol 500mg", generic: "Acetaminophen", batch: "B2026-A", qty: 45, min: 20, expiry: "2027-05-10", price: 15 },
    { id: "2", name: "Amoxicillin 500mg", generic: "Amoxicillin", batch: "B2026-B", qty: 200, min: 50, expiry: "2027-01-10", price: 45 },
    { id: "3", name: "Vitamin C 1000mg", generic: "Ascorbic Acid", batch: "B2026-C", qty: 12, min: 15, expiry: "2026-11-20", price: 35 },
    { id: "4", name: "Insulin Glargine", generic: "Insulin", batch: "B2026-D", qty: 5, min: 10, expiry: "2026-10-01", price: 1200 },
    { id: "5", name: "ORS Powder", generic: "Oral Rehydration", batch: "B2026-E", qty: 200, min: 30, expiry: "2028-01-01", price: 30 },
  ]);

  useEffect(() => { setMounted(true); if (!getStaffToken()) router.push("/staff/login"); }, [router]);
  if (!mounted) return null;

  const filtered = stocks.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.generic.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Inventory Check</h1>
        <p className="text-slate-400 text-sm mt-0.5">View stock levels and expiry dates</p>
      </div>
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => {
          const isLow = s.qty <= s.min;
          const isExpiringSoon = new Date(s.expiry) < new Date("2026-12-31");
          return (
            <div key={s.id} className={`bg-white rounded-2xl border shadow-sm p-5 space-y-3 ${isLow ? "border-red-200" : "border-slate-100"}`}>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Pill size={18} className="text-blue-600" />
                </div>
                {(isLow || isExpiringSoon) && (
                  <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle size={10} /> {isLow ? "Low Stock" : "Expiring"}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">{s.name}</h3>
                <p className="text-xs text-slate-400">{s.generic}</p>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Batch</span><span className="text-slate-700 font-medium">{s.batch}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Stock</span><span className={`font-medium ${isLow ? "text-red-600" : "text-emerald-600"}`}>{s.qty} / {s.min} min</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Expiry</span><span className={`font-medium ${isExpiringSoon ? "text-amber-600" : "text-slate-700"}`}>{s.expiry}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Price</span><span className="text-slate-700 font-medium">Rs. {s.price}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
