"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { fetchCustomerOrders } from "@/lib/api";
import { Package, ChevronRight, Clock, CheckCircle, Truck, Home } from "lucide-react";

interface OrderItem {
  id: number;
  drug_id: number;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  total: number;
  status: string;
  payment_method: string;
  shipping_address: {
    full_name: string;
    phone: string;
    address: string;
    city: string;
  };
  created_at: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-500", label: "Pending" },
  processing: { icon: Package, color: "text-blue-500", label: "Processing" },
  shipped: { icon: Truck, color: "text-violet-500", label: "Shipped" },
  delivered: { icon: Home, color: "text-green-500", label: "Delivered" },
  cancelled: { icon: Clock, color: "text-red-500", label: "Cancelled" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomerOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-slate-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/shop" className="text-slate-400 hover:text-slate-600">
            <ChevronRight size={20} className="rotate-180" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900">My Orders</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {!user && (
          <div className="text-center py-12">
            <Package size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Please sign in to view your orders</p>
            <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">
              Sign In
            </Link>
          </div>
        )}

        {user && orders.length === 0 && !error && (
          <div className="text-center py-12">
            <Package size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No orders yet</p>
            <Link href="/shop" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">
              Start Shopping
            </Link>
          </div>
        )}

        {orders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = status.icon;
          return (
            <div key={order.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Order Header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Order #{order.id}</p>
                  <p className="text-xs text-slate-400">{formatDate(order.created_at)}</p>
                </div>
                <div className={`flex items-center gap-1.5 ${status.color}`}>
                  <StatusIcon size={14} />
                  <span className="text-xs font-medium">{status.label}</span>
                </div>
              </div>

              {/* Items */}
              <div className="px-4 py-3 space-y-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Medicine #{item.drug_id} × {item.quantity}
                    </span>
                    <span className="font-medium text-slate-900">Rs. {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  <p>{order.shipping_address?.full_name}</p>
                  <p>{order.shipping_address?.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="text-lg font-bold text-slate-900">Rs. {order.total}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
