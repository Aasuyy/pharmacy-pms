"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { useToast } from "@/components/Toast";
import {
  TrendingUp, TrendingDown, DollarSign, Package,
  Users, BarChart3, Calendar, ArrowUpRight, ArrowDownRight
} from "lucide-react";

interface DailySale {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

interface TopItem {
  name: string;
  sold: number;
  revenue: number;
  profit: number;
}

interface StaffMetric {
  name: string;
  rxFilled: number;
  sales: number;
  accuracy: number;
}

export default function AdminAnalytics() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");

  const [dailySales] = useState<DailySale[]>([
    { date: "2026-08-07", label: "Sun", revenue: 12400, orders: 45 },
    { date: "2026-08-08", label: "Mon", revenue: 9800, orders: 38 },
    { date: "2026-08-09", label: "Tue", revenue: 15200, orders: 52 },
    { date: "2026-08-10", label: "Wed", revenue: 11300, orders: 41 },
    { date: "2026-08-11", label: "Thu", revenue: 18700, orders: 63 },
    { date: "2026-08-12", label: "Fri", revenue: 22100, orders: 74 },
    { date: "2026-08-13", label: "Sat", revenue: 19500, orders: 68 },
  ]);

  const [topItems] = useState<TopItem[]>([
    { name: "Paracetamol 500mg", sold: 340, revenue: 1020, profit: 340 },
    { name: "Amoxicillin 500mg", sold: 180, revenue: 2700, profit: 900 },
    { name: "Vitamin C 1000mg", sold: 120, revenue: 4200, profit: 1680 },
    { name: "ORS Powder", sold: 450, revenue: 2250, profit: 450 },
    { name: "Cetirizine 10mg", sold: 95, revenue: 760, profit: 285 },
  ]);

  const [staffMetrics] = useState<StaffMetric[]>([
    { name: "Ramesh Sharma", rxFilled: 145, sales: 45200, accuracy: 98 },
    { name: "Sita Devi", rxFilled: 112, sales: 31800, accuracy: 96 },
    { name: "Hari Prasad", rxFilled: 89, sales: 24100, accuracy: 94 },
  ]);

  useEffect(() => {
    setMounted(true);
    if (!getAdminToken()) router.push("/admin/login");
  }, [router]);
  if (!mounted) return null;

  const totalRevenue = dailySales.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = dailySales.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const prevRevenue = totalRevenue * 0.88; // simulated previous period
  const growth = ((totalRevenue - prevRevenue) / prevRevenue) * 100;

  const maxRevenue = Math.max(...dailySales.map((d) => d.revenue));

  // Simple SVG line chart points
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = 20;
  const points = dailySales.map((d, i) => {
    const x = padding + (i / (dailySales.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (d.revenue / maxRevenue) * (chartHeight - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">Sales trends, top items, and staff performance</p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p === "7d" ? "Last 7 Days" : p === "30d" ? "Last 30 Days" : "Last 90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: `Rs. ${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            change: `+${growth.toFixed(1)}%`,
            up: true,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Total Orders",
            value: `${totalOrders}`,
            icon: Package,
            change: "+12.5%",
            up: true,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Avg Order Value",
            value: `Rs. ${avgOrderValue.toFixed(0)}`,
            icon: BarChart3,
            change: "-3.2%",
            up: false,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            label: "Active Customers",
            value: "124",
            icon: Users,
            change: "+8.1%",
            up: true,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center`}>
                <k.icon size={18} className={k.color} />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  k.up ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {k.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {k.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{k.value}</p>
              <p className="text-xs text-slate-400">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Revenue Trend</h2>
              <p className="text-xs text-slate-400">Daily sales over selected period</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar size={12} /> Aug 07 — Aug 13
          </span>
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full min-w-[400px] h-[200px]"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <line
                key={t}
                x1={padding}
                y1={padding + t * (chartHeight - padding * 2)}
                x2={chartWidth - padding}
                y2={padding + t * (chartHeight - padding * 2)}
                stroke="#f1f5f9"
                strokeWidth={1}
              />
            ))}

            {/* Area under line */}
            <polygon
              points={`${padding},${chartHeight - padding} ${points} ${chartWidth - padding},${chartHeight - padding}`}
              fill="rgba(37, 99, 235, 0.08)"
            />

            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke="#2563eb"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots */}
            {dailySales.map((d, i) => {
              const x = padding + (i / (dailySales.length - 1)) * (chartWidth - padding * 2);
              const y = chartHeight - padding - (d.revenue / maxRevenue) * (chartHeight - padding * 2);
              return (
                <g key={d.date}>
                  <circle cx={x} cy={y} r={4} fill="#2563eb" stroke="white" strokeWidth={2} />
                  <text
                    x={x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex justify-between text-xs text-slate-500 px-2">
          {dailySales.map((d) => (
            <div key={d.date} className="text-center">
              <p className="font-medium text-slate-700">Rs. {(d.revenue / 1000).toFixed(1)}k</p>
              <p>{d.orders} orders</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Package size={18} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Top Selling Items</h2>
              <p className="text-xs text-slate-400">By quantity sold</p>
            </div>
          </div>

          <div className="space-y-3">
            {topItems.map((item, i) => {
              const maxSold = topItems[0].sold;
              const pct = (item.sold / maxSold) * 100;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 font-medium">
                      {i + 1}. {item.name}
                    </span>
                    <span className="text-slate-500 text-xs">
                      {item.sold} sold · Rs. {item.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Profit: Rs. {item.profit} ({((item.profit / item.revenue) * 100).toFixed(0)}% margin)
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <Users size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Staff Performance</h2>
              <p className="text-xs text-slate-400">This period</p>
            </div>
          </div>

          <div className="space-y-3">
            {staffMetrics.map((s) => (
              <div
                key={s.name}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">{s.name}</p>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      s.accuracy >= 97
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : s.accuracy >= 95
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-red-50 text-red-600 border border-red-200"
                    }`}
                  >
                    {s.accuracy}% accuracy
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400">Rx Filled</p>
                    <p className="font-bold text-slate-800">{s.rxFilled}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Sales</p>
                    <p className="font-bold text-slate-800">
                      Rs. {s.sales.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profit Margin Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <TrendingDown size={18} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Profit Margin Report</h2>
            <p className="text-xs text-slate-400">Top 5 items by profitability</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 text-xs font-semibold text-slate-500 uppercase">Item</th>
                <th className="text-right py-3 text-xs font-semibold text-slate-500 uppercase">Revenue</th>
                <th className="text-right py-3 text-xs font-semibold text-slate-500 uppercase">Cost</th>
                <th className="text-right py-3 text-xs font-semibold text-slate-500 uppercase">Profit</th>
                <th className="text-right py-3 text-xs font-semibold text-slate-500 uppercase">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topItems.map((item) => {
                const cost = item.revenue - item.profit;
                const margin = (item.profit / item.revenue) * 100;
                return (
                  <tr key={item.name} className="hover:bg-slate-50/50">
                    <td className="py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="py-3 text-right text-slate-600">Rs. {item.revenue.toLocaleString()}</td>
                    <td className="py-3 text-right text-slate-600">Rs. {cost.toLocaleString()}</td>
                    <td className="py-3 text-right font-bold text-emerald-600">Rs. {item.profit.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        margin >= 30 ? "bg-emerald-50 text-emerald-600" :
                        margin >= 15 ? "bg-amber-50 text-amber-600" :
                        "bg-red-50 text-red-600"
                      }`}>
                        {margin.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}