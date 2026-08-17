"use client";

import Link from "next/link";
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  AlertTriangle, 
  Package, 
  FileText,
  ArrowUpRight
} from "lucide-react";

export default function AdminDashboard() {
  const metrics = {
    total_revenue: 75,
    total_orders: 4,
    total_customers: 1,
    low_stock_items: 1,
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-xs text-slate-400 mt-0.5">Real-time pharmacy analytics and insights</p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Revenue</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Rs. {metrics.total_revenue}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12% from last month
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Orders</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.total_orders}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +8% from last month
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Customers</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.total_customers}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +5% from last month
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-purple-200">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Low Stock Items</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.low_stock_items}</h3>
            <p className="text-xs text-rose-500 font-medium mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Needs attention
            </p>
          </div>
          <div className="w-12 h-12 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-rose-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[300px] flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-800">Revenue (Last 30 Days)</h2>
          <div className="relative h-48 w-full border-b border-l border-slate-200 flex items-end justify-around pb-2 px-4">
            <div className="absolute left-1 top-0 text-[10px] text-slate-400">Rs. 80</div>
            <div className="absolute left-1 top-1/3 text-[10px] text-slate-400">Rs. 60</div>
            <div className="absolute left-1 top-2/3 text-[10px] text-slate-400">Rs. 40</div>
            <div className="absolute left-1 bottom-0 text-[10px] text-slate-400">Rs. 0</div>
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white shadow mb-16"></div>
              <span className="text-[10px] text-slate-400">Aug 14</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Top Selling Medicines</h2>
          <div className="text-center text-xs text-slate-400 py-16">
            No top sales recorded yet.
          </div>
        </div>
      </div>

      {/* Quick Actions & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Order Status</h2>
          <div className="text-center text-xs text-slate-400 py-12">
            All orders processed cleanly.
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/admin/orders" className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 transition-colors flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Manage Orders</p>
                <p className="text-[10px] text-slate-400">View and update order statuses</p>
              </div>
            </Link>

            <Link href="/admin/inventory" className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 transition-colors flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Inventory</p>
                <p className="text-[10px] text-slate-400">Check stock and expiry dates</p>
              </div>
            </Link>

            <Link href="/admin/customers" className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 transition-colors flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Customers</p>
                <p className="text-[10px] text-slate-400">View registered customers</p>
              </div>
            </Link>

            <Link href="/admin/prescriptions" className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 transition-colors flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Prescriptions</p>
                <p className="text-[10px] text-slate-400">Review pending prescriptions</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
