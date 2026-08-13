"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStaffToken } from "@/lib/rbac";
import { useToast } from "@/components/Toast";
import { Search, Package, AlertTriangle, CheckCircle, Save, RotateCcw, Calendar } from "lucide-react";

interface Batch {
  id: string;
  batchNo: string;
  qty: number;
  expiry: string;
}

interface StockItem {
  id: string;
  name: string;
  systemQty: number;
  physicalQty: number | "";
  unit: string;
  location: string;
  batches: Batch[];
}

export default function StaffStockCount() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<StockItem[]>([
    { id: "1", name: "Paracetamol 500mg", systemQty: 45, physicalQty: "", unit: "strips", location: "Shelf A1", batches: [
      { id: "b1", batchNo: "B-2026-A", qty: 20, expiry: "2027-06-01" },
      { id: "b2", batchNo: "B-2026-B", qty: 25, expiry: "2027-12-01" },
    ]},
    { id: "2", name: "Amoxicillin 500mg", systemQty: 12, physicalQty: "", unit: "strips", location: "Shelf A2", batches: [
      { id: "b3", batchNo: "B-2026-C", qty: 12, expiry: "2026-11-15" },
    ]},
    { id: "3", name: "Vitamin C 1000mg", systemQty: 28, physicalQty: "", unit: "bottles", location: "Shelf B1", batches: [
      { id: "b4", batchNo: "B-2026-D", qty: 28, expiry: "2026-09-01" },
    ]},
  ]);

  useEffect(() => { setMounted(true); if (!getStaffToken()) router.push("/staff/login"); }, [router]);
  if (!mounted) return null;

  const updatePhysical = (id: string, val: string) => {
    setItems(items.map(i => i.id === id ? { ...i, physicalQty: val === "" ? "" : Number(val) } : i));
  };

  const saveCount = () => {
    const incomplete = items.filter(i => i.physicalQty === "");
    if (incomplete.length > 0) { toast(`${incomplete.length} items not counted`, "error"); return; }
    localStorage.setItem("pharma_stock_count_" + new Date().toISOString().split("T")[0], JSON.stringify(items));
    toast("Stock count saved with batch data", "success");
  };

  const reset = () => {
    setItems(items.map(i => ({ ...i, physicalQty: "" })));
    toast("Reset", "success");
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const isExpiringSoon = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const days = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 90;
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock Count</h1>
          <p className="text-slate-400 text-sm mt-0.5">Physical count vs system stock with batch tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all">
            <RotateCcw size={16} /> Reset
          </button>
          <button onClick={saveCount} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Save size={16} /> Save Count
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Item</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Location</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Batches</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">System</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Physical</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((item) => {
              const variance = item.physicalQty === "" ? null : Number(item.physicalQty) - item.systemQty;
              return (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Package size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.location}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.batches.map((b) => (
                        <span key={b.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                          isExpired(b.expiry) ? "bg-red-50 text-red-600 border-red-200" :
                          isExpiringSoon(b.expiry) ? "bg-amber-50 text-amber-600 border-amber-200" :
                          "bg-slate-50 text-slate-600 border-slate-200"
                        }`}>
                          <Calendar size={10} />
                          {b.batchNo} ({b.qty}) · {b.expiry}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800 text-right">{item.systemQty}</td>
                  <td className="px-6 py-4 text-right">
                    <input type="number" value={item.physicalQty} onChange={e => updatePhysical(item.id, e.target.value)}
                      className="w-20 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-right focus:outline-none focus:border-blue-500 transition-all" placeholder="0" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {variance === null ? (
                      <span className="text-xs text-slate-300">—</span>
                    ) : variance === 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle size={12} /> OK</span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${variance < 0 ? "text-red-600" : "text-amber-600"}`}>
                        <AlertTriangle size={12} /> {variance > 0 ? "+" : ""}{variance}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No items found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}