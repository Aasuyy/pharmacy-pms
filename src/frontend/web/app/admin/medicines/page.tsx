"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Pill, Search, Plus, Trash2, Pencil, X } from "lucide-react";

interface Medicine { id: string; name: string; generic: string; brand: string; category: string; price: number; unit: string; }

export default function AdminMedicines() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [form, setForm] = useState({ name: "", generic: "", brand: "", category: "Tablet", price: "", unit: "strip" });
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: "1", name: "Paracetamol 500mg", generic: "Acetaminophen", brand: "Cipla", category: "Tablet", price: 15, unit: "strip" },
    { id: "2", name: "Amoxicillin 500mg", generic: "Amoxicillin", brand: "Sun Pharma", category: "Capsule", price: 45, unit: "strip" },
    { id: "3", name: "Vitamin C 1000mg", generic: "Ascorbic Acid", brand: "Nature's Bounty", category: "Tablet", price: 35, unit: "bottle" },
    { id: "4", name: "Insulin Glargine", generic: "Insulin", brand: "Sanofi", category: "Injection", price: 1200, unit: "vial" },
  ]);

  useEffect(() => { setMounted(true); if (!getAdminToken()) router.push("/admin/login"); }, [router]);
  if (!mounted) return null;

  const resetForm = () => { setForm({ name: "", generic: "", brand: "", category: "Tablet", price: "", unit: "strip" }); setEditing(null); };
  const openAdd = () => { resetForm(); setShowModal(true); };
  const openEdit = (m: Medicine) => { setEditing(m); setForm({ name: m.name, generic: m.generic, brand: m.brand, category: m.category, price: String(m.price), unit: m.unit }); setShowModal(true); };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast("Name and price are required", "error"); return; }
    if (editing) {
      setMedicines(medicines.map(m => m.id === editing.id ? { ...m, ...form, price: Number(form.price) } : m));
      toast("Medicine updated", "success");
    } else {
      setMedicines([...medicines, { id: String(Date.now()), ...form, price: Number(form.price) }]);
      toast("Medicine added", "success");
    }
    setShowModal(false); resetForm();
  };
  const del = (id: string) => { if (confirm("Delete this medicine?")) { setMedicines(medicines.filter(m => m.id !== id)); toast("Deleted", "success"); } };

  const filtered = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.generic.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Medicine Catalog</h1>
          <p className="text-slate-400 text-sm mt-0.5">Master drug database</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
          <Plus size={16} /> Add Medicine
        </button>
      </div>
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Medicine</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Price</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/50 transition-all">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Pill size={14} className="text-blue-600" /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.generic} · {m.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{m.category}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">Rs. {m.price} / {m.unit}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(m)} className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-all"><Pencil size={14} /></button>
                    <button onClick={() => del(m.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">{editing ? "Edit Medicine" : "Add Medicine"}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={save} className="space-y-3">
              <input type="text" required placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <input type="text" placeholder="Generic name" value={form.generic} onChange={e => setForm({...form, generic: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <input type="text" placeholder="Brand" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all">
                  <option>Tablet</option><option>Capsule</option><option>Syrup</option><option>Injection</option><option>Cream</option>
                </select>
                <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all">
                  <option>strip</option><option>bottle</option><option>vial</option><option>tube</option><option>pack</option>
                </select>
              </div>
              <input type="number" required placeholder="Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">{editing ? "Save" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
