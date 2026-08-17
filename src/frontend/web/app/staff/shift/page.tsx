"use client";
import { useEffect, useState } from "react";
import { Clock, Play, Square } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com";

export default function ShiftPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [staffId, setStaffId] = useState("1");
  const [loading, setLoading] = useState(false);

  const loadShifts = () => {
    fetch(`${API_URL}/staff/shifts`)
      .then(r => r.json())
      .then(data => setShifts(Array.isArray(data) ? data : []))
      .catch(() => setShifts([]));
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const clockIn = async () => {
    setLoading(true);
    await fetch(`${API_URL}/staff/shifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staff_id: Number(staffId),
        start_time: new Date().toISOString(),
        status: "active"
      })
    });
    loadShifts();
    setLoading(false);
  };

  const clockOut = async (shiftId: number) => {
    setLoading(true);
    // Note: backend doesn't have PUT yet, so we add a new endpoint or handle via POST
    // For now, just refresh
    loadShifts();
    setLoading(false);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Shift Management</h1>
      
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Staff ID</label>
            <input
              type="number"
              value={staffId}
              onChange={e => setStaffId(e.target.value)}
              className="w-32 px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>
          <button
            onClick={clockIn}
            disabled={loading}
            className="mt-5 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Play size={16} />
            Clock In
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-700">ID</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Staff</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Start</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">End</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {shifts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No shifts recorded yet
                </td>
              </tr>
            ) : (
              shifts.map((s: any) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">{s.id}</td>
                  <td className="px-4 py-3">{s.staff_name || s.staff_id}</td>
                  <td className="px-4 py-3">{s.start_time ? new Date(s.start_time).toLocaleString() : "-"}</td>
                  <td className="px-4 py-3">{s.end_time ? new Date(s.end_time).toLocaleString() : "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      s.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
