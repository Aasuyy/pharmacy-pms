"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Package, 
  Search,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Drug {
  id: number;
  name: string;
  generic_name: string;
  category: string;
  manufacturer: string;
  price: number;
  stock: number;
  reorder_point: number;
  manufacture_date?: string;
  expiry_date?: string;
  description?: string;
  image_url?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com";

export default function AdminInventoryPage() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null);
  const [form, setForm] = useState({
    name: "",
    generic_name: "",
    category: "",
    manufacturer: "",
    price: "",
    stock: "",
    reorder_point: "10",
    manufacture_date: "",
    expiry_date: "",
    description: "",
    image_url: ""
  });

  useEffect(() => {
    loadDrugs();
  }, []);

  const loadDrugs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/shop/drugs`);
      const data = await res.json();
      setDrugs(data.drugs || []);
    } catch (err) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingDrug(null);
    setForm({
      name: "", generic_name: "", category: "", manufacturer: "",
      price: "", stock: "", reorder_point: "10", expiry_date: "",
      description: "", image_url: ""
    });
    setShowModal(true);
  };

  const openEdit = (drug: Drug) => {
    setEditingDrug(drug);
    setForm({
      name: drug.name,
      generic_name: drug.generic_name || "",
      category: drug.category || "",
      manufacturer: drug.manufacturer || "",
      price: String(drug.price),
      stock: String(drug.stock),
      reorder_point: String(drug.reorder_point || 10),
      manufacture_date: drug.manufacture_date || "",
      expiry_date: drug.expiry_date || "",
      description: drug.description || "",
      image_url: drug.image_url || ""
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      reorder_point: parseInt(form.reorder_point)
    };

    try {
      const url = editingDrug 
        ? `${API_URL}/shop/drugs/${editingDrug.id}`
        : `${API_URL}/shop/drugs`;
      
      const res = await fetch(url, {
        method: editingDrug ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed");

      toast.success(editingDrug ? "Drug updated" : "Drug added");
      setShowModal(false);
      loadDrugs();
    } catch {
      toast.error("Failed to save drug");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this drug?")) return;
    try {
      const res = await fetch(`${API_URL}/shop/drugs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Drug deleted");
      loadDrugs();
    } catch {
      toast.error("Failed to delete drug");
    }
  };

  const filtered = drugs.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.generic_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500">Manage medicines and stock levels</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Drug
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading inventory...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No medicines found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Medicine</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Expiry</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((drug) => {
                  const isLow = drug.stock <= (drug.reorder_point || 10);
                  const isExpired = drug.expiry_date && new Date(drug.expiry_date) < new Date();
                  
                  return (
                    <motion.tr 
                      key={drug.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {drug.image_url ? (
                            <img src={drug.image_url} alt={drug.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                              <Package size={14} />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{drug.name}</p>
                            <p className="text-xs text-slate-500">{drug.generic_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{drug.category}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${isLow ? "text-rose-600" : "text-slate-900"}`}>
                          {drug.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-900">Rs. {drug.price}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {drug.expiry_date ? new Date(drug.expiry_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                            <AlertTriangle size={10} /> Expired
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <AlertTriangle size={10} /> Low
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(drug)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(drug.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingDrug ? "Edit Drug" : "Add New Drug"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Generic Name *</label>
                    <input
                      required
                      value={form.generic_name}
                      onChange={(e) => setForm({...form, generic_name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Category *</label>
                    <input
                      required
                      value={form.category}
                      onChange={(e) => setForm({...form, category: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Manufacturer *</label>
                    <input
                      required
                      value={form.manufacturer}
                      onChange={(e) => setForm({...form, manufacturer: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Price (Rs) *</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({...form, price: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Stock *</label>
                    <input
                      required
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({...form, stock: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Reorder Point</label>
                    <input
                      type="number"
                      value={form.reorder_point}
                      onChange={(e) => setForm({...form, reorder_point: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Manufacture Date</label>
                    <input
                      type="date"
                      value={form.manufacture_date}
                      onChange={(e) => setForm({...form, manufacture_date: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={form.expiry_date}
                      onChange={(e) => setForm({...form, expiry_date: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Drug Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setForm({...form, image_url: reader.result as string});
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                  />
                  {form.image_url && (
                    <img src={form.image_url} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg border border-slate-200" />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {editingDrug ? "Update Drug" : "Add Drug"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
