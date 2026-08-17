"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com";

export default function AlertsPage() {
  const [data, setData] = useState<{ low_stock: any[]; expiring_soon: any[]; total_alerts: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = () => {
    setLoading(true);
    fetch(`${API_URL}/shop/alerts`)
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center text-slate-500 font-medium">
        Loading Inventory Alerts...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Alerts Center</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor low stock levels and impending expirations</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Low Stock Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4 text-amber-600">
            <AlertTriangle size={20} />
            <h2 className="text-lg font-bold text-slate-900">Low Stock (&lt; 10 units)</h2>
          </div>
          <div className="space-y-3">
            {data?.low_stock && data.low_stock.length > 0 ? (
              data.low_stock.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.brand || "Generic"}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                    {item.stock_quantity} remaining
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No low stock items detected.</p>
            )}
          </div>
        </div>

        {/* Expiry Warning Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4 text-red-600">
            <Clock size={20} />
            <h2 className="text-lg font-bold text-slate-900">Expiring Within 30 Days</h2>
          </div>
          <div className="space-y-3">
            {data?.expiring_soon && data.expiring_soon.length > 0 ? (
              data.expiring_soon.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">Stock: {item.stock_quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                    {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "Expired"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No upcoming expirations.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
