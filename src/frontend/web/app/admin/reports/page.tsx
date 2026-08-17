"use client";
import { useEffect, useState } from "react";
import { Download, Calendar, TrendingUp, Package, ShoppingCart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com";

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    let url = `${API_URL}/orders/reports/sales`;
    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setReport(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReport();
  }, []);

  const exportCSV = () => {
    if (!report?.daily_breakdown?.length) return;
    const headers = "Date,Orders,Revenue\n";
    const rows = report.daily_breakdown.map((d: any) => 
      `${d.date},${d.orders},${d.revenue}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${startDate || "all"}.csv`;
    a.click();
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Sales Reports</h1>
        <button
          onClick={exportCSV}
          disabled={!report?.daily_breakdown?.length}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200"
          />
        </div>
        <button
          onClick={loadReport}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Generate"}
        </button>
      </div>

      {report && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Orders</p>
                  <p className="text-2xl font-bold text-slate-900">{report.total_orders || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <ShoppingCart size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">Rs. {(report.total_revenue || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Avg Order Value</p>
                  <p className="text-2xl font-bold text-slate-900">
                    Rs. {report.total_orders ? Math.round(report.total_revenue / report.total_orders).toLocaleString() : 0}
                  </p>
                </div>
                <div className="p-3 bg-violet-50 rounded-lg text-violet-600">
                  <Calendar size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Daily Revenue</h2>
              <div className="h-64">
                {report.daily_breakdown?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[...report.daily_breakdown].reverse()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data</div>
                )}
              </div>
            </div>

            {/* Top Drugs */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Package size={18} />
                Top Selling Drugs
              </h2>
              <div className="space-y-3">
                {report.top_drugs?.length > 0 ? (
                  report.top_drugs.map((drug: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="font-medium text-slate-900">{drug.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{drug.total_qty} sold</p>
                        <p className="text-xs text-slate-500">Rs. {Number(drug.total_revenue).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">No sales data</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
