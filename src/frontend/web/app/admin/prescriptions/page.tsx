"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Eye, Search, Pill, User, Calendar, Phone, MapPin } from "lucide-react";

interface Prescription {
  id: string;
  patient: string;
  email: string;
  phone: string;
  address: string;
  status: "pending" | "approved" | "rejected";
  uploaded: string;
  notes: string;
  medicines: { name: string; qty: number; stock: number; expiry: string }[];
}

export default function AdminPrescriptions() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    { id: "RX-20260812-001", patient: "Ram Sharma", email: "ram@email.com", phone: "+977-9800000001", address: "Koteshwor, Kathmandu", status: "pending", uploaded: "2 hrs ago", notes: "Blood pressure medication renewal", medicines: [{ name: "Amlodipine 5mg", qty: 30, stock: 120, expiry: "2027-06-15" }, { name: "Losartan 50mg", qty: 30, stock: 85, expiry: "2027-04-20" }] },
    { id: "RX-20260812-002", patient: "Sita Gurung", email: "sita@email.com", phone: "+977-9800000002", address: "Lalitpur, Nepal", status: "approved", uploaded: "5 hrs ago", notes: "Antibiotic prescription", medicines: [{ name: "Amoxicillin 500mg", qty: 21, stock: 200, expiry: "2027-01-10" }] },
    { id: "RX-20260812-003", patient: "Hari Prasad", email: "hari@email.com", phone: "+977-9800000003", address: "Bhaktapur, Nepal", status: "rejected", uploaded: "1 day ago", notes: "Invalid dosage information", medicines: [{ name: "Paracetamol 500mg", qty: 100, stock: 0, expiry: "2026-09-01" }] },
    { id: "RX-20260811-004", patient: "Anjali Rai", email: "anjali@email.com", phone: "+977-9800000004", address: "Thamel, Kathmandu", status: "pending", uploaded: "1 day ago", notes: "Diabetes medication refill", medicines: [{ name: "Metformin 500mg", qty: 60, stock: 45, expiry: "2027-03-12" }, { name: "Glimepiride 2mg", qty: 30, stock: 12, expiry: "2026-12-01" }] },
  ]);

  useEffect(() => {
    setMounted(true);
    if (!getAdminToken()) router.push("/admin/login");
  }, [router]);

  if (!mounted) return null;

  const updateStatus = (id: string, newStatus: "approved" | "rejected") => {
    setPrescriptions(prev => prev.map(rx => rx.id === id ? { ...rx, status: newStatus } : rx));
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
    };
    return map[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const statusIcon = (status: string) => {
    if (status === "pending") return <Clock size={14} className="text-amber-500" />;
    if (status === "approved") return <CheckCircle size={14} className="text-emerald-500" />;
    return <XCircle size={14} className="text-red-500" />;
  };

  const filtered = prescriptions.filter(rx => {
    const matchesSearch = rx.patient.toLowerCase().includes(search.toLowerCase()) || rx.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || rx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Pending", value: prescriptions.filter(r => r.status === "pending").length, color: "text-amber-600" },
    { label: "Approved", value: prescriptions.filter(r => r.status === "approved").length, color: "text-emerald-600" },
    { label: "Rejected", value: prescriptions.filter(r => r.status === "rejected").length, color: "text-red-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Prescription Review</h1>
          <p className="text-slate-400 text-sm mt-0.5">Verify and approve uploaded prescriptions</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium">
          <AlertTriangle size={14} />
          {prescriptions.filter(r => r.status === "pending").length} pending review
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search prescriptions..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No prescriptions found</div>
          ) : (
            filtered.map((rx) => (
              <div key={rx.id} className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-slate-800">{rx.id}</span>
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold capitalize flex items-center gap-1 ${statusBadge(rx.status)}`}>
                      {statusIcon(rx.status)} {rx.status}
                    </span>
                  </div>
                  <p className="text-slate-800 text-sm font-medium">{rx.patient}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{rx.notes}</p>
                  <p className="text-slate-300 text-xs mt-1">{rx.uploaded}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedRx(rx)} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-all flex items-center gap-1">
                    <Eye size={12} /> View
                  </button>
                  {rx.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(rx.id, "approved")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-all flex items-center gap-1">
                        <CheckCircle size={12} /> Approve
                      </button>
                      <button onClick={() => updateStatus(rx.id, "rejected")}
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-all flex items-center gap-1">
                        <XCircle size={12} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRx(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedRx.id}</h3>
                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold capitalize flex items-center gap-1 w-fit mt-1 ${statusBadge(selectedRx.status)}`}>
                  {statusIcon(selectedRx.status)} {selectedRx.status}
                </span>
              </div>
              <button onClick={() => setSelectedRx(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <XCircle size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold">
                  {selectedRx.patient.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{selectedRx.patient}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1"><Phone size={10} /> {selectedRx.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar size={10} /> Uploaded</p>
                  <p className="font-medium text-slate-700">{selectedRx.uploaded}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><MapPin size={10} /> Address</p>
                  <p className="font-medium text-slate-700 truncate">{selectedRx.address}</p>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="rounded-xl border border-slate-200 bg-slate-100 h-32 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={24} className="text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">Map: {selectedRx.address}</p>
                  <p className="text-[10px] text-slate-400">(Integrate Google Maps API here)</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Pill size={12} /> Prescribed Medicines</p>
                <div className="space-y-2">
                  {selectedRx.medicines.map((med, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{med.name}</p>
                        <p className="text-xs text-slate-400">Qty: {med.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-medium ${med.stock >= med.qty ? "text-emerald-600" : "text-red-600"}`}>
                          Stock: {med.stock}
                        </p>
                        <p className="text-[10px] text-slate-400">Exp: {med.expiry}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRx.status === "pending" && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { updateStatus(selectedRx.id, "approved"); setSelectedRx(null); }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all">Approve</button>
                  <button onClick={() => { updateStatus(selectedRx.id, "rejected"); setSelectedRx(null); }}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all">Reject</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
