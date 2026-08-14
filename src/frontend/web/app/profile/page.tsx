"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { fetchCustomer } from "@/lib/api";
import { ChevronRight, User, Phone, MapPin, Mail } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchCustomer().then(setProfile).catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Please sign in to view your profile</p>
          <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/shop" className="text-slate-400 hover:text-slate-600"><ChevronRight size={20} className="rotate-180" /></Link>
          <h1 className="text-lg font-bold text-slate-900">My Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-3">
            {user.full_name?.charAt(0) || "U"}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{user.full_name}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <Phone size={18} className="text-slate-400" />
            <div><p className="text-xs text-slate-400">Phone</p><p className="text-sm font-medium text-slate-900">{profile?.phone || "Not set"}</p></div>
          </div>
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <MapPin size={18} className="text-slate-400" />
            <div><p className="text-xs text-slate-400">Address</p><p className="text-sm font-medium text-slate-900">{profile?.address || "Not set"}</p></div>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <Mail size={18} className="text-slate-400" />
            <div><p className="text-xs text-slate-400">City</p><p className="text-sm font-medium text-slate-900">{profile?.city || "Not set"}</p></div>
          </div>
        </div>

        <button onClick={() => { logout(); window.location.href = "/login"; }} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors">
          Logout
        </button>
      </div>
    </div>
  );
}
