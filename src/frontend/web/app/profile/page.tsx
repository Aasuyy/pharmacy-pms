"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { customerApi, getCustomerToken, clearCustomerAuth } from "@/lib/api";
import { User, LogOut, Package, MapPin, Phone } from "lucide-react";
export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (!getCustomerToken()) { window.location.href = "/login"; return; }
   customerApi("/customer/me").then(setProfile).catch(() => setProfile({ name: "Customer", email: "customer@example.com", phone: "+977 98XXXXXXXX" }));
customerApi("/customer/orders").then(setOrders).catch(() => setOrders([
  { id: "ORD-001", date: "2025-08-05", total: 340, status: "delivered" },
  { id: "ORD-002", date: "2025-07-28", total: 120, status: "pending" },
]));
  }, []);
  if (!mounted || !profile) return <div className="min-h-screen flex items-center justify-center bg-[#050505]"><div className="text-white/40">Loading...</div></div>;
  return (
    <div className="min-h-screen bg-[#050505]">
      <nav className="flex items-center justify-between px-8 py-4 glass border-b border-white/5 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#39ff14] to-[#32cd32] flex items-center justify-center"><span className="text-[#050505] text-sm font-bold">P</span></div>
          <span className="text-lg font-bold gradient-text">Hit Medical</span>
        </Link>
        <button onClick={() => { clearCustomerAuth(); window.location.href = "/"; }} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"><LogOut size={16} /> Logout</button>
      </nav>
      <div className="px-8 py-8 max-w-4xl mx-auto">
        <div className="glass-elevated rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#39ff14]/20 to-[#22d3ee]/20 flex items-center justify-center text-xl font-bold">{profile.name?.split(' ').map((n: string) => n[0]).join('')}</div>
            <div><h1 className="text-xl font-bold">{profile.name}</h1><p className="text-white/40 text-sm">{profile.email}</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-white/50"><Phone size={14} /> {profile.phone}</div>
            <div className="flex items-center gap-2 text-white/50"><MapPin size={14} /> Kathmandu, Nepal</div>
          </div>
        </div>
        <h2 className="text-lg font-bold mb-4">Order History</h2>
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="glass-elevated rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><Package size={18} className="text-white/30" /></div>
                <div><div className="font-medium">{o.id}</div><div className="text-white/40 text-xs">{o.date}</div></div>
              </div>
              <div className="text-right"><div className="font-bold">Rs. {o.total}</div><span className={`badge ${o.status==='delivered'?'badge-green':'badge-amber'} text-xs`}>{o.status}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
