"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStaffToken } from "@/lib/rbac";
import { FileText, Search, CheckCircle, Clock, Eye } from "lucide-react";

interface Rx { id: string; patient: string; doctor: string; medicines: string; status: "pending" | "dispensed"; time: string; }

export default function StaffPrescriptions() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [rxs, setRxs] = useState<Rx[]>([
    { id: "RX-001", patient: "Ram Sharma", doctor: "Dr. Poudel", medicines: "Paracetamol, Vitamin C", status: "pending", time: "10:30 AM" },
    { id: "RX-002", patient: "Sita Gurung", doctor: "Dr. Sharma", medicines: "Amoxicillin", status: "pending", time: "11:00 AM" },
    { id: "RX-003", patient: "Hari Prasad", doctor: "Dr. KC", medicines: "Metformin", status: "dispensed", time: "09:15 AM" },
  ]);

  useEffect(() => { setMounted(true); if (!getStaffToken()) router.push("/staff/login"); }, [router]);
  if (!mounted) return null;

  const dispense = (id: string) => setRxs(rxs.map(r => r.id === id ? { ...r, status: "dispensed" as const } : r));

  const filtered = rxs.filter(r => r.patient.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Prescription Queue</h1>
          <p className="text-slate-400 text-sm mt-0.5">Review and dispense medicines</p>
        </div>
      </div>
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search prescriptions..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
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
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold capitalize ${
                      rx.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>{rx.status}</span>
                  </div>
                  <p className="text-slate-800 text-sm font-medium">{rx.patient}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{rx.doctor} · {rx.medicines}</p>
                  <p className="text-slate-300 text-xs mt-1">{rx.time}</p>
                </div>
                {rx.status === "pending" && (
                  <button onClick={() => dispense(rx.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-all flex items-center gap-1">
                    <CheckCircle size={12} /> Dispense
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
