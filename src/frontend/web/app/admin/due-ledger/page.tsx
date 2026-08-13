"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { useToast } from "@/components/Toast";
import {
  Search, User, DollarSign, Clock, AlertTriangle,
  CheckCircle, ArrowDownCircle
} from "lucide-react";

interface LedgerEntry {
  id: string;
  patientId: string;
  patientName: string;
  billId: string;
  amount: number;
  paid: number;
  type: "credit" | "payment";
  date: string;
  status: "pending" | "partial" | "cleared";
}

interface PatientSummary {
  patientId: string;
  patientName: string;
  totalDue: number;
  totalPaid: number;
  balance: number;
  lastTransaction: string;
  overdue: boolean;
}

export default function AdminDueLedger() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const [entries, setEntries] = useState<LedgerEntry[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("pharma_credit_ledger");
    if (saved) return JSON.parse(saved);
    return [
      { id: "TXN-001", patientId: "P-001", patientName: "Ram Bahadur", billId: "BILL-OLD-1", amount: 1250, paid: 0, type: "credit", date: "2026-07-15T10:00:00Z", status: "pending" },
      { id: "TXN-002", patientId: "P-003", patientName: "Gopal Thapa", billId: "BILL-OLD-2", amount: 800, paid: 200, type: "credit", date: "2026-08-01T14:30:00Z", status: "partial" },
    ];
  });

  useEffect(() => {
    setMounted(true);
    if (!getAdminToken()) router.push("/admin/login");
  }, [router]);
  if (!mounted) return null;

  const saveEntries = (newEntries: LedgerEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("pharma_credit_ledger", JSON.stringify(newEntries));
  };

  const patientSummaries: PatientSummary[] = Object.values(
    entries.reduce((acc: Record<string, PatientSummary>, e) => {
      if (!acc[e.patientId]) {
        acc[e.patientId] = {
          patientId: e.patientId,
          patientName: e.patientName,
          totalDue: 0,
          totalPaid: 0,
          balance: 0,
          lastTransaction: e.date,
          overdue: false,
        };
      }
      const s = acc[e.patientId];
      if (e.type === "credit") {
        s.totalDue += e.amount;
        s.balance += e.amount - e.paid;
      } else if (e.type === "payment") {
        s.totalPaid += e.amount;
        s.balance -= e.amount;
      }
      if (new Date(e.date) > new Date(s.lastTransaction)) {
        s.lastTransaction = e.date;
      }
      // Overdue if any credit entry > 30 days and balance > 0
      const daysSince = Math.floor((Date.now() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24));
      if (e.type === "credit" && daysSince > 30 && s.balance > 0) {
        s.overdue = true;
      }
      return acc;
    }, {})
  );

  const filtered = patientSummaries.filter(
    (p) =>
      p.patientName.toLowerCase().includes(search.toLowerCase()) ||
      p.patientId.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = patientSummaries.reduce((s, p) => s + p.balance, 0);
  const overdueCount = patientSummaries.filter((p) => p.overdue).length;

  const openPayment = (entry: LedgerEntry) => {
    setSelectedEntry(entry);
    setPaymentAmount((entry.amount - entry.paid).toString());
    setShowPaymentModal(true);
  };

  const recordPayment = () => {
    if (!selectedEntry) return;
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      toast("Enter valid amount", "error");
      return;
    }
    const remaining = selectedEntry.amount - selectedEntry.paid;
    if (amount > remaining) {
      toast(`Max payable is Rs. ${remaining}`, "error");
      return;
    }

    const updated = entries.map((e) =>
      e.id === selectedEntry.id
        ? {
            ...e,
            paid: e.paid + amount,
            status: e.paid + amount >= e.amount ? ("cleared" as const) : ("partial" as const),
          }
        : e
    );

    // Add payment record
    updated.push({
      id: "TXN-" + Date.now(),
      patientId: selectedEntry.patientId,
      patientName: selectedEntry.patientName,
      billId: selectedEntry.billId,
      amount: amount,
      paid: 0,
      type: "payment",
      date: new Date().toISOString(),
      status: "cleared",
    });

    saveEntries(updated);
    setShowPaymentModal(false);
    setSelectedEntry(null);
    setPaymentAmount("");
    toast("Payment recorded", "success");
  };

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Due Ledger</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Patient credit balances and collections
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Outstanding",
            value: `Rs. ${totalOutstanding.toFixed(2)}`,
            icon: DollarSign,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Overdue Accounts",
            value: `${overdueCount}`,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            label: "Active Credit Patients",
            value: `${patientSummaries.length}`,
            icon: User,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}
            >
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Patient
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Total Due
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Paid
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Balance
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Status
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((p) => (
              <tr key={p.patientId} className="hover:bg-slate-50/50 transition-all">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                      {p.patientName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {p.patientName}
                      </p>
                      <p className="text-xs text-slate-400">{p.patientId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800 text-right">
                  Rs. {p.totalDue.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-emerald-600 text-right">
                  Rs. {p.totalPaid.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                  Rs. {p.balance.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  {p.overdue ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium bg-red-50 text-red-700 border-red-200">
                      <AlertTriangle size={12} /> Overdue
                    </span>
                  ) : p.balance === 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle size={12} /> Cleared
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium bg-amber-50 text-amber-700 border-amber-200">
                      <Clock size={12} /> Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {p.balance > 0 && (
                    <button
                      onClick={() => {
                        const entry = entries.find(
                          (e) =>
                            e.patientId === p.patientId &&
                            e.type === "credit" &&
                            e.status !== "cleared"
                        );
                        if (entry) openPayment(entry);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-all"
                    >
                      <ArrowDownCircle size={12} /> Collect
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  No credit records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900">
              Record Payment
            </h3>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                Patient: <strong>{selectedEntry.patientName}</strong>
              </p>
              <p className="text-sm text-slate-600">
                Bill: <strong>{selectedEntry.billId}</strong>
              </p>
              <p className="text-sm text-slate-600">
                Total: Rs. {selectedEntry.amount.toFixed(2)}
              </p>
              <p className="text-sm text-slate-600">
                Paid so far: Rs. {selectedEntry.paid.toFixed(2)}
              </p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                Remaining: Rs. {(selectedEntry.amount - selectedEntry.paid).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Payment Amount
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all"
                placeholder="Enter amount"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={recordPayment}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}