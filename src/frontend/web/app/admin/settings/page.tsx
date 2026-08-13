"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { Globe, Bell, Shield, Save, Check } from "lucide-react";

export default function SystemSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({
    pharmacyName: "CYPHER PharmaPro",
    address: "Kathmandu, Nepal",
    phone: "+977-1-4444444",
    email: "support@pharmapro.com",
    currency: "NPR",
    timezone: "Asia/Kathmandu",
  });

  const [notifications, setNotifications] = useState({
    orderAlerts: true,
    lowStockAlerts: true,
    prescriptionAlerts: true,
    emailDigest: false,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "30",
    passwordPolicy: "strong",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  if (typeof window !== "undefined" && !getAdminToken()) {
    router.push("/admin/login");
    return null;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Configure platform-wide preferences</p>
      </div>

      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Globe size={18} className="text-blue-500" /> General Configuration
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Pharmacy Name</label>
              <input type="text" value={general.pharmacyName}
                onChange={e => setGeneral({...general, pharmacyName: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Support Email</label>
              <input type="email" value={general.email}
                onChange={e => setGeneral({...general, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <input type="text" value={general.phone}
                onChange={e => setGeneral({...general, phone: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
              <input type="text" value={general.address}
                onChange={e => setGeneral({...general, address: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Currency</label>
              <select value={general.currency}
                onChange={e => setGeneral({...general, currency: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none">
                <option>NPR</option>
                <option>USD</option>
                <option>INR</option>
                <option>EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Timezone</label>
              <select value={general.timezone}
                onChange={e => setGeneral({...general, timezone: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none">
                <option>Asia/Kathmandu</option>
                <option>Asia/Dubai</option>
                <option>Asia/Kolkata</option>
                <option>UTC</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Bell size={18} className="text-amber-500" /> Notification Preferences
          </h2>
          {[
            { key: "orderAlerts", label: "New Order Alerts", desc: "Get notified when a new order is placed" },
            { key: "lowStockAlerts", label: "Low Stock Alerts", desc: "Get notified when inventory is running low" },
            { key: "prescriptionAlerts", label: "Prescription Uploads", desc: "Get notified when a prescription is uploaded" },
            { key: "emailDigest", label: "Daily Email Digest", desc: "Receive a daily summary of all activities" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key as keyof typeof notifications]})}
                className={`w-12 h-6 rounded-full transition-all relative ${notifications[item.key as keyof typeof notifications] ? 'bg-blue-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${notifications[item.key as keyof typeof notifications] ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Shield size={18} className="text-emerald-500" /> Security Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-800">Two-Factor Authentication</p>
                <p className="text-xs text-slate-400">Require 2FA for all admin logins</p>
              </div>
              <button
                onClick={() => setSecurity({...security, twoFactor: !security.twoFactor})}
                className={`w-12 h-6 rounded-full transition-all relative ${security.twoFactor ? 'bg-blue-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${security.twoFactor ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Session Timeout (minutes)</label>
              <input type="number" value={security.sessionTimeout}
                onChange={e => setSecurity({...security, sessionTimeout: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Policy</label>
              <select value={security.passwordPolicy}
                onChange={e => setSecurity({...security, passwordPolicy: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none">
                <option value="basic">Basic (8+ chars)</option>
                <option value="strong">Strong (8+ chars, mixed case, number)</option>
                <option value="very-strong">Very Strong (12+ chars, symbols required)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-lg ${
            saved
              ? "bg-emerald-500 text-white shadow-emerald-500/20"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
          }`}
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Saved Successfully" : "Save Changes"}
        </button>
        {saved && <span className="text-sm text-emerald-600 font-medium">All settings saved!</span>}
      </div>
    </div>
  );
}
