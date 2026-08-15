"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { fetchOrder } from "@/lib/api";
import { ChevronLeft, Package, Clock, CheckCircle, Truck, Home, MapPin, Phone, User } from "lucide-react";

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

const timelineSteps = [
  { key: "pending", label: "Order Placed", icon: Clock, description: "We received your order" },
  { key: "processing", label: "Processing", icon: Package, description: "Preparing your medicines" },
  { key: "shipped", label: "Shipped", icon: Truck, description: "Out for delivery" },
  { key: "delivered", label: "Delivered", icon: Home, description: "Package delivered" },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuthStore();

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await fetchOrder(Number(id));
      setOrder(data);
    } catch (err) {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Please sign in to view order details</p>
          <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-slate-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Order not found</p>
          <Link href="/orders" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = timelineSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/orders" className="text-slate-400 hover:text-slate-600">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Order #{order.id}</h1>
            <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className={`rounded-xl p-4 flex items-center gap-3 ${isCancelled ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCancelled ? "bg-red-100" : "bg-blue-100"}`}>
            {isCancelled ? <Clock size={20} className="text-red-600" /> : <CheckCircle size={20} className="text-blue-600" />}
          </div>
          <div>
            <p className={`text-sm font-bold ${isCancelled ? "text-red-900" : "text-blue-900"}`}>
              {isCancelled ? "Order Cancelled" : `Order ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`}
            </p>
            <p className={`text-xs ${isCancelled ? "text-red-700" : "text-blue-700"}`}>
              {isCancelled ? "This order has been cancelled" : "We're working on your order"}
            </p>
          </div>
        </div>

        {!isCancelled && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-6">Order Progress</h2>
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200" />
              <div className="space-y-6">
                {timelineSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div key={step.key} className="relative flex items-start gap-4">
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"}`}>
                        <StepIcon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className={`text-sm font-bold ${isActive ? "text-slate-900" : "text-slate-400"}`}>{step.label}</p>
                        <p className={`text-xs ${isActive ? "text-slate-600" : "text-slate-400"}`}>{step.description}</p>
                        {isCurrent && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">CURRENT</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Order Items</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Medicine #{item.drug_id}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-slate-900">Rs. {item.price * item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">Total</p>
            <p className="text-lg font-bold text-slate-900">Rs. {order.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Shipping Address</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <User size={14} className="text-slate-400" />
              {order.shipping_address?.full_name}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Phone size={14} className="text-slate-400" />
              {order.shipping_address?.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <MapPin size={14} className="text-slate-400" />
              {order.shipping_address?.address}, {order.shipping_address?.city}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-bold text-slate-900 mb-2">Payment Method</h2>
          <p className="text-sm text-slate-600 capitalize">{order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}</p>
        </div>
      </div>
    </div>
  );
}
