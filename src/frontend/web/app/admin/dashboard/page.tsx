"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
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
    total_customers: number;
    low_stock: number;
  };
  daily_revenue: { date: string; revenue: number }[];
  top_medicines: { name: string; quantity: number }[];
  status_distribution: { status: string; count: number }[];
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
        `${process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com"}/orders/admin/analytics`
      );
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => `Rs. ${val.toLocaleString()}`;

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

  if (!data) return <div className="p-6 text-red-500">Failed to load analytics</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Real-time pharmacy analytics and insights</p>
      </div>

      {/* Metric Cards */}
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
          value={data.metrics.total_orders.toString()}
          icon={ShoppingCart}
          trend="+8% from last month"
          trendUp={true}
          color="bg-emerald-500"
        />
        <MetricCard
          title="Total Customers"
          value={data.metrics.total_customers.toString()}
          icon={Users}
          trend="+5% from last month"
          trendUp={true}
          color="bg-violet-500"
        />
        <MetricCard
          title="Low Stock Items"
          value={data.metrics.low_stock.toString()}
          icon={AlertTriangle}
          trend="Needs attention"
          trendUp={false}
          color="bg-rose-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.daily_revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(val) => `Rs.${val}`}
                stroke="#94a3b8"
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
                labelFormatter={(label) => new Date(label).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2.5}
                dot={{ fill: "#3b82f6", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Medicines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Selling Medicines</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.top_medicines} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120}
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => val.length > 18 ? val.slice(0, 18) + "..." : val}
              />
              <Tooltip 
                formatter={(value: number) => [`${value} sold`, "Quantity"]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="quantity" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.status_distribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="count"
                nameKey="status"
              >
                {data.status_distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [`${value} orders`, name.charAt(0).toUpperCase() + name.slice(1)]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {data.status_distribution.map((entry, index) => (
              <div key={entry.status} className="flex items-center gap-1.5 text-xs">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-slate-600 capitalize">{entry.status}</span>
                <span className="font-semibold text-slate-900">{entry.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="/admin/orders" className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200">
                <ShoppingCart size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Manage Orders</p>
                <p className="text-xs text-slate-500">View and update order statuses</p>
              </div>
            </a>
            <a href="/admin/inventory" className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group">
              <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200">
                <Package size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Inventory</p>
                <p className="text-xs text-slate-500">Check stock and expiry dates</p>
              </div>
            </a>
            <a href="/admin/customers" className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all group">
              <div className="p-3 rounded-lg bg-violet-100 text-violet-600 group-hover:bg-violet-200">
                <Users size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Customers</p>
                <p className="text-xs text-slate-500">View registered customers</p>
              </div>
            </a>
            <a href="/admin/prescriptions" className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all group">
              <div className="p-3 rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-200">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Prescriptions</p>
                <p className="text-xs text-slate-500">Review pending prescriptions</p>
              </div>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
