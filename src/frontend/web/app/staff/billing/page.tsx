"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStaffToken } from "@/lib/rbac";
import { useToast } from "@/components/Toast";
import { CreditCard, Plus, Trash2, Search, Printer } from "lucide-react";

interface BillItem { name: string; qty: number; price: number; }

export default function StaffBilling() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState("");
  const [items, setItems] = useState<BillItem[]>([{ name: "", qty: 1, price: 0 }]);
  const [search, setSearch] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const quickProducts = [
    { name: "Paracetamol 500mg", price: 15 },
    { name: "Amoxicillin 500mg", price: 45 },
    { name: "Vitamin C 1000mg", price: 35 },
    { name: "ORS Powder", price: 30 },
    { name: "Cetirizine 10mg", price: 25 },
    { name: "Ibuprofen 400mg", price: 20 },
  ];

  useEffect(() => { setMounted(true); if (!getStaffToken()) router.push("/staff/login"); }, [router]);
  if (!mounted) return null;

  const addItem = (name: string, price: number) => setItems([...items, { name, qty: 1, price }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof BillItem, val: string | number) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    setItems(next);
  };
  const total = items.reduce((sum, it) => sum + (it.qty * it.price), 0);

  const handlePrint = () => {
    if (!customer.trim()) { toast("Enter customer name", "error"); return; }
    if (items.length === 0 || items.every(i => !i.name)) { toast("Add at least one item", "error"); return; }
    toast("Bill printed successfully", "success");
    setItems([{ name: "", qty: 1, price: 0 }]);
    setCustomer("");
  };

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Billing Counter</h1>
          <p className="text-slate-400 text-sm mt-0.5">Quick checkout and invoice generation</p>
        </div>
        <button onClick={() => setShowHistory(!showHistory)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-all">
          {showHistory ? "New Bill" : "History"}
        </button>
      </div>

      {!showHistory ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <input type="text" placeholder="Customer name..." value={customer} onChange={e => setCustomer(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800 text-sm">Items</h2>
                <button onClick={() => setItems([...items, { name: "", qty: 1, price: 0 }])} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all">
                  <Plus size={16} />
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {items.map((item, i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <input type="text" placeholder="Medicine name" value={item.name} onChange={e => updateItem(i, "name", e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-500 transition-all" />
                    <input type="number" min={1} value={item.qty} onChange={e => updateItem(i, "qty", parseInt(e.target.value) || 0)}
                      className="w-16 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-center focus:outline-none focus:border-emerald-500 transition-all" />
                    <input type="number" min={0} value={item.price} onChange={e => updateItem(i, "price", parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-500 transition-all" />
                    <button onClick={() => removeItem(i)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handlePrint}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
              <Printer size={16} /> Print Bill · Rs. {total}
            </button>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Add</h3>
              {quickProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((p) => (
                <button key={p.name} onClick={() => addItem(p.name, p.price)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all text-left border border-transparent hover:border-slate-100">
                  <span className="text-sm text-slate-700">{p.name}</span>
                  <span className="text-xs font-medium text-emerald-600">Rs. {p.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Today Bills</h2>
          <div className="space-y-3">
            {[
              { id: "BILL-089", customer: "Sita Gurung", total: 450, time: "11:30 AM" },
              { id: "BILL-088", customer: "Ram Sharma", total: 1250, time: "10:45 AM" },
              { id: "BILL-087", customer: "Hari Prasad", total: 2800, time: "09:20 AM" },
            ].map(b => (
              <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-800">{b.id}</p>
                  <p className="text-xs text-slate-400">{b.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">Rs. {b.total}</p>
                  <p className="text-[10px] text-slate-400">{b.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
