"use client";
import { useState } from "react";
import Link from "next/link";
import { customerRegister } from "@/lib/api";
import { Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight, Pill, CheckCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setErr("Passwords do not match"); return; }
    setErr(""); setLoading(true);
    try {
      await customerRegister(form.name, form.email, form.password, form.phone);
      setSuccess(true);
      setTimeout(() => { window.location.href = "/login"; }, 2000);
    } catch (e: any) { setErr(e?.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  const googleLogin = () => { window.location.href = `${API_URL}/auth/google`; };
  const appleLogin = () => { window.location.href = `${API_URL}/auth/apple`; };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-violet-50">
      <div className="text-center">
        <CheckCircle size={64} className="text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h2>
        <p className="text-slate-500 text-sm">Redirecting to login...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-50 px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Pill size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join PharmaPro Nepal</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={googleLogin} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button onClick={appleLogin} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.94 3.65-.74 1.53.24 2.68 1.1 3.36 2.37-3.01 1.87-2.54 5.98.22 7.13-.57 1.5-1.31 2.99-2.31 4.47zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Apple
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-slate-300 text-xs font-medium uppercase tracking-wider">Or register with email</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {err && <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{err}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div className="relative"><User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Full name" className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" required /></div>
            <div className="relative"><Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="Email address" className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" required /></div>
            <div className="relative"><Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="Phone number" className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" /></div>
            <div className="relative"><Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Password" className="w-full pl-11 pr-12 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" required /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
            <div className="relative"><Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type={showConfirm ? "text" : "password"} value={form.confirm} onChange={(e) => setForm({...form, confirm: e.target.value})} placeholder="Confirm password" className="w-full pl-11 pr-12 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" required /><button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
            <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? "Creating..." : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:text-violet-600 transition-colors">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
