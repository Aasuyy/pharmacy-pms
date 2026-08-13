"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  AlertTriangle, Calendar, Clock, Package,
  RotateCcw, Tag, TrendingDown
} from "lucide-react";

interface Batch {
  batchNo: string;
  qty: number;
  expiry: string;
  purchasePrice: number;
}

interface ExpiryItem {
  id: string;
  name: string;
  unit: string;
  supplier: string;
  batches: Batch[];
}

export default function AdminExpiry() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);

  const [items, setItems, itemsLoaded] = useLocalStorage<ExpiryItem[]>("pharma_expiry_items", [
    { id: "1", name: "Paracetamol 500mg", unit: "strips", supplier: "Cipla Nepal", batches: [
      { batchNo: "B-2026-A", qty: 20, expiry: "2026-08-18", purchasePrice: 2.5 },
      { batchNo: "B-2026-B", qty: 25, expiry: "2027-12-01", purchasePrice: 2.5 },
    ]},
    { id: "2", name: "Amoxicillin 500mg", unit: "strips", supplier: "Sun Pharma", batches: [
      { batchNo: "B-2026-C", qty: 12, expiry: "2026-09-10", purchasePrice: 12 },
    ]},
    { id: "3", name: "Vitamin C 1000mg", unit: "bottles", supplier: "Sanofi", batches: [
      { batchNo: "B-2026-D", qty: 28, expiry: "2026-08-20", purchasePrice: 28 },
    ]},
    { id: "4", name: "ORS Powder", unit: "sachets", supplier: "Local", batches: [
      { batchNo: "B-2026-F", qty: 100, expiry: "2026-08-10", purchasePrice: 3.5 },
    ]},
  ]);

  useEffect(() => {
    setMounted(true);
    if (!getAdminToken()) router.push("/admin/login");
  }, [router]);
  if (!mounted || !itemsLoaded) return null;

  const daysUntil = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    return Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatus = (days: number) => {
    if (days <= 0) return { label: "Expired", color: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle };
    if (days <= 7) return { label: "Critical", color: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle };
    if (days <= 30) return { label: "Warning", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock };
    if (days <= 90) return { label: "Caution", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Calendar };
    return { label: "OK", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Package };
  };

  const getMarkdown = (days: number) => {
    if (days <= 7 && days > 0) return 75;
    if (days <= 30 && days > 7) return 50;
    if (days <= 90 && days > 30) return 25;
    return 0;
  };

  const allBatches = items.flatMap(item =>
    item.batches.map(b => ({
      ...b, itemName: item.name, itemId: item.id, unit: item.unit, supplier: item.supplier, days: daysUntil(b.expiry)
    }))
  ).filter(b => b.days <= 90).sort((a, b) => a.days - b.days);

  const totalValueAtRisk = allBatches.reduce((sum, b) => sum + (b.qty * b.purchasePrice), 0);

  const returnToSupplier = (itemId: string, batchNo: string, supplier: string, qty: number) => {
    // Remove batch from items
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return { ...item, batches: item.batches.filter(b => b.batchNo !== batchNo) };
    }));

    const returns = JSON.parse(localStorage.getItem("pharma_returns") || "[]");
    returns.push({
      id: "RET-" + Date.now(),
      type: "expired",
      item: batchNo,
      qty: qty,
      reason: "Near expiry — returning to supplier",
      status: "pending",
      date: new Date().toISOString().split("T")[0],
      refund: 0,
      supplier,
    });
    localStorage.setItem("pharma_returns", JSON.stringify(returns));
    toast("Return logged and batch removed.", "success");
  };

  const applyMarkdown = (itemId: string, batchNo: string, markdown: number) => {
    // Update batch with markdown flag
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        batches: item.batches.map(b => b.batchNo === batchNo ? { ...b, markdown } : b)
      };
    }));
    toast(`Applied ${markdown}% markdown to ${batchNo}`, "success");
  };

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Expiry Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track batches, apply markdowns, prevent losses</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Value at Risk", value: `Rs. ${totalValueAtRisk.toFixed(2)}`, icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
          { label: "Critical (≤7 days)", value: `${allBatches.filter(b => b.days <= 7 && b.days > 0).length}`, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Expired", value: `${allBatches.filter(b => b.days <= 0).length}`, icon: AlertTriangle, color: "text-slate-600", bg: "bg-slate-50" },
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

      <div className="space-y-3">
        {allBatches.map((batch) => {
          const status = getStatus(batch.days);
          const markdown = getMarkdown(batch.days);
          const StatusIcon = status.icon;
          return (
            <div key={`${batch.itemId}-${batch.batchNo}`} className={`p-5 rounded-2xl border ${status.color.split(" ")[2]} ${status.color.split(" ")[0]}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                    <StatusIcon size={16} className={status.color.split(" ")[1]} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-slate-900">{batch.itemName}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${status.color}`}>{status.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">Batch: <strong>{batch.batchNo}</strong> · Qty: <strong>{batch.qty} {batch.unit}</strong> · Supplier: {batch.supplier}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Expires: <strong>{batch.expiry}</strong> ({batch.days <= 0 ? "EXPIRED" : `${batch.days} days`})</p>
                    {markdown > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Tag size={12} className="text-red-500" />
                        <span className="text-xs font-bold text-red-600">Auto-markdown: {markdown}% off</span>
                        <span className="text-xs text-slate-400">(Recover Rs. {((batch.qty * batch.purchasePrice * (100 - markdown)) / 100).toFixed(2)})</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {markdown > 0 && (
                    <button onClick={() => applyMarkdown(batch.itemId, batch.batchNo, markdown)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-all">
                      Mark {markdown}%
                    </button>
                  )}
                  <button onClick={() => returnToSupplier(batch.itemId, batch.batchNo, batch.supplier, batch.qty)} className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-all flex items-center gap-1">
                    <RotateCcw size={12} /> Return
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {allBatches.length === 0 && <div className="text-center py-12 text-slate-400">No batches expiring within 90 days</div>}
      </div>
    </div>
  );
}