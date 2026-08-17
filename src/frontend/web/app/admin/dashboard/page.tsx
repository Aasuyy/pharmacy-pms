"use client";
import Link from "next/link";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  UserCheck,
  Package,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Analytics {
  metrics: {
    total_revenue: number;
    total_orders: number;
    avg_order_value: number;
    active_customers: number;
  };
  dailySales: { date: string; label: string; revenue: number; orders: number }[];
  topItems: { name: string; sold: number; revenue: number; profit: number }[];
  staffMetrics: { name: string; rxFilled: number; sales: number; accuracy: number }[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com"}/analytics/`
      );
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val?: number) => `Rs. ${(val ?? 0).toLocaleString()}`;

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendUp, 
    color 
  }: { 
    title: string; 
    value: string; 
    icon: any; 
    trend?: string; 
    trendUp?: boolean;
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendUp ? "text-emerald-600" : "text-rose-600"}`}>
              {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trend}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </motion.div>
  );

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 w-full">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
        </div>
        <div className="h-12 w-12 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
          <div className="h-80 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.metrics) {
    return <div className="p-6 text-red-500 font-medium">Failed to load analytics data</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Real-time pharmacy analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(data.metrics.total_revenue)}
          icon={TrendingUp}
          trend="+12% from last month"
          trendUp={true}
          color="bg-blue-500"
        />
        <MetricCard
          title="Total Orders"
          value={(data.metrics.total_orders ?? 0).toString()}
          icon={ShoppingCart}
          trend="+8% from last month"
          trendUp={true}
          color="bg-emerald-500"
        />
        <MetricCard
          title="Avg Order Value"
          value={formatCurrency(data.metrics.avg_order_value)}
          icon={Users}
          trend="+3% from last month"
          trendUp={true}
          color="bg-violet-500"
        />
        <MetricCard
          title="Active Customers"
          value={(data.metrics.active_customers ?? 0).toString()}
          icon={UserCheck}
          trend="+5% from last month"
          trendUp={true}
          color="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Daily Sales (Weekly Trend)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.dailySales ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
              <YAxis tickFormatter={(val) => `Rs.${val}`} stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
                labelFormatter={(label) => `Day: ${label}`}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Selling Items</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.topItems ?? []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="name" type="category" width={120} stroke="#94a3b8" fontSize={11} tickFormatter={(val) => val.length > 18 ? val.slice(0, 18) + "..." : val} />
              <Tooltip formatter={(value: number) => [`${value} sold`, "Sold"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
              <Bar dataKey="sold" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Staff Performance</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.staffMetrics ?? []} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="rxFilled" nameKey="name">
                {(data.staffMetrics ?? []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value} Rx Filled`, "Prescriptions"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-2">
            {(data.staffMetrics ?? []).map((staff, index) => (
              <div key={staff.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-600 font-medium">{staff.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{staff.rxFilled} Rx ({staff.accuracy}%)</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/admin/orders" className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200"><ShoppingCart size={20} /></div>
              <div><p className="font-semibold text-slate-900">Manage Orders</p><p className="text-xs text-slate-500">View and update order statuses</p></div>
            </Link>
            <Link href="/admin/inventory" className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group">
              <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200"><Package size={20} /></div>
              <div><p className="font-semibold text-slate-900">Inventory</p><p className="text-xs text-slate-500">Check stock and expiry dates</p></div>
            </Link>
            <Link href="/admin/customers" className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all group">
              <div className="p-3 rounded-lg bg-violet-100 text-violet-600 group-hover:bg-violet-200"><Users size={20} /></div>
              <div><p className="font-semibold text-slate-900">Customers</p><p className="text-xs text-slate-500">View registered customers</p></div>
            </Link>
            <Link href="/admin/prescriptions" className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all group">
              <div className="p-3 rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-200"><UserCheck size={20} /></div>
              <div><p className="font-semibold text-slate-900">Prescriptions</p><p className="text-xs text-slate-500">Review pending prescriptions</p></div>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Drugs Expiring Soon</h2>
        <ExpiryAlert />
      </div>
    </div>
  );
}

function ExpiryAlert() {
  const [expiring, setExpiring] = useState<any[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com";

  useEffect(() => {
    fetch(`${API_URL}/shop/expiring?days=30`)
      .then(r => r.json())
      .then(data => setExpiring(Array.isArray(data) ? data : []))
      .catch(() => setExpiring([]));
  }, [API_URL]);

  if (expiring.length === 0) {
    return <p className="text-sm text-slate-400">No drugs expiring within 30 days</p>;
  }

  return (
    <div className="space-y-2">
      {expiring.map((drug: any) => (
        <div key={drug.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-slate-900">{drug.name}</p>
            <p className="text-xs text-slate-500">Stock: {drug.stock_quantity}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${new Date(drug.expiry_date) < new Date() ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
            {new Date(drug.expiry_date).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}
