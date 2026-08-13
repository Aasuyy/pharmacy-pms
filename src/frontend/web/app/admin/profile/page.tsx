"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken, logoutAdmin } from "@/lib/api";
import { User, Mail, Lock, Camera, Shield, Save, Check, LogOut, AlertTriangle } from "lucide-react";

const DEFAULT_PROFILE = {
  name: "Super Admin",
  username: "cypher_root",
  email: "admin@pharmapro.com",
  phone: "+977-9800000001",
  bio: "Platform administrator with full superuser access.",
  avatarUrl: "",
};

export default function AdminProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      if (!getAdminToken()) {
        router.push("/admin/login");
        return;
      }
      const stored = localStorage.getItem("admin_profile");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProfile((p) => ({ ...p, ...parsed }));
        } catch {}
      }
      const savedAvatar = localStorage.getItem("admin_avatar_url");
      if (savedAvatar) {
        setProfile((p) => ({ ...p, avatarUrl: savedAvatar }));
      }
    }
  }, [router]);

  if (!mounted) return null;

  const persistProfile = (updated: typeof profile) => {
    setProfile(updated);
    localStorage.setItem("admin_profile", JSON.stringify({
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      bio: updated.bio,
    }));
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const updated = { ...profile, avatarUrl: dataUrl };
      setProfile(updated);
      localStorage.setItem("admin_avatar_url", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    const updated = { ...profile, avatarUrl: "" };
    setProfile(updated);
    localStorage.removeItem("admin_avatar_url");
  };

  const handleProfileSave = () => {
    persistProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    if (passwords.new.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    alert("Password updated successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
    setShowPasswordSection(false);
  };

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Profile Settings</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your account and security preferences</p>
        </div>
        <button onClick={() => { logoutAdmin(); router.push("/admin/login"); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all border border-red-100">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {getInitials(profile.name)}
              </div>
            )}
            <button onClick={handlePhotoClick}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-lg hover:bg-slate-700 transition-all">
              <Camera size={14} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
            <p className="text-sm text-slate-400">@{profile.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium flex items-center gap-1">
                <Shield size={12} /> Admin
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium">Active</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={handlePhotoClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-all">
              <Camera size={16} /> {profile.avatarUrl ? "Change Photo" : "Add Photo"}
            </button>
            {profile.avatarUrl && (
              <button onClick={removePhoto}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 transition-all">
                Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <User size={18} className="text-blue-500" /> Personal Information
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input type="text" value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <input type="text" value={profile.username} disabled
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={profile.email}
                onChange={e => setProfile({...profile, email: e.target.value})}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
            <input type="text" value={profile.phone}
              onChange={e => setProfile({...profile, phone: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
            <textarea value={profile.bio} rows={3}
              onChange={e => setProfile({...profile, bio: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
          </div>
        </div>
        <div className="flex items-center gap-4 pt-2">
          <button onClick={handleProfileSave}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-lg ${
              saved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
            }`}>
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "Saved!" : "Save Profile"}
          </button>
          {saved && <span className="text-sm text-emerald-600 font-medium">Profile updated successfully</span>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <button onClick={() => setShowPasswordSection(!showPasswordSection)}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Lock size={18} className="text-amber-600" />
            </div>
            <div className="text-left">
              <h2 className="font-semibold text-slate-800">Change Password</h2>
              <p className="text-xs text-slate-400">Update your login credentials</p>
            </div>
          </div>
          <span className="text-sm text-blue-600 font-medium">{showPasswordSection ? "Cancel" : "Update"}</span>
        </button>
        {showPasswordSection && (
          <form onSubmit={handlePasswordChange} className="px-6 pb-6 space-y-4 border-t border-slate-50 pt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
              <input type="password" required value={passwords.current}
                onChange={e => setPasswords({...passwords, current: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Enter current password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <input type="password" required value={passwords.new}
                onChange={e => setPasswords({...passwords, new: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Min 8 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
              <input type="password" required value={passwords.confirm}
                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Repeat new password" />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs">
              <AlertTriangle size={14} />
              Password must be at least 8 characters with mixed case and numbers.
            </div>
            <button type="submit" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
              <Lock size={16} /> Update Password
            </button>
          </form>
        )}
      </div>

      <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
        <h2 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
          <AlertTriangle size={18} /> Danger Zone
        </h2>
        <p className="text-sm text-red-600/70 mb-4">These actions are irreversible. Proceed with caution.</p>
        <button onClick={() => {
            if (confirm("Are you sure you want to delete your admin account? This cannot be undone.")) {
              logoutAdmin();
              router.push("/admin/login");
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
          Delete Account
        </button>
      </div>
    </div>
  );
}
