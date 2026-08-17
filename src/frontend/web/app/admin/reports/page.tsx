"use client";
import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, TrendingUp, Package } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com";

export default function ReportsPage() {
  const [data, setData] = useState<{ total_orders: number; total_revenue: number; top_drugs: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/shop/reports/sales`)
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center text-slate-500 font-medium">
        Loading Revenue Analytics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Sales & Revenue Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Track store performance, completed orders, and top items</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Rs. {data?.total_revenue ? data.total_revenue.toLocaleString() : "0.00"}
            </h2>
          </div>
          <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Orders</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              {data?.total_orders || 0}
            </h2>
          </div>
          <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
        </div>
      </div>

      {/* Top Performing Medicines */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6 text-slate-900">
          <TrendingUp size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold">Top Selling Medicines</h2>
        </div>

        <div className="space-y-4">
          {data?.top_drugs && data.top_drugs.length > 0 ? (
            data.top_drugs.map((drug, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{drug.name}</p>
                    <p className="text-xs text-slate-500">{drug.total_quantity} units sold</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  Rs. {drug.total_sales.toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No sales data logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
