"use client";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getLogs()
      .then((data) => setLogs(Array.isArray(data) ? data : data.logs || []))
      .catch((err) => console.error("Failed to load audit logs:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading audit logs...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Audit Logs</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3">Timestamp</th>
              <th className="p-3">Action</th>
              <th className="p-3">User</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No logs recorded.
                </td>
              </tr>
            ) : (
              logs.map((log: any, idx: number) => (
                <tr key={log.id || idx} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm">{log.timestamp || log.created_at || "N/A"}</td>
                  <td className="p-3 text-sm font-medium">{log.action || "N/A"}</td>
                  <td className="p-3 text-sm">{log.user || log.username || "System"}</td>
                  <td className="p-3 text-sm text-gray-600">{JSON.stringify(log.details || log.metadata || {})}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
