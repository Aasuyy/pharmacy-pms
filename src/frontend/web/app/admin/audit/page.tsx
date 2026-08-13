"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { FileText, Search, Shield, User, CheckCircle, AlertTriangle, Clock, Filter } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  severity: "info" | "warning" | "critical" | "success";
  details: string;
}

export default function AdminAuditPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  const [logs, setLogs] = useState<AuditLog[]>([
    { id: "AUD-001", action: "User Login", user: "cypher_root", role: "Admin", timestamp: "2026-08-12 14:32:05", severity: "success", details: "Successful admin login from 192.168.1.64" },
    { id: "AUD-002", action: "Order Created", user: "Ram Sharma", role: "Customer", timestamp: "2026-08-12 14:15:22", severity: "info", details: "Order ORD-20260812-A7B3 created with 3 items" },
    { id: "AUD-003", action: "Prescription Upload", user: "Sita Gurung", role: "Customer", timestamp: "2026-08-12 13:48:11", severity: "info", details: "Prescription RX-20260812-002 uploaded for review" },
    { id: "AUD-004", action: "Failed Login", user: "unknown", role: "Guest", timestamp: "2026-08-12 12:22:45", severity: "warning", details: "Failed login attempt for username 'admin'" },
    { id: "AUD-005", action: "User Deleted", user: "cypher_root", role: "Admin", timestamp: "2026-08-12 10:05:18", severity: "critical", details: "User ID #3 permanently deleted from system" },
    { id: "AUD-006", action: "Settings Changed", user: "cypher_root", role: "Admin", timestamp: "2026-08-11 18:30:00", severity: "info", details: "System timezone changed to Asia/Kathmandu" },
    { id: "AUD-007", action: "Password Change", user: "pharma_staff", role: "Staff", timestamp: "2026-08-11 16:12:33", severity: "success", details: "Staff password updated successfully" },
    { id: "AUD-008", action: "Inventory Alert", user: "system", role: "System", timestamp: "2026-08-11 09:00:00", severity: "warning", details: "5 medicines below minimum stock threshold" },
  ]);

  useEffect(() => {
    setMounted(true);
    if (!getAdminToken()) router.push("/admin/login");
  }, [router]);

  if (!mounted) return null;

  const severityBadge = (severity: string) => {
    const map: Record<string, string> = {
      info: "bg-blue-50 text-blue-700 border-blue-200",
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      critical: "bg-red-50 text-red-700 border-red-200",
    };
    return map[severity] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const severityIcon = (severity: string) => {
    if (severity === "info") return <FileText size={14} className="text-blue-500" />;
    if (severity === "success") return <CheckCircle size={14} className="text-emerald-500" />;
    if (severity === "warning") return <AlertTriangle size={14} className="text-amber-500" />;
    return <Shield size={14} className="text-red-500" />;
  };

  const filtered = logs.filter(l => {
    const matchesSearch = l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase()) || l.details.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "all" || l.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-slate-400 text-sm mt-0.5">System activity and security event history</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs by action, user, or details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No audit logs found</td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-800">{log.action}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{log.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{log.user}</p>
                          <p className="text-xs text-slate-400">{log.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium capitalize flex items-center gap-1 w-fit ${severityBadge(log.severity)}`}>
                        {severityIcon(log.severity)} {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
