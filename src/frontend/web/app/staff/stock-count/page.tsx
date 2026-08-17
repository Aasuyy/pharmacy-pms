"use client";
import { useEffect, useState } from "react";
import { Search, Save } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com";

interface Drug {
  id: number;
  name: string;
  stock_quantity: number;
}

export default function StockCountPage() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/shop/drugs?t=${Date.now()}`)
      .then(r => r.json())
      .then(data => {
        const d = Array.isArray(data) ? data : [];
        setDrugs(d);
        const init: Record<number, number> = {};
        d.forEach((drug: Drug) => init[drug.id] = drug.stock_quantity);
        setCounts(init);
      });
  }, []);

  const filtered = drugs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  const submitCount = async (drugId: number) => {
    const counted = counts[drugId];
    if (counted === undefined) return;
    
    setLoading(true);
    await fetch(`${API_URL}/staff/stock-count`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        drug_id: drugId,
        counted_qty: counted,
        counted_by: "Staff User"
      })
    });
    setLoading(false);
    alert("Stock count recorded");
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Stock Count</h1>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search drugs..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Drug</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">System Stock</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Actual Count</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((drug) => (
              <tr key={drug.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{drug.name}</td>
                <td className="px-4 py-3 text-slate-500">{drug.stock_quantity}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={counts[drug.id] || 0}
                    onChange={e => setCounts({ ...counts, [drug.id]: Number(e.target.value) })}
                    className="w-24 px-2 py-1 rounded border border-slate-200 text-center"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => submitCount(drug.id)}
                    disabled={loading}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Save size={12} />
                    Save
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
