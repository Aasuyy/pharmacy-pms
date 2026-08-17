"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Order {
  id: string | number;
  customer_name?: string;
  total_amount?: number;
  status?: string;
  created_at?: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await apiFetch("/api/v1/orders");
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage customer orders and fulfillment</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No orders found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-slate-800">Order #{order.id}</p>
                  <p className="text-xs text-slate-400">{order.customer_name || "Guest"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">Rs. {order.total_amount || 0}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {order.status || "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
