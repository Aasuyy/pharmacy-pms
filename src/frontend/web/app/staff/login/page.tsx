"use client";
import { useState } from "react";
import Link from "next/link";
import { staffLogin } from "@/lib/api";
import { Eye, EyeOff, Stethoscope, Lock, ArrowRight, ClipboardList, Truck, Clock } from "lucide-react";

export default function StaffLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await staffLogin(username, password); window.location.href = "/staff/dashboard"; }
    catch (e: any) { setErr(e?.message || "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-emerald-400 rounded-full opacity-[0.1] blur-[100px]" />
        <div className="absolute bottom-[15%] right-[10%] w-[250px] h-[250px] bg-cyan-400 rounded-full opacity-[0.08] blur-[80px]" />
        <div className="relative z-10 max-w-md px-12">
          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
              <Stethoscope size={28} className="text-white" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-4">Staff<br /><span className="text-emerald-600">Portal</span></h2>
            <p className="text-slate-500 text-lg leading-relaxed">Manage orders, verify prescriptions, and coordinate deliveries.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><ClipboardList size={20} className="text-emerald-600" /></div>
              <div><div className="text-slate-800 font-medium text-sm">Prescription Review</div><div className="text-slate-400 text-xs">Verify uploaded prescriptions</div></div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><Truck size={20} className="text-teal-600" /></div>
              <div><div className="text-slate-800 font-medium text-sm">Order Fulfillment</div><div className="text-slate-400 text-xs">Pack and dispatch orders</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <Stethoscope size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Staff Sign In</h1>
            <p className="text-slate-400 text-sm mt-1">Pharmacy staff portal</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="hidden lg:block mb-6">
              <h3 className="text-xl font-bold text-slate-900">Staff Sign In</h3>
              <p className="text-slate-400 text-sm mt-1">Enter your staff credentials</p>
            </div>

            {err && <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{err}</div>}

            <form onSubmit={submit} className="space-y-4">
              <div className="relative">
                <Stethoscope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Staff username" className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" required />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-11 pr-12 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? "Signing in..." : <>Sign In <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
              <Link href="/login" className="hover:text-slate-600 transition-colors">Customer Login</Link>
              <span className="text-slate-200">|</span>
              <Link href="/admin/login" className="hover:text-slate-600 transition-colors">Admin Portal</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
