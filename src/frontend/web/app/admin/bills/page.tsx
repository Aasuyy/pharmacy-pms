"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { Search, Receipt, Calendar, User, DollarSign } from "lucide-react";
import InvoiceModal from "@/components/InvoiceModal";

interface SavedBill {
  id: string;
  date: string;
  items: { name: string; qty: number; price: number; gst: number }[];
  subtotal: number;
  gst: number;
  discount: number;
  total: number;
  payment: string;
  patientId?: string;
  patientName?: string;
}

export default function AdminBills() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<SavedBill | null>(null);
  const [bills, loaded] = useLocalStorage<SavedBill[]>("pharma_bills_list", []);

  useEffect(() => {
    setMounted(true);
    if (!getAdminToken()) router.push("/admin/login");
  }, [router]);
  if (!mounted || !loaded) return null;

  const filtered = bills.filter(b =>
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    (b.patientName || "").toLowerCase().includes(search.toLowerCase())
  );

  const todayTotal = bills
    .filter(b => new Date(b.date).toDateString() === new Date().toDateString())
    .reduce((s, b) => s + b.total, 0);

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bills & Invoices</h1>
          <p className="text-slate-400 text-sm mt-0.5">{bills.length} total · Rs. {todayTotal.toFixed(2)} today</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search bills..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 transition-all" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Bill #</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Patient</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Items</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Total</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Payment</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/50 transition-all">
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{b.id}</td>
                <td className="px-6 py-4 text-xs text-slate-500">{new Date(b.date).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{b.patientName || "Walk-in"}</td>
                <td className="px-6 py-4 text-sm text-slate-600 text-right">{b.items.length}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">Rs. {b.total.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium capitalize ${
                    b.payment === "credit" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>{b.payment}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setSelectedBill(b); setInvoiceOpen(true); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-all">
                    <Receipt size={12} /> View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">No bills found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <InvoiceModal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} bill={selectedBill} />
    </div>
  );
}