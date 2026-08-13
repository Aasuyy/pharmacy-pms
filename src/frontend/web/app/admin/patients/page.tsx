"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { Users, Search, Phone, Calendar, FileText } from "lucide-react";

interface Patient { id: string; name: string; phone: string; age: number; lastVisit: string; history: string; prescriptions: number; }

export default function AdminPatients() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [patients] = useState<Patient[]>([
    { id: "P-001", name: "Ram Sharma", phone: "+977-9800000001", age: 34, lastVisit: "2026-08-10", history: "Hypertension, Diabetes", prescriptions: 5 },
    { id: "P-002", name: "Sita Gurung", phone: "+977-9800000002", age: 28, lastVisit: "2026-08-12", history: "Allergic rhinitis", prescriptions: 2 },
    { id: "P-003", name: "Hari Prasad", phone: "+977-9800000003", age: 45, lastVisit: "2026-08-11", history: "Type 2 Diabetes", prescriptions: 8 },
    { id: "P-004", name: "Anjali Rai", phone: "+977-9800000004", age: 22, lastVisit: "2026-07-28", history: "None", prescriptions: 1 },
  ]);

  useEffect(() => { setMounted(true); if (!getAdminToken()) router.push("/admin/login"); }, [router]);
  if (!mounted) return null;

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Patient Records</h1>
        <p className="text-slate-400 text-sm mt-0.5">Medical history and visit tracking</p>
      </div>
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No patients found</div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-all">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                {p.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-slate-800">{p.name}</span>
                  <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-md bg-slate-100">{p.id}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><Phone size={10} /> {p.phone}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} /> Age {p.age}</span>
                  <span className="flex items-center gap-1"><FileText size={10} /> {p.prescriptions} Rx</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">History: {p.history}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400">Last visit</p>
                <p className="text-xs font-medium text-slate-700">{p.lastVisit}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
