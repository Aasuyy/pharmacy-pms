"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStaffToken } from "@/lib/rbac";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useToast } from "@/components/Toast";
import { Clock, LogIn, LogOut, Calendar, User } from "lucide-react";

interface ShiftRecord {
  id: string;
  staffName: string;
  clockIn: string;
  clockOut?: string;
  notes: string;
  duration?: number; // minutes
}

export default function StaffShift() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [shifts, setShifts, loaded] = useLocalStorage<ShiftRecord[]>("pharma_shifts", []);
  const [notes, setNotes] = useState("");
  const [activeShift, setActiveShift] = useState<ShiftRecord | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!getStaffToken()) router.push("/staff/login");
    // Check for active shift
    const active = shifts.find(s => !s.clockOut);
    if (active) setActiveShift(active);
  }, [router, shifts]);

  if (!mounted || !loaded) return null;

  const clockIn = () => {
    if (activeShift) { toast("Already clocked in", "error"); return; }
    const shift: ShiftRecord = {
      id: "SHIFT-" + Date.now(),
      staffName: "Staff User",
      clockIn: new Date().toISOString(),
      notes,
    };
    setShifts(prev => [shift, ...prev]);
    setActiveShift(shift);
    setNotes("");
    toast("Clocked in successfully", "success");
  };

  const clockOut = () => {
    if (!activeShift) { toast("Not clocked in", "error"); return; }
    const now = new Date();
    const start = new Date(activeShift.clockIn);
    const duration = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));

    setShifts(prev => prev.map(s =>
      s.id === activeShift.id ? { ...s, clockOut: now.toISOString(), duration } : s
    ));
    setActiveShift(null);
    toast(`Clocked out. Duration: ${Math.floor(duration / 60)}h ${duration % 60}m`, "success");
  };

  const formatDuration = (mins?: number) => {
    if (!mins) return "-";
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div>
        <h1 className="text-xl font-bold text-slate-900">Shift Management</h1>
        <p className="text-slate-400 text-sm mt-0.5">Clock in/out and view shift history</p>
      </div>

      {/* Clock Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeShift ? "bg-emerald-50" : "bg-slate-50"}`}>
            <Clock size={20} className={activeShift ? "text-emerald-600" : "text-slate-400"} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{activeShift ? "On Duty" : "Off Duty"}</p>
            <p className="text-xs text-slate-400">{activeShift ? `Since ${new Date(activeShift.clockIn).toLocaleTimeString()}` : "Not clocked in"}</p>
          </div>
        </div>

        {!activeShift && (
          <div className="space-y-3">
            <textarea placeholder="Shift notes (optional)..." value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 resize-none h-20" />
            <button onClick={clockIn} className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
              <LogIn size={16} /> Clock In
            </button>
          </div>
        )}

        {activeShift && (
          <button onClick={clockOut} className="w-full py-3 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2">
            <LogOut size={16} /> Clock Out
          </button>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Clock In</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Clock Out</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Duration</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {shifts.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 text-sm text-slate-600">{new Date(s.clockIn).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{new Date(s.clockIn).toLocaleTimeString()}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{s.clockOut ? new Date(s.clockOut).toLocaleTimeString() : <span className="text-emerald-600 font-medium">Active</span>}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">{formatDuration(s.duration)}</td>
                <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate">{s.notes || "-"}</td>
              </tr>
            ))}
            {shifts.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No shift records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}