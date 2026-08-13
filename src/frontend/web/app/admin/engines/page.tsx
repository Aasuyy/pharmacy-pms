"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { Cpu, Power, AlertTriangle } from "lucide-react";

interface Engine {
  id: string;
  name: string;
  status: "running" | "stopped" | "error";
  uptime: string;
  lastScan: string;
  threatLevel: "low" | "medium" | "high";
  description: string;
}

export default function AdminEnginesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [engines, setEngines] = useState<Engine[]>([
    { id: "risk", name: "Risk Engine", status: "running", uptime: "14d 3h 22m", lastScan: "2 min ago", threatLevel: "low", description: "Real-time risk assessment and threat scoring" },
    { id: "hunter", name: "Hunter Engine", status: "running", uptime: "14d 3h 20m", lastScan: "5 min ago", threatLevel: "medium", description: "Autonomous threat hunting across network" },
    { id: "shield", name: "Shield Engine", status: "running", uptime: "14d 3h 25m", lastScan: "1 min ago", threatLevel: "low", description: "Active defense and intrusion prevention" },
    { id: "mind", name: "Mind LLM", status: "running", uptime: "14d 2h 45m", lastScan: "10 min ago", threatLevel: "low", description: "AI-powered analysis and incident correlation" },
  ]);

  useEffect(() => {
    setMounted(true);
    if (!getAdminToken()) router.push("/admin/login");
  }, [router]);

  if (!mounted) return null;

  const toggleEngine = (id: string) => {
    setEngines(engines.map(e => e.id === id ? { ...e, status: e.status === "running" ? "stopped" : "running" as "running" | "stopped" | "error" } : e));
  };

  const statusBadge = (status: string) => {
    if (status === "running") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "error") return "bg-red-50 text-red-700 border-red-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const threatBadge = (level: string) => {
    if (level === "high") return "bg-red-50 text-red-700 border-red-200";
    if (level === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Engine Control</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage autonomous security engines</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {engines.map((engine) => (
          <div key={engine.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Cpu size={18} className="text-blue-600" />
              </div>
              <button onClick={() => toggleEngine(engine.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${engine.status === "running" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                <Power size={12} className="inline mr-1" />
                {engine.status === "running" ? "Stop" : "Start"}
              </button>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{engine.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{engine.description}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status</span>
                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${statusBadge(engine.status)}`}>{engine.status}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Uptime</span>
                <span className="text-slate-700 font-medium">{engine.uptime}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Last Scan</span>
                <span className="text-slate-700 font-medium">{engine.lastScan}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Threat Level</span>
                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${threatBadge(engine.threatLevel)}`}>{engine.threatLevel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Engine Maintenance</p>
          <p className="text-xs text-amber-600/70 mt-1">Stopping engines will disable real-time protection. Use with caution in production environments.</p>
        </div>
      </div>
    </div>
  );
}
