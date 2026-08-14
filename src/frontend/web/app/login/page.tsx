"use client";
import { useState } from "react";
import Link from "next/link";
import { customerLogin } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Pill, Truck, ShieldCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { const res = await customerLogin({ email, password });
        useAuthStore.getState().setAuth(res.user, res.token);
        window.location.href = "/shop"; }
    catch (e: any) { setErr(e?.message || "Login failed"); }
    finally { setLoading(false); }
  };

  const googleLogin = () => { window.location.href = `${API_URL}/auth/google`; };
  const appleLogin = () => { window.location.href = `${API_URL}/auth/apple`; };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative overflow-hidden items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50">
        <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-blue-400 rounded-full opacity-[0.15] blur-[100px]" />
        <div className="absolute bottom-[15%] right-[10%] w-[250px] h-[250px] bg-violet-400 rounded-full opacity-[0.1] blur-[80px]" />
        <div className="relative z-10 max-w-md px-12">
          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
              <Pill size={28} className="text-white" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-4">Your Health,<br /><span className="text-blue-600">Delivered</span></h2>
            <p className="text-slate-500 text-lg leading-relaxed">Order genuine medicines, track prescriptions, and get doorstep delivery across Nepal.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><Truck size={20} className="text-blue-600" /></div>
              <div><div className="text-slate-800 font-medium text-sm">Fast Delivery</div><div className="text-slate-400 text-xs">Same-day in Kathmandu</div></div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center"><ShieldCheck size={20} className="text-violet-600" /></div>
              <div><div className="text-slate-800 font-medium text-sm">100% Genuine</div><div className="text-slate-400 text-xs">Verified & authentic meds</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-[420px] relative z-10">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <Pill size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to order medicines</p>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="hidden lg:block mb-6">
              <h3 className="text-xl font-bold text-slate-900">Sign In</h3>
              <p className="text-slate-400 text-sm mt-1">Enter your credentials to continue</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <p className="text-xs text-slate-400 text-center">Sign in with your email below</p>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-slate-300 text-xs font-medium uppercase tracking-wider">Or</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            {err && <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{err}</div>}
            <form onSubmit={submit} className="space-y-4">
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" required />
              </div>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-11 pr-12 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"><input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600" />Remember me</label>
                <button type="button" className="text-blue-600 hover:text-violet-600 transition-colors">Forgot password?</button>
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? "Signing in..." : <>Sign In <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>
          <div className="mt-8 text-center space-y-4">
            <p className="text-slate-400 text-sm">Don't have an account? <Link href="/register" className="text-blue-600 font-semibold hover:text-violet-600 transition-colors">Create account</Link></p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-300">
              <Link href="/staff/login" className="hover:text-slate-500 transition-colors">Staff Login</Link>
              <span className="text-slate-200">|</span>
              <Link href="/admin/login" className="hover:text-slate-500 transition-colors">Admin Portal</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
