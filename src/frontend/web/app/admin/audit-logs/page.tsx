"use client";

import { useState, useEffect } from "react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLogs([]);
    setLoading(false);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Audit Logs</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-500">
        No audit activity recorded.
      </div>
    </div>
  );
}
