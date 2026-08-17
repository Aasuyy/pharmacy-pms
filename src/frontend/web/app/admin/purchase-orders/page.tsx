"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com";

interface PO {
  id: number;
  supplier_name: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function POPage() {
  const [pos, setPos] = useState<PO[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [drugs, setDrugs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<any[]>([]);

  const load = () => {
    fetch(`${API_URL}/shop/purchase-orders`)
      .then(r => r.json())
      .then(data => setPos(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    load();
    fetch(`${API_URL}/shop/suppliers`).then(r => r.json()).then(d => setSuppliers(Array.isArray(d) ? d : []));
    fetch(`${API_URL}/shop/drugs?t=${Date.now()}`).then(r => r.json()).then(d => setDrugs(Array.isArray(d) ? d : []));
  }, []);

  const addItem = () => setItems([...items, { drug_id: "", quantity: 1, price: 0 }]);

  const save = async () => {
    if (!supplierId || items.length === 0) return alert("Select supplier and add items");
    await fetch(`${API_URL}/shop/purchase-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplier_id: Number(supplierId), items })
    });
    setShowModal(false);
    setItems([]);
    load();
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} />
          Create PO
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-700">PO #</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Supplier</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {pos.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No purchase orders</td></tr>
            ) : (
              pos.map(p => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium">#{p.id}</td>
                  <td className="px-4 py-3 text-slate-600">{p.supplier_name || "-"}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">{p.status}</span></td>
                  <td className="px-4 py-3 font-medium">Rs. {Number(p.total_amount).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Create Purchase Order</h2>
            <select className="w-full px-3 py-2 rounded-lg border mb-4" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <div className="space-y-3 mb-4">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <select className="flex-1 px-3 py-2 rounded-lg border text-sm" value={item.drug_id} onChange={e => {
                    const drug = drugs.find((d: any) => d.id == e.target.value);
                    const newItems = [...items];
                    newItems[i] = { ...item, drug_id: e.target.value, price: drug?.price || 0 };
                    setItems(newItems);
                  }}>
                    <option value="">Select Drug</option>
                    {drugs.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <input type="number" placeholder="Qty" className="w-20 px-3 py-2 rounded-lg border text-sm" value={item.quantity} onChange={e => {
                    const newItems = [...items]; newItems[i].quantity = Number(e.target.value); setItems(newItems);
                  }} />
                  <input type="number" placeholder="Price" className="w-24 px-3 py-2 rounded-lg border text-sm" value={item.price} onChange={e => {
                    const newItems = [...items]; newItems[i].price = Number(e.target.value); setItems(newItems);
                  }} />
                </div>
              ))}
            </div>
            <button onClick={addItem} className="text-sm text-blue-600 font-medium mb-4">+ Add Item</button>

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={save} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Create PO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
