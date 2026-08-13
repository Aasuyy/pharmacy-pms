"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { ShoppingBag, Search, Eye, CheckCircle, XCircle, Truck, Clock, Package, MapPin, Pill, Calendar, CreditCard, User, Phone, Box } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  stock: number;
  expiry: string;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  date: string;
  items: OrderItem[];
  payment: string;
  timeline: { status: string; time: string }[];
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [orders, setOrders] = useState<Order[]>([
    { id: "ORD-20260812-A7B3", customer: "Ram Sharma", email: "ram@email.com", phone: "+977-9800000001", address: "Koteshwor, Kathmandu", total: 1250, status: "pending", date: "2026-08-12", payment: "Cash on Delivery", items: [{ name: "Paracetamol 500mg", qty: 2, price: 150, stock: 45, expiry: "2027-05-10" }, { name: "Vitamin C 1000mg", qty: 1, price: 350, stock: 12, expiry: "2026-11-20" }, { name: "Cetirizine 10mg", qty: 3, price: 250, stock: 8, expiry: "2027-01-15" }], timeline: [{ status: "Order Placed", time: "14:32" }, { status: "Payment Pending", time: "14:32" }] },
    { id: "ORD-20260812-C9D1", customer: "Sita Gurung", email: "sita@email.com", phone: "+977-9800000002", address: "Lalitpur, Nepal", total: 450, status: "confirmed", date: "2026-08-12", payment: "eSewa", items: [{ name: "Amoxicillin 500mg", qty: 1, price: 450, stock: 200, expiry: "2027-01-10" }], timeline: [{ status: "Order Placed", time: "13:15" }, { status: "Payment Confirmed", time: "13:16" }, { status: "Processing", time: "13:20" }] },
    { id: "ORD-20260812-E2F8", customer: "Hari Prasad", email: "hari@email.com", phone: "+977-9800000003", address: "Bhaktapur, Nepal", total: 2800, status: "shipped", date: "2026-08-11", payment: "Khalti", items: [{ name: "Insulin Glargine", qty: 2, price: 1200, stock: 5, expiry: "2026-10-01" }, { name: "Glucometer Strips", qty: 1, price: 400, stock: 20, expiry: "2027-02-28" }], timeline: [{ status: "Order Placed", time: "10:00" }, { status: "Payment Confirmed", time: "10:05" }, { status: "Shipped", time: "16:30" }] },
    { id: "ORD-20260812-G4H6", customer: "Anjali Rai", email: "anjali@email.com", phone: "+977-9800000004", address: "Thamel, Kathmandu", total: 890, status: "delivered", date: "2026-08-10", payment: "Cash on Delivery", items: [{ name: "Omeprazole 20mg", qty: 2, price: 280, stock: 60, expiry: "2027-08-15" }, { name: "Domperidone 10mg", qty: 1, price: 330, stock: 35, expiry: "2027-03-20" }], timeline: [{ status: "Order Placed", time: "09:00" }, { status: "Shipped", time: "14:00" }, { status: "Delivered", time: "18:45" }] },
    { id: "ORD-20260811-K2L4", customer: "Bikash Thapa", email: "bikash@email.com", phone: "+977-9800000005", address: "Patan, Lalitpur", total: 3200, status: "cancelled", date: "2026-08-11", payment: "Failed", items: [{ name: "Augmentin 625mg", qty: 2, price: 800, stock: 0, expiry: "2026-09-01" }, { name: "Ibuprofen 400mg", qty: 4, price: 200, stock: 150, expiry: "2027-04-10" }], timeline: [{ status: "Order Placed", time: "11:20" }, { status: "Payment Failed", time: "11:22" }, { status: "Cancelled", time: "11:30" }] },
    { id: "ORD-20260811-M5N7", customer: "Priya Sharma", email: "priya@email.com", phone: "+977-9800000006", address: "Baneshwor, Kathmandu", total: 150, status: "pending", date: "2026-08-11", payment: "Cash on Delivery", items: [{ name: "ORS Powder", qty: 5, price: 30, stock: 200, expiry: "2028-01-01" }], timeline: [{ status: "Order Placed", time: "08:15" }] },
  ]);

  useEffect(() => {
    setMounted(true);
    if (!getAdminToken()) router.push("/admin/login");
  }, [router]);

  if (!mounted) return null;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      confirmed: "bg-blue-50 text-blue-700 border-blue-200",
      shipped: "bg-violet-50 text-violet-700 border-violet-200",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return map[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const statusIcon = (status: string) => {
    if (status === "pending") return <Clock size={14} className="text-amber-500" />;
    if (status === "confirmed") return <CheckCircle size={14} className="text-blue-500" />;
    if (status === "shipped") return <Truck size={14} className="text-violet-500" />;
    if (status === "delivered") return <Package size={14} className="text-emerald-500" />;
    return <XCircle size={14} className="text-red-500" />;
  };

  const updateStatus = (id: string, newStatus: Order["status"]) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const filtered = orders.filter(o => {
    const matchesSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Total Orders", value: orders.length, color: "text-slate-900" },
    { label: "Pending", value: orders.filter(o => o.status === "pending").length, color: "text-amber-600" },
    { label: "Shipped", value: orders.filter(o => o.status === "shipped").length, color: "text-violet-600" },
    { label: "Delivered", value: orders.filter(o => o.status === "delivered").length, color: "text-emerald-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Order Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track and manage all pharmacy orders</p>
        </div>
        <Link href="/admin/dashboard" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-all">
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search orders by ID or customer..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">No orders found</td></tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-800">{order.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">{order.customer}</p>
                      <p className="text-xs text-slate-400">{order.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.items.length}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">Rs. {order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium capitalize flex items-center gap-1 w-fit ${statusBadge(order.status)}`}>
                        {statusIcon(order.status)} {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{order.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === "pending" && (
                          <button onClick={() => updateStatus(order.id, "confirmed")}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-all">Confirm</button>
                        )}
                        {order.status === "confirmed" && (
                          <button onClick={() => updateStatus(order.id, "shipped")}
                            className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 text-xs font-medium hover:bg-violet-100 transition-all">Ship</button>
                        )}
                        {order.status === "shipped" && (
                          <button onClick={() => updateStatus(order.id, "delivered")}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-all">Deliver</button>
                        )}
                        <button onClick={() => setSelectedOrder(order)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all" title="View Details">
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <ShoppingBag size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedOrder.id}</h3>
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold capitalize flex items-center gap-1 w-fit mt-0.5 ${statusBadge(selectedOrder.status)}`}>
                    {statusIcon(selectedOrder.status)} {selectedOrder.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-400 mb-2 flex items-center gap-1"><User size={10} /> Customer</p>
                  <p className="text-sm font-medium text-slate-800">{selectedOrder.customer}</p>
                  <p className="text-xs text-slate-500">{selectedOrder.email}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Phone size={10} /> {selectedOrder.phone}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-400 mb-2 flex items-center gap-1"><CreditCard size={10} /> Payment</p>
                  <p className="text-sm font-medium text-slate-800">{selectedOrder.payment}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Calendar size={10} /> {selectedOrder.date}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-100 h-40 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-300 via-slate-200 to-slate-100" />
                <div className="text-center relative z-10">
                  <MapPin size={28} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">{selectedOrder.address}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Delivery Location (Google Maps integration)</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1"><Pill size={12} /> Ordered Items</p>
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Medicine</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-slate-500">Qty</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">Price</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-slate-500">Stock</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">Expiry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedOrder.items.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{item.qty}</td>
                          <td className="px-4 py-3 text-right text-slate-600">Rs. {item.price}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-medium ${item.stock >= item.qty ? "text-emerald-600" : item.stock > 0 ? "text-amber-600" : "text-red-600"}`}>
                              {item.stock >= item.qty ? "In Stock" : item.stock > 0 ? `Low (${item.stock})` : "Out of Stock"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-slate-500">{item.expiry}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50/50 border-t border-slate-100">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-xs font-medium text-slate-500">Total</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">Rs. {selectedOrder.total}</td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1"><Box size={12} /> Order Timeline</p>
                <div className="space-y-3">
                  {selectedOrder.timeline.map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${i === selectedOrder.timeline.length - 1 ? "bg-blue-500" : "bg-slate-300"}`} />
                      <div className="flex-1 flex items-center justify-between">
                        <p className="text-sm text-slate-700">{t.status}</p>
                        <p className="text-xs text-slate-400">{t.time}</p>
                      </div>
                    </div>
                  ))}
                  {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                    <div className="flex items-center gap-3 opacity-50">
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <p className="text-sm text-slate-400">Next: {selectedOrder.status === "pending" ? "Payment Confirmation" : selectedOrder.status === "confirmed" ? "Shipping" : "Delivery"}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedOrder.status === "pending" && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { updateStatus(selectedOrder.id, "confirmed"); setSelectedOrder(null); }}
                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Confirm Order</button>
                  <button onClick={() => { updateStatus(selectedOrder.id, "cancelled"); setSelectedOrder(null); }}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">Cancel Order</button>
                </div>
              )}
              {selectedOrder.status === "confirmed" && (
                <button onClick={() => { updateStatus(selectedOrder.id, "shipped"); setSelectedOrder(null); }}
                  className="w-full py-3 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20">Mark as Shipped</button>
              )}
              {selectedOrder.status === "shipped" && (
                <button onClick={() => { updateStatus(selectedOrder.id, "delivered"); setSelectedOrder(null); }}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">Mark as Delivered</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
