"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStaffToken } from "@/lib/rbac";
import { useToast } from "@/components/Toast";
import { ClipboardList, DollarSign, TrendingUp, Printer, Save } from "lucide-react";

export default function StaffShift() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [shift, setShift] = useState({
    date: new Date().toISOString().split("T")[0],
    staffName: "Ramesh Sharma",
    openingCash: 5000,
    closingCash: 8750,
    sales: 4250,
    refunds: 100,
    expenses: 400,
    rxFilled: 45,
    rxPending: 3,
    stockIssues: 2,
    notes: "",
  });

  useEffect(() => { setMounted(true); if (!getStaffToken()) router.push("/staff/login"); }, [router]);
  if (!mounted) return null;

  const discrepancy = shift.closingCash - (shift.openingCash + shift.sales - shift.refunds - shift.expenses);

  const saveReport = () => {
    localStorage.setItem("pharma_shift_report_" + shift.date, JSON.stringify(shift));
    toast("Shift report saved", "success");
  };

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Shift Handover</h1>
          <p className="text-slate-400 text-sm mt-0.5">Daily cash + stock closing report</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => toast("Report printed", "success")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all">
            <Printer size={16} /> Print
          </button>
          <button onClick={saveReport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Save size={16} /> Save Report
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Opening Cash", value: `Rs. ${shift.openingCash}`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Sales", value: `Rs. ${shift.sales}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Closing Cash", value: `Rs. ${shift.closingCash}`, icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Discrepancy", value: `Rs. ${discrepancy}`, icon: ClipboardList, color: discrepancy === 0 ? "text-emerald-600" : "text-red-600", bg: discrepancy === 0 ? "bg-emerald-50" : "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Cash Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: "Opening Cash", key: "openingCash" },
              { label: "Total Sales", key: "sales" },
              { label: "Refunds Issued", key: "refunds" },
              { label: "Misc Expenses", key: "expenses" },
              { label: "Closing Cash", key: "closingCash" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{item.label}</span>
                <input type="number" value={shift[item.key as keyof typeof shift] as number} onChange={e => setShift({...shift, [item.key]: Number(e.target.value)})}
                  className="w-32 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-right focus:outline-none focus:border-blue-500 transition-all" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Activity Summary</h2>
          <div className="space-y-3">
            {[
              { label: "Prescriptions Filled", key: "rxFilled" },
              { label: "Pending Prescriptions", key: "rxPending" },
              { label: "Stock Issues Noted", key: "stockIssues" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{item.label}</span>
                <input type="number" value={shift[item.key as keyof typeof shift] as number} onChange={e => setShift({...shift, [item.key]: Number(e.target.value)})}
                  className="w-32 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-right focus:outline-none focus:border-blue-500 transition-all" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Handover Notes</label>
            <textarea value={shift.notes} onChange={e => setShift({...shift, notes: e.target.value})} rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all resize-none"
              placeholder="Any issues, reminders, or notes for next shift..." />
          </div>
        </div>
      </div>
    </div>
  );
}