"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Truck, Search, Phone, Mail, MapPin, Plus, X } from "lucide-react";

interface Supplier { id: string; name: string; contact: string; email: string; address: string; status: "active" | "inactive"; }

export default function AdminSuppliers() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", email: "", address: "" });
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: "1", name: "Cipla Nepal", contact: "+977-1-4444444", email: "contact@cipla.np", address: "Kathmandu", status: "active" },
    { id: "2", name: "Sun Pharma", contact: "+977-1-5555555", email: "np@sunpharma.com", address: "Lalitpur", status: "active" },
    { id: "3", name: "Sanofi", contact: "+977-1-6666666", email: "sanofi.np@sanofi.com", address: "Bhaktapur", status: "inactive" },
  ]);

  useEffect(() => { setMounted(true); if (!getAdminToken()) router.push("/admin/login"); }, [router]);
  if (!mounted) return null;

  const addSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.contact) { toast("Name and contact required", "error"); return; }
    setSuppliers([...suppliers, { id: String(Date.now()), ...form, status: "active" }]);
    toast("Supplier added", "success");
    setShowModal(false);
    setForm({ name: "", contact: "", email: "", address: "" });
  };

  const toggleStatus = (id: string) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s));
  };

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-slate-400 text-sm mt-0.5">Vendor contacts and order history</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
          <Plus size={16} /> Add Supplier
        </button>
      </div>
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No suppliers found</div>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Truck size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-slate-800">{s.name}</span>
                  <button onClick={() => toggleStatus(s.id)} className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${s.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>{s.status}</button>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><Phone size={10} /> {s.contact}</span>
                  <span className="flex items-center gap-1"><Mail size={10} /> {s.email}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} /> {s.address}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Supplier</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={addSupplier} className="space-y-3">
              <input type="text" required placeholder="Supplier name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <input type="text" required placeholder="Contact number" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <input type="text" placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
