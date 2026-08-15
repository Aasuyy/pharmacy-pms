"use client";
import { useEffect, useState } from "react";
import { fetchOrders, updateOrderStatus } from "@/lib/api";
import { Package, Clock, CheckCircle, Truck, Home, ChevronDown, Search } from "lucide-react";

interface Order {
  id: number;
  customer_id: number;
  total: number;
  status: string;
  payment_method: string;
  shipping_address: any;
  created_at: string;
  items: any[];
}

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Pending" },
  processing: { icon: Package, color: "text-blue-600", bg: "bg-blue-50", label: "Processing" },
  shipped: { icon: Truck, color: "text-violet-600", bg: "bg-violet-50", label: "Shipped" },
  delivered: { icon: Home, color: "text-green-600", bg: "bg-green-50", label: "Delivered" },
  cancelled: { icon: Clock, color: "text-red-600", bg: "bg-red-50", label: "Cancelled" },
};

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data.orders || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setUpdating(orderId);
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = orders.filter((o) => 
    o.shipping_address?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.shipping_address?.phone?.includes(search) ||
    o.id.toString().includes(search)
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Orders</h1>
          <p className="text-xs text-slate-500">Manage all customer orders</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No orders found</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Items</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">#{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="text-slate-900">{order.shipping_address?.full_name || "Guest"}</p>
                        <p className="text-xs text-slate-400">{order.shipping_address?.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{order.items?.length || 0} items</td>
                      <td className="px-4 py-3 font-bold text-slate-900">Rs. {order.total}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(order.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updating === order.id}
                            className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          {updating === order.id && <span className="ml-2 text-xs text-blue-500">Saving...</span>}
                        </div>
                      </td>
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
