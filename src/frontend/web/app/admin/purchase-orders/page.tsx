"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Plus, Search, X } from "lucide-react";

interface PO {
  id: string;
  supplier: string;
  items: string;
  total: number;
  status: "draft" | "sent" | "received";
  date: string;
}

export default function AdminPurchaseOrders() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ supplier: "", items: "", total: "" });
  const [pos, setPos] = useState<PO[]>([
    { id: "PO-001", supplier: "Cipla Nepal", items: "Paracetamol 500mg x100", total: 1500, status: "sent", date: "2026-08-12" },
    { id: "PO-002", supplier: "Sun Pharma", items: "Amoxicillin 500mg x50", total: 2250, status: "received", date: "2026-08-10" },
  ]);

  useEffect(() => {
    setMounted(true);
    if (!getAdminToken()) router.push("/admin/login");
  }, [router]);
  if (!mounted) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplier || !form.items || !form.total) {
      toast("All fields required", "error");
      return;
    }
    setPos([...pos, {
      id: "PO-" + Date.now(),
      supplier: form.supplier,
      items: form.items,
      total: Number(form.total),
      status: "draft",
      date: new Date().toISOString().split("T")[0]
    }]);
    setShowModal(false);
    setForm({ supplier: "", items: "", total: "" });
    toast("Purchase order created", "success");
  };

  const updateStatus = (id: string, status: PO["status"]) => {
    setPos(pos.map(p => p.id === id ? { ...p, status } : p));
    toast("Status updated", "success");
  };

  const filtered = pos.filter(p =>
    p.supplier.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (s: string) => {
    if (s === "received") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "sent") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage supplier orders and receipts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
          <Plus size={16} /> New PO
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search POs..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">PO ID</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Supplier</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Items</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Total</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{p.id}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{p.supplier}</td>
                <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{p.items}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800">Rs. {p.total}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium capitalize ${statusBadge(p.status)}`}>{p.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {p.status === "draft" && (
                      <button onClick={() => updateStatus(p.id, "sent")} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-all">Send</button>
                    )}
                    {p.status === "sent" && (
                      <button onClick={() => updateStatus(p.id, "received")} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-all">Receive</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No purchase orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">New Purchase Order</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={save} className="space-y-3">
              <input type="text" required placeholder="Supplier name" value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <input type="text" required placeholder="Items" value={form.items} onChange={e => setForm({...form, items: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <input type="number" required placeholder="Total amount" value={form.total} onChange={e => setForm({...form, total: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Create PO</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}