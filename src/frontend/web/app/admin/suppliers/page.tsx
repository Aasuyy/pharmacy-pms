"use client";
import { useEffect, useState } from "react";
import { Plus, Phone, Mail, MapPin } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com";

interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  address: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", email: "", address: "" });

  const load = () => {
    fetch(`${API_URL}/shop/suppliers`)
      .then(r => r.json())
      .then(data => setSuppliers(Array.isArray(data) ? data : []))
      .catch(() => setSuppliers([]));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name) return alert("Name required");
    await fetch(`${API_URL}/shop/suppliers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({ name: "", contact: "", email: "", address: "" });
    setShowModal(false);
    load();
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} />
          Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Address</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No suppliers yet</td></tr>
            ) : (
              suppliers.map(s => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600 flex items-center gap-1"><Phone size={12}/> {s.contact || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{s.email || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{s.address || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">Add Supplier</h2>
            <div className="space-y-3">
              <input placeholder="Name *" className="w-full px-3 py-2 rounded-lg border" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input placeholder="Phone" className="w-full px-3 py-2 rounded-lg border" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
              <input placeholder="Email" className="w-full px-3 py-2 rounded-lg border" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <input placeholder="Address" className="w-full px-3 py-2 rounded-lg border" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={save} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
