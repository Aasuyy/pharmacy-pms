"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStaffToken } from "@/lib/rbac";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useToast } from "@/components/Toast";
import { Search, CheckCircle, AlertTriangle, Save, RotateCcw } from "lucide-react";

interface StockItem {
  id: string;
  name: string;
  systemQty: number;
  physicalQty: number | "";
  unit: string;
  location: string;
  counted: boolean;
  variance: number;
}

export default function StockCount() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  const [items, setItems, loaded] = useLocalStorage<StockItem[]>("pharma_stock_count", [
    { id: "m1", name: "Paracetamol 500mg", systemQty: 45, physicalQty: "", unit: "strips", location: "Shelf A1", counted: false, variance: 0 },
    { id: "m2", name: "Amoxicillin 500mg", systemQty: 12, physicalQty: "", unit: "strips", location: "Shelf A2", counted: false, variance: 0 },
    { id: "m3", name: "Vitamin C 1000mg", systemQty: 28, physicalQty: "", unit: "bottles", location: "Shelf B1", counted: false, variance: 0 },
    { id: "m4", name: "Cetirizine 10mg", systemQty: 60, physicalQty: "", unit: "strips", location: "Shelf A3", counted: false, variance: 0 },
    { id: "m5", name: "ORS Powder", systemQty: 100, physicalQty: "", unit: "sachets", location: "Shelf C1", counted: false, variance: 0 },
  ]);

  useEffect(() => {
    setMounted(true);
    if (!getStaffToken()) router.push("/staff/login");
  }, [router]);
  if (!mounted || !loaded) return null;

  const updatePhysical = (id: string, val: string) => {
    const num = val === "" ? "" : Number(val);
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const variance = num === "" ? 0 : (num as number) - i.systemQty;
      return { ...i, physicalQty: num, counted: num !== "", variance };
    }));
  };

  const saveCount = () => {
    const uncounted = items.filter(i => !i.counted);
    if (uncounted.length > 0) {
      toast(`${uncounted.length} items not counted yet`, "error");
      return;
    }
    const variances = items.filter(i => i.variance !== 0);
    if (variances.length > 0) {
      toast(`Count saved with ${variances.length} variances. Admin notified.`, "warning");
    } else {
      toast("Stock count saved. All items match system.", "success");
    }
    // Reset for next count
    setItems(prev => prev.map(i => ({ ...i, physicalQty: "", counted: false, variance: 0 })));
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const countedCount = items.filter(i => i.counted).length;
  const varianceCount = items.filter(i => i.counted && i.variance !== 0).length;

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock Count</h1>
          <p className="text-slate-400 text-sm mt-0.5">{countedCount}/{items.length} counted · {varianceCount} variances</p>
        </div>
        <button onClick={saveCount} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
          <Save size={16} /> Save Count
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 transition-all" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Item</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Location</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">System</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Physical</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Variance</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.unit}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.location}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">{item.systemQty}</td>
                <td className="px-6 py-4 text-right">
                  <input type="number" value={item.physicalQty} onChange={e => updatePhysical(item.id, e.target.value)}
                    className={`w-20 px-3 py-2 rounded-xl border text-sm text-right focus:outline-none focus:border-blue-500 transition-all ${item.counted ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`} />
                </td>
                <td className="px-6 py-4 text-right">
                  {item.counted && (
                    <span className={`text-sm font-bold ${item.variance === 0 ? "text-emerald-600" : item.variance > 0 ? "text-blue-600" : "text-red-600"}`}>
                      {item.variance > 0 ? "+" : ""}{item.variance}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {item.counted ? (
                    item.variance === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium"><CheckCircle size={12} /> Match</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-medium"><AlertTriangle size={12} /> {item.variance > 0 ? "Surplus" : "Shortage"}</span>
                    )
                  ) : (
                    <span className="text-xs text-slate-400">Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}