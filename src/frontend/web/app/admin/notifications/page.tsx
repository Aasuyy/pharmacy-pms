"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { AlertTriangle, Package, Clock, CheckCircle, Trash2, Pill } from "lucide-react";

interface Notification {
  id: string;
  type: "stock" | "expiry" | "order" | "system";
  title: string;
  message: string;
  read: boolean;
  time: string;
}

export default function AdminNotifications() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | Notification["type"]>("all");
  const [notifs, setNotifs] = useState<Notification[]>([
    { id: "N1", type: "stock", title: "Low Stock Alert", message: "Paracetamol 500mg is below reorder level (5 left)", read: false, time: "2 min ago" },
    { id: "N2", type: "expiry", title: "Expiring Soon", message: "Vitamin C 1000mg batch expires in 7 days", read: false, time: "1 hour ago" },
    { id: "N3", type: "order", title: "New Customer Order", message: "Order ORD-001 placed for Rs. 520", read: true, time: "3 hours ago" },
    { id: "N4", type: "system", title: "Backup Complete", message: "Daily database backup completed", read: true, time: "Yesterday" },
  ]);

  useEffect(() => { setMounted(true); if (!getAdminToken()) router.push("/admin/login"); }, [router]);
  if (!mounted) return null;

  const markRead = (id: string) => setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, read: true })));
  const remove = (id: string) => setNotifs(notifs.filter(n => n.id !== id));

  const filtered = filter === "all" ? notifs : notifs.filter(n => n.type === filter);
  const unreadCount = notifs.filter(n => !n.read).length;

  const iconMap = {
    stock: <Package size={16} className="text-amber-500" />,
    expiry: <AlertTriangle size={16} className="text-red-500" />,
    order: <Pill size={16} className="text-blue-500" />,
    system: <Clock size={16} className="text-slate-400" />,
  };

  const colorMap = {
    stock: "bg-amber-50 border-amber-100",
    expiry: "bg-red-50 border-red-100",
    order: "bg-blue-50 border-blue-100",
    system: "bg-slate-50 border-slate-100",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-400 text-sm mt-0.5">{unreadCount} unread alerts</p>
        </div>
        <button onClick={markAllRead} className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
          Mark All Read
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "stock", "expiry", "order", "system"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap capitalize ${filter === f ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {f} {f === "all" && `(${notifs.length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((n) => (
          <div key={n.id} onClick={() => markRead(n.id)}
            className={`p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-sm ${colorMap[n.type]} ${!n.read ? "ring-1 ring-blue-500/10" : ""}`}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                {iconMap[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className={`text-sm font-semibold ${!n.read ? "text-slate-900" : "text-slate-600"}`}>{n.title}</h3>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <p className="text-sm text-slate-500">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{n.time}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); remove(n.id); }} className="p-2 rounded-lg hover:bg-white/80 text-slate-400 hover:text-red-500 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-slate-400">No notifications</div>}
      </div>
    </div>
  );
}