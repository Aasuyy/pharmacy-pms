"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { Plus, Search, Pencil, Trash2, Power, PowerOff, Eye, X, Mail, User, Shield, Check, Camera, Palette } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  avatarColor: string;
  photoUrl?: string;
}

const AVATAR_COLORS = [
  "from-blue-500 to-violet-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-cyan-500 to-blue-500",
  "from-indigo-500 to-purple-500",
  "from-red-500 to-rose-500",
  "from-green-500 to-emerald-500",
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function Avatar({ user, size = 10 }: { user: UserData; size?: number }) {
  const sizeClass = size === 16 ? "w-16 h-16 text-xl" : size === 12 ? "w-12 h-12 text-base" : "w-10 h-10 text-sm";
  if (user.photoUrl) {
    return (
      <img
        src={user.photoUrl}
        alt={user.name}
        className={`${sizeClass} rounded-full object-cover border-2 border-white shadow-sm`}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${user.avatarColor || AVATAR_COLORS[0]} flex items-center justify-center text-white font-bold shadow-sm`}>
      {getInitials(user.name)}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
        <Palette size={14} /> Avatar Color
      </label>
      <div className="flex flex-wrap gap-2">
        {AVATAR_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} transition-all ${value === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`}
          />
        ))}
      </div>
    </div>
  );
}

interface UserFormData {
  name: string;
  email: string;
  role: string;
  status: string;
  photoUrl: string;
  color: string;
}

function UserForm({ initialData, onSubmit, onCancel, submitLabel }: { 
  initialData?: Partial<UserFormData>; 
  onSubmit: (data: UserFormData) => void; 
  onCancel: () => void; 
  submitLabel: string; 
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [role, setRole] = useState(initialData?.role || "Customer");
  const [status, setStatus] = useState(initialData?.status || "active");
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl || "");
  const [color, setColor] = useState(initialData?.color || AVATAR_COLORS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, role, status, photoUrl, color });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-center mb-4">
        <div className="relative">
          {photoUrl ? (
            <img src={photoUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg mx-auto"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-xl font-bold shadow-lg mx-auto`}>
              {name ? getInitials(name) : "?"}
            </div>
          )}
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-lg hover:bg-slate-700 transition-all">
            <Camera size={14} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <p className="text-xs text-slate-400 mt-2 text-center">Click camera to upload</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
        <div className="relative">
          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Enter full name" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Enter email address" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Profile Photo URL <span className="text-slate-400 font-normal">(optional)</span></label>
        <input type="url" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="https://example.com/photo.jpg" />
      </div>
      <ColorPicker value={color} onChange={setColor} />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
        <div className="relative">
          <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select value={role} onChange={e => setRole(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none">
            <option>Admin</option>
            <option>Moderator</option>
            <option>Analyst</option>
            <option>Staff</option>
            <option>Customer</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
        <div className="flex gap-3">
          <button type="button" onClick={() => setStatus("active")}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${status === "active" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            <Check size={14} className="inline mr-1" /> Active
          </button>
          <button type="button" onClick={() => setStatus("inactive")}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${status === "inactive" ? "bg-red-50 border-red-200 text-red-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            Inactive
          </button>
        </div>
      </div>
      <div className="pt-2 flex gap-3">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">Cancel</button>
        <button type="submit"
          className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">{submitLabel}</button>
      </div>
    </form>
  );
}

const DEFAULT_USERS: UserData[] = [
  { id: "1", name: "Super Admin", email: "admin@pharmapro.com", role: "Admin", status: "active", joined: "2026-01-15", avatarColor: AVATAR_COLORS[0] },
  { id: "2", name: "Ram Sharma", email: "ram@pharmapro.com", role: "Moderator", status: "active", joined: "2026-03-20", avatarColor: AVATAR_COLORS[1] },
  { id: "3", name: "Sita Gurung", email: "sita@pharmapro.com", role: "Analyst", status: "inactive", joined: "2026-05-10", avatarColor: AVATAR_COLORS[2] },
  { id: "4", name: "Hari Prasad", email: "hari@pharmapro.com", role: "Staff", status: "active", joined: "2026-06-01", avatarColor: AVATAR_COLORS[3] },
  { id: "5", name: "Anjali Rai", email: "anjali@pharmapro.com", role: "Customer", status: "active", joined: "2026-07-12", avatarColor: AVATAR_COLORS[4] },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!getAdminToken()) {
      router.push("/admin/login");
      return;
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_users");
      if (stored) {
        try {
          setUsers(JSON.parse(stored));
          setLoading(false);
        } catch {
          setUsers(DEFAULT_USERS);
          localStorage.setItem("admin_users", JSON.stringify(DEFAULT_USERS));
          setLoading(false);
        }
      } else {
        setTimeout(() => {
          setUsers(DEFAULT_USERS);
          localStorage.setItem("admin_users", JSON.stringify(DEFAULT_USERS));
          setLoading(false);
        }, 500);
      }
    }
  }, [router]);

  useEffect(() => {
    if (!loading && users.length > 0 && typeof window !== "undefined") {
      localStorage.setItem("admin_users", JSON.stringify(users));
    }
  }, [users, loading]);

  if (!mounted) return null;

  const handleAddUser = (data: UserFormData) => {
    const newUser: UserData = {
      id: String(Date.now()),
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      joined: new Date().toISOString().split("T")[0],
      avatarColor: data.color,
      photoUrl: data.photoUrl || undefined,
    };
    setUsers([...users, newUser]);
    setShowAddModal(false);
  };

  const handleEditUser = (data: UserFormData) => {
    if (!selectedUser) return;
    setUsers(users.map(u => u.id === selectedUser.id ? {
      ...u, name: data.name, email: data.email, role: data.role, status: data.status,
      avatarColor: data.color, photoUrl: data.photoUrl || undefined,
    } : u));
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));
  };

  const deleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = (role: string) => {
    const map: Record<string, string> = {
      Admin: "bg-violet-50 text-violet-700 border-violet-200",
      Moderator: "bg-blue-50 text-blue-700 border-blue-200",
      Analyst: "bg-amber-50 text-amber-700 border-amber-200",
      Staff: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Customer: "bg-slate-50 text-slate-700 border-slate-200",
    };
    return map[role] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const statusColor = (status: string) => {
    return status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage platform users and roles</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No users found</td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${roleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium capitalize ${statusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{user.joined}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSelectedUser(user); setShowViewModal(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all" title="View">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => { setSelectedUser(user); setShowEditModal(true); }} className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-all" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className={`p-2 rounded-lg transition-all ${user.status === "active" ? "hover:bg-red-50 text-slate-400 hover:text-red-600" : "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"}`}
                          title={user.status === "active" ? "Deactivate" : "Activate"}
                        >
                          {user.status === "active" ? <PowerOff size={15} /> : <Power size={15} />}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <Modal title="Add New User" onClose={() => setShowAddModal(false)}>
          <UserForm onSubmit={handleAddUser} onCancel={() => setShowAddModal(false)} submitLabel="Create User" />
        </Modal>
      )}

      {showEditModal && selectedUser && (
        <Modal title={`Edit User: ${selectedUser.name}`} onClose={() => { setShowEditModal(false); setSelectedUser(null); }}>
          <UserForm 
            initialData={{ name: selectedUser.name, email: selectedUser.email, role: selectedUser.role, status: selectedUser.status, photoUrl: selectedUser.photoUrl, color: selectedUser.avatarColor }}
            onSubmit={handleEditUser} 
            onCancel={() => { setShowEditModal(false); setSelectedUser(null); }} 
            submitLabel="Save Changes" 
          />
        </Modal>
      )}

      {showViewModal && selectedUser && (
        <Modal title="User Details" onClose={() => setShowViewModal(false)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar user={selectedUser} size={16} />
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedUser.name}</h4>
                <p className="text-sm text-slate-400">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Role</p>
                <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${roleColor(selectedUser.role)}`}>{selectedUser.role}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium capitalize ${statusColor(selectedUser.status)}`}>{selectedUser.status}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">User ID</p>
                <p className="text-sm font-medium text-slate-700">#{selectedUser.id}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Joined</p>
                <p className="text-sm font-medium text-slate-700">{selectedUser.joined}</p>
              </div>
            </div>
            <button onClick={() => setShowViewModal(false)} className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-all">Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
