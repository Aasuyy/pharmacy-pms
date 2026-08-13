"use client";
import { useState } from "react";
import { Save, User, Lock, Bell, Store } from "lucide-react";
export default function StaffSettings() {
  const [tab, setTab] = useState("general");
  const tabs = [
    { id: "general", label: "General", icon: Store },
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-white/40 text-sm mt-1">Manage your account and preferences</p></div>
      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab===t.id?'active':'inactive'} flex items-center gap-2 !flex-none !px-5`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>
      <div className="glass-elevated rounded-2xl p-6 space-y-5">
        {tab === "general" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="text-white/40 text-sm mb-2 block">Pharmacy Name</label><input defaultValue="PharmaPro Nepal" className="input-futuristic" /></div>
            <div><label className="text-white/40 text-sm mb-2 block">Email</label><input defaultValue="admin@pharmapro.np" className="input-futuristic" /></div>
            <div><label className="text-white/40 text-sm mb-2 block">Phone</label><input defaultValue="+977 1-4XXXXXX" className="input-futuristic" /></div>
            <div><label className="text-white/40 text-sm mb-2 block">Address</label><input defaultValue="Kathmandu, Nepal" className="input-futuristic" /></div>
          </div>
        )}
        {tab === "profile" && (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#39ff14]/20 to-[#22d3ee]/20 flex items-center justify-center text-xl font-bold">AD</div>
              <div><div className="font-semibold">Admin User</div><div className="text-white/40 text-sm">admin@pharmapro.np</div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="text-white/40 text-sm mb-2 block">Full Name</label><input defaultValue="Admin User" className="input-futuristic" /></div>
              <div><label className="text-white/40 text-sm mb-2 block">Role</label><input defaultValue="Administrator" disabled className="input-futuristic opacity-50" /></div>
            </div>
          </>
        )}
        {tab === "security" && (
          <div className="space-y-4 max-w-md">
            <div><label className="text-white/40 text-sm mb-2 block">Current Password</label><input type="password" className="input-futuristic" /></div>
            <div><label className="text-white/40 text-sm mb-2 block">New Password</label><input type="password" className="input-futuristic" /></div>
            <div><label className="text-white/40 text-sm mb-2 block">Confirm Password</label><input type="password" className="input-futuristic" /></div>
          </div>
        )}
        {tab === "notifications" && (
          <div className="space-y-3">
            {["Low stock alerts", "New prescription notifications", "Daily sales summary", "System updates"].map((n, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-sm text-white/70">{n}</span>
                <div className="w-10 h-5 rounded-full bg-[#39ff14]/20 relative cursor-pointer"><div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-[#39ff14]" /></div>
              </div>
            ))}
          </div>
        )}
        <div className="pt-4 border-t border-white/5">
          <button className="btn-primary !w-auto !px-8 flex items-center gap-2"><Save size={16} /> Save Changes</button>
        </div>
      </div>
    </div>
  );
}
