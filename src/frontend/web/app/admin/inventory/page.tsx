"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function InventoryPage() {
  const [editingDrug, setEditingDrug] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const endpoint = editingDrug
      ? `${API_BASE_URL}/api/v1/drugs/${editingDrug.id}`
      : `${API_BASE_URL}/api/v1/drugs`;

    try {
      const res = await fetch(endpoint, {
        method: editingDrug ? "PUT" : "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Server error:", errText);
        throw new Error(errText);
      }

      toast.success(editingDrug ? "Drug updated!" : "Drug added successfully!");
      form.reset();
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error("Failed to save drug. Check backend endpoint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Add / Edit Drug</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
        <input name="name" placeholder="Name *" required className="w-full border p-2 rounded" />
        <input name="generic_name" placeholder="Generic Name *" required className="w-full border p-2 rounded" />
        <input name="category" placeholder="Category *" required className="w-full border p-2 rounded" />
        <input name="manufacturer" placeholder="Manufacturer *" required className="w-full border p-2 rounded" />
        <div className="grid grid-cols-3 gap-2">
          <input name="price" type="number" placeholder="Price *" required className="border p-2 rounded" />
          <input name="stock" type="number" placeholder="Stock *" required className="border p-2 rounded" />
          <input name="reorder_point" type="number" placeholder="Reorder" className="border p-2 rounded" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : editingDrug ? "Update Drug" : "Add Drug"}
        </button>
      </form>
    </div>
  );
}
