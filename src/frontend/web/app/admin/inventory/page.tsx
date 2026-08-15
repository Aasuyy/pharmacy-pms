"use client";
import { useEffect, useState } from "react";
import { fetchDrugs } from "@/lib/api";
import { Package, AlertTriangle, Search } from "lucide-react";

interface Drug {
  id: number;
  name: string;
  generic_name: string;
  category: string;
  manufacturer: string;
  stock: number;
  reorder_point: number;
  selling_price: number;
  expiry_date: string;
}

export default function AdminInventoryPage() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDrugs();
  }, []);

  const loadDrugs = async () => {
    try {
      setLoading(true);
      const data = await fetchDrugs();
      setDrugs(data.drugs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrugs = drugs.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.generic_name.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = drugs.filter((d) => d.stock <= d.reorder_point).length;

  return (
    <div>
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory</h1>
          <p className="text-xs text-slate-500">Manage medicines and stock levels</p>
        </div>
        <div className="flex items-center gap-4">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm">
              <AlertTriangle size={16} />
              {lowStockCount} low stock
            </div>
          )}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search medicines..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading inventory...</div>
          ) : filteredDrugs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No medicines found</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Medicine</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Manufacturer</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrugs.map((drug) => {
                  const isLowStock = drug.stock <= drug.reorder_point;
                  return (
                    <tr key={drug.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{drug.name}</p>
                        <p className="text-xs text-slate-500">{drug.generic_name}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{drug.category}</td>
                      <td className="px-4 py-3 text-slate-600">{drug.manufacturer}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isLowStock ? "text-red-600" : "text-slate-900"}`}>
                            {drug.stock}
                          </span>
                          {isLowStock && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded">
                              LOW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">Rs. {drug.selling_price}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{drug.expiry_date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
