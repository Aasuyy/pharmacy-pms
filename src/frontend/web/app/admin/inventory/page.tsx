"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Package, Search, AlertTriangle, TrendingDown, Calendar, ArrowUpDown } from "lucide-react";

interface StockItem { id: string; medicine: string; batch: string; qty: number; min: number; expiry: string; supplier: string; mrp: number; }

export default function AdminInventory() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [stocks, setStocks] = useState<StockItem[]>([
    { id: "1", medicine: "Paracetamol 500mg", batch: "B2026-A", qty: 45, min: 20, expiry: "2027-05-10", supplier: "Cipla Nepal", mrp: 15 },
    { id: "2", medicine: "Amoxicillin 500mg", batch: "B2026-B", qty: 200, min: 50, expiry: "2027-01-10", supplier: "Sun Pharma", mrp: 45 },
    { id: "3", medicine: "Vitamin C 1000mg", batch: "B2026-C", qty: 12, min: 15, expiry: "2026-11-20", supplier: "Nature's Bounty", mrp: 35 },
    { id: "4", medicine: "Insulin Glargine", batch: "B2026-D", qty: 5, min: 10, expiry: "2026-10-01", supplier: "Sanofi", mrp: 1200 },
    { id: "5", medicine: "ORS Powder", batch: "B2026-E", qty: 200, min: 30, expiry: "2028-01-01", supplier: "Nepal Pharma", mrp: 30 },
    { id: "6", medicine: "Cetirizine 10mg", batch: "B2026-F", qty: 8, min: 20, expiry: "2027-01-15", supplier: "Cipla Nepal", mrp: 25 },
  ]);

  useEffect(() => { setMounted(true); if (!getAdminToken()) router.push("/admin/login"); }, [router]);
  if (!mounted) return null;

  const adjustStock = (id: string, delta: number) => {
    setStocks(stocks.map(s => s.id === id ? { ...s, qty: Math.max(0, s.qty + delta) } : s));
    toast("Stock updated", "success");
  };

  const filtered = stocks.filter(s => {
    const matchesSearch = s.medicine.toLowerCase().includes(search.toLowerCase()) || s.batch.toLowerCase().includes(search.toLowerCase());
    const isLow = s.qty <= s.min;
    const isExpiring = new Date(s.expiry) < new Date("2026-12-31");
    if (filter === "low") return matchesSearch && isLow;
    if (filter === "expiring") return matchesSearch && isExpiring;
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div>
        <h1 className="text-xl font-bold text-slate-900">Inventory Management</h1>
        <p className="text-slate-400 text-sm mt-0.5">Stock levels, batches, and expiry tracking</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
          <option value="all">All Stock</option>
          <option value="low">Low Stock</option>
          <option value="expiring">Expiring Soon</option>
        </select>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Medicine</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Batch</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Stock</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Expiry</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Supplier</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((s) => {
              const isLow = s.qty <= s.min;
              const isExpiring = new Date(s.expiry) < new Date("2026-12-31");
              return (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Package size={14} className="text-blue-600" /></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{s.medicine}</p>
                        <p className="text-xs text-slate-400">MRP: Rs. {s.mrp}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{s.batch}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isLow ? "text-red-600" : "text-slate-800"}`}>{s.qty}</span>
                      {isLow && <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">LOW</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{s.expiry}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{s.supplier}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => adjustStock(s.id, 1)} className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-all" title="Add 1"><ArrowUpDown size={14} /></button>
                      <button onClick={() => adjustStock(s.id, -1)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all" title="Remove 1"><TrendingDown size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
