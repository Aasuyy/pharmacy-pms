"use client";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { ScrollText, Filter, Download, Search } from "lucide-react";
export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [q, setQ] = useState(""); const [filter, setFilter] = useState("all");
  useEffect(() => {
    adminApi("/admin/audit-logs").then(setLogs).catch(() => setLogs([
      { id: 1, timestamp: "2025-08-11 12:00:00", user: "admin", action: "Engine restart", target: "Risk Engine", severity: "info", ip: "192.168.1.10" },
      { id: 2, timestamp: "2025-08-11 11:45:00", user: "moderator_1", action: "User role changed", target: "analyst_3 → moderator", severity: "warning", ip: "192.168.1.15" },
      { id: 3, timestamp: "2025-08-11 11:30:00", user: "analyst_3", action: "Failed login attempt", target: "admin portal", severity: "critical", ip: "203.78.12.45" },
      { id: 4, timestamp: "2025-08-11 10:00:00", user: "admin", action: "System backup", target: "Full database", severity: "info", ip: "192.168.1.10" },
      { id: 5, timestamp: "2025-08-11 09:15:00", user: "shield_engine", action: "Threat blocked", target: "IP 185.22.11.4", severity: "critical", ip: "localhost" },
      { id: 6, timestamp: "2025-08-11 08:30:00", user: "mind_llm", action: "Anomaly detected", target: "Sales pattern", severity: "warning", ip: "localhost" },
    ]));
  }, []);
  const sevColor = (s: string) => s === "critical" ? "badge-red" : s === "warning" ? "badge-amber" : "badge-cyan";
  const filtered = logs.filter(l => (filter === "all" || l.severity === filter) && (l.user.toLowerCase().includes(q.toLowerCase()) || l.action.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Audit Logs</h1><p className="text-white/40 text-sm mt-1">Complete system activity trail</p></div>
        <button className="btn-secondary !w-auto !px-5 flex items-center gap-2"><Download size={16} /> Export CSV</button>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="glass-elevated rounded-2xl p-3 flex items-center gap-3 flex-1">
          <Search size={18} className="text-white/30" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search logs..." className="bg-transparent outline-none text-sm flex-1 text-white/80 placeholder:text-white/20" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-white/30" />
          {["all", "info", "warning", "critical"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all capitalize ${filter===f?'bg-[#a78bfa]/10 text-[#a78bfa]':'text-white/40 hover:bg-white/5'}`}>{f}</button>
          ))}
        </div>
      </div>
      <div className="glass-elevated rounded-2xl overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Target</th><th>Severity</th><th>IP Address</th></tr></thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id}>
                <td className="font-mono text-white/60 text-xs">{l.timestamp}</td>
                <td className="font-medium text-white/80">{l.user}</td>
                <td>{l.action}</td>
                <td className="text-white/50">{l.target}</td>
                <td><span className={`badge ${sevColor(l.severity)} capitalize`}>{l.severity}</span></td>
                <td className="font-mono text-white/40 text-xs">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
