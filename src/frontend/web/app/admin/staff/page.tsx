"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Plus, Search, X, Trash2 } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "pharmacist" | "cashier" | "manager";
  shift: "morning" | "evening" | "night";
  status: "active" | "inactive";
  joined: string;
}

export default function AdminStaff() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "pharmacist" as Staff["role"], shift: "morning" as Staff["shift"] });
  const [staff, setStaff] = useState<Staff[]>([
    { id: "STF-001", name: "Ramesh Sharma", email: "ramesh@pharma.com", phone: "98XXXXXXXX", role: "pharmacist", shift: "morning", status: "active", joined: "2026-01-15" },
    { id: "STF-002", name: "Sita Devi", email: "sita@pharma.com", phone: "97XXXXXXXX", role: "cashier", shift: "evening", status: "active", joined: "2026-03-10" },
  ]);

  useEffect(() => { setMounted(true); if (!getAdminToken()) router.push("/admin/login"); }, [router]);
  if (!mounted) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) { toast("All fields required", "error"); return; }
    setStaff([...staff, { id: "STF-" + Date.now(), ...form, status: "active", joined: new Date().toISOString().split("T")[0] }]);
    setShowModal(false);
    setForm({ name: "", email: "", phone: "", role: "pharmacist", shift: "morning" });
    toast("Staff added", "success");
  };

  const toggleStatus = (id: string) => {
    setStaff(staff.map(s => s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s));
    toast("Status toggled", "success");
  };

  const remove = (id: string) => { setStaff(staff.filter(s => s.id !== id)); toast("Staff removed", "success"); };
  const filtered = staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Hire, assign shifts, and manage staff</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Staff</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Shift</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-all">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                      {s.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-lg border text-xs font-medium capitalize bg-slate-50 text-slate-600 border-slate-200">{s.role}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 capitalize">{s.shift}</td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleStatus(s.id)} className={`px-2.5 py-1 rounded-lg border text-xs font-medium capitalize transition-all ${
                    s.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}>{s.status}</button>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => remove(s.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No staff found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Staff</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={save} className="space-y-3">
              <input type="text" required placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <input type="email" required placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <input type="tel" required placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value as Staff["role"]})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all">
                <option value="pharmacist">Pharmacist</option>
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
              </select>
              <select value={form.shift} onChange={e => setForm({...form, shift: e.target.value as Staff["shift"]})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all">
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
              <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Add Staff</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}