"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { AlertTriangle, Package, Plus, Truck } from "lucide-react";

interface StockItem {
  id: string;
  name: string;
  stock: number;
  reorderLevel: number;
  unit: string;
  supplier: string;
  status: "ok" | "low" | "critical";
}

export default function AdminReorder() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);

  const [items, setItems] = useState<StockItem[]>([
    { id: "m1", name: "Paracetamol 500mg", stock: 45, reorderLevel: 20, unit: "strips", supplier: "Cipla Nepal", status: "ok" },
    { id: "m2", name: "Amoxicillin 500mg", stock: 12, reorderLevel: 15, unit: "strips", supplier: "Sun Pharma", status: "low" },
    { id: "m3", name: "Vitamin C 1000mg", stock: 28, reorderLevel: 10, unit: "bottles", supplier: "Sanofi", status: "ok" },
    { id: "m4", name: "Cetirizine 10mg", stock: 60, reorderLevel: 25, unit: "strips", supplier: "Cipla Nepal", status: "ok" },
    { id: "m5", name: "ORS Powder", stock: 100, reorderLevel: 30, unit: "sachets", supplier: "Local", status: "ok" },
    { id: "m6", name: "Ibuprofen 400mg", stock: 30, reorderLevel: 15, unit: "strips", supplier: "Sun Pharma", status: "ok" },
    { id: "m7", name: "Omeprazole 20mg", stock: 8, reorderLevel: 10, unit: "strips", supplier: "Cipla Nepal", status: "critical" },
  ]);

  useEffect(() => {
    setMounted(true);
    if (!getAdminToken()) router.push("/admin/login");
  }, [router]);
  if (!mounted) return null;

  const updateReorder = (id: string, val: number) => {
    setItems(items.map(i => {
      if (i.id !== id) return i;
      const status = i.stock === 0 ? "critical" : i.stock <= val ? "low" : "ok";
      return { ...i, reorderLevel: val, status };
    }));
  };

  const createPO = (item: StockItem) => {
    const draft = {
      id: "PO-" + Date.now(),
      supplier: item.supplier,
      items: `${item.name} x${item.reorderLevel * 2}`,
      total: item.reorderLevel * 2 * 10,
      status: "draft",
      date: new Date().toISOString().split("T")[0],
    };
    const existing = JSON.parse(localStorage.getItem("pharma_pos") || "[]");
    localStorage.setItem("pharma_pos", JSON.stringify([...existing, draft]));
    toast(`Draft PO created for ${item.name}`, "success");
  };

  const critical = items.filter(i => i.status === "critical");
  const low = items.filter(i => i.status === "low");

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div>
        <h1 className="text-xl font-bold text-slate-900">Auto Reorder</h1>
        <p className="text-slate-400 text-sm mt-0.5">Low stock alerts and quick purchase orders</p>
      </div>

      {critical.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">{critical.length} item(s) critically low or out of stock</p>
            <p className="text-xs text-red-600">Create purchase orders immediately to avoid stockouts.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Item</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Supplier</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Stock</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Reorder At</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
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
                <td className="px-6 py-4 text-sm text-slate-600">{item.supplier}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">{item.stock}</td>
                <td className="px-6 py-4 text-right">
                  <input type="number" value={item.reorderLevel} onChange={e => updateReorder(item.id, Number(e.target.value))}
                    className="w-20 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-right focus:outline-none focus:border-blue-500 transition-all" />
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium capitalize ${
                    item.status === "critical" ? "bg-red-50 text-red-700 border-red-200" :
                    item.status === "low" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>{item.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => createPO(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-all">
                    <Truck size={12} /> Create PO
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}