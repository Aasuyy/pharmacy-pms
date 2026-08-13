"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Plus, Search, X } from "lucide-react";

interface ReturnItem {
  id: string;
  type: "customer" | "expired";
  item: string;
  qty: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  refund: number;
}

export default function AdminReturns() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "customer" as "customer" | "expired", item: "", qty: "", reason: "", refund: "" });
  const [returns, setReturns] = useState<ReturnItem[]>([
    { id: "RET-001", type: "customer", item: "Paracetamol 500mg", qty: 2, reason: "Wrong medicine dispensed", status: "pending", date: "2026-08-12", refund: 30 },
    { id: "RET-002", type: "expired", item: "Vitamin C 1000mg", qty: 5, reason: "Expired batch", status: "approved", date: "2026-08-10", refund: 175 },
  ]);

  useEffect(() => { setMounted(true); if (!getAdminToken()) router.push("/admin/login"); }, [router]);
  if (!mounted) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item || !form.qty || !form.reason) { toast("All fields required", "error"); return; }
    setReturns([...returns, {
      id: "RET-" + Date.now(),
      type: form.type,
      item: form.item,
      qty: Number(form.qty),
      reason: form.reason,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
      refund: Number(form.refund) || 0
    }]);
    setShowModal(false);
    setForm({ type: "customer", item: "", qty: "", reason: "", refund: "" });
    toast("Return logged", "success");
  };

  const updateStatus = (id: string, status: ReturnItem["status"]) => {
    setReturns(returns.map(r => r.id === id ? { ...r, status } : r));
    toast("Status updated", "success");
  };

  const filtered = returns.filter(r =>
    r.item.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Returns & Refunds</h1>
          <p className="text-slate-400 text-sm mt-0.5">Handle customer returns and expired stock</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
          <Plus size={16} /> Log Return
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search returns..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">ID</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Item</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Qty</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-all">
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{r.id}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${r.type === "expired" ? "bg-red-50 text-red-600 border border-red-200" : "bg-blue-50 text-blue-600 border border-blue-200"}`}>{r.type}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{r.item}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{r.qty}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium capitalize ${
                    r.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    r.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>{r.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {r.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(r.id, "approved")} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-all">Approve</button>
                        <button onClick={() => updateStatus(r.id, "rejected")} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-all">Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No returns found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Log Return</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={save} className="space-y-3">
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as "customer" | "expired"})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all">
                <option value="customer">Customer Return</option>
                <option value="expired">Expired Stock</option>
              </select>
              <input type="text" required placeholder="Item name" value={form.item} onChange={e => setForm({...form, item: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <input type="number" required placeholder="Quantity" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <input type="text" required placeholder="Reason" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <input type="number" placeholder="Refund amount (optional)" value={form.refund} onChange={e => setForm({...form, refund: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Log Return</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}