"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStaffToken } from "@/lib/rbac";
import { useToast } from "@/components/Toast";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  Search, Plus, Minus, Trash2, Printer, Save, ShoppingCart,
  CreditCard, Banknote, Smartphone, Percent, User, Clock,
  AlertTriangle, Pill, History, ShieldAlert, Repeat, X
} from "lucide-react";
import InvoiceModal from "@/components/InvoiceModal";

interface Medicine {
  id: string;
  name: string;
  price: number;
  stock: number;
  gst: number;
  reorderLevel: number;
}

interface CartItem extends Medicine {
  qty: number;
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  creditLimit: number;
  balance: number;
  allergies: string[];
  activeMeds: string[];
}

interface PurchaseRecord {
  id: string;
  date: string;
  items: string[];
  total: number;
}

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

const MED_DB: Medicine[] = [
  { id: "m1", name: "Paracetamol 500mg", price: 3, stock: 45, gst: 12, reorderLevel: 20 },
  { id: "m2", name: "Amoxicillin 500mg", price: 15, stock: 12, gst: 12, reorderLevel: 15 },
  { id: "m3", name: "Vitamin C 1000mg", price: 35, stock: 28, gst: 5, reorderLevel: 10 },
  { id: "m4", name: "Cetirizine 10mg", price: 8, stock: 60, gst: 5, reorderLevel: 25 },
  { id: "m5", name: "ORS Powder", price: 5, stock: 100, gst: 0, reorderLevel: 30 },
  { id: "m6", name: "Ibuprofen 400mg", price: 6, stock: 30, gst: 12, reorderLevel: 15 },
  { id: "m7", name: "Omeprazole 20mg", price: 12, stock: 8, gst: 12, reorderLevel: 10 },
];

const DEFAULT_PATIENTS: Patient[] = [
  { id: "P-001", name: "Ram Bahadur", phone: "98XXXXXXXX", creditLimit: 5000, balance: 1250, allergies: ["Penicillin", "Sulfa"], activeMeds: ["Metformin 500mg", "Amlodipine 5mg"] },
  { id: "P-002", name: "Sita Kumari", phone: "97XXXXXXXX", creditLimit: 3000, balance: 0, allergies: [], activeMeds: ["Amlodipine 5mg"] },
  { id: "P-003", name: "Gopal Thapa", phone: "96XXXXXXXX", creditLimit: 2000, balance: 800, allergies: ["Aspirin"], activeMeds: ["Warfarin 5mg"] },
];

const DEFAULT_HISTORY: Record<string, PurchaseRecord[]> = {
  "P-001": [
    { id: "BILL-OLD-1", date: "2026-08-10", items: ["Paracetamol 500mg", "Vitamin C 1000mg"], total: 380 },
    { id: "BILL-OLD-2", date: "2026-07-28", items: ["Amoxicillin 500mg"], total: 150 },
  ],
  "P-002": [
    { id: "BILL-OLD-4", date: "2026-08-05", items: ["Cetirizine 10mg"], total: 80 },
  ],
  "P-003": [
    { id: "BILL-OLD-5", date: "2026-08-01", items: ["Warfarin 5mg", "Vitamin C 1000mg"], total: 385 },
  ],
};

export default function StaffPOS() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);

  const [patients, setPatients, patientsLoaded] = useLocalStorage<Patient[]>("pharma_patients_db", DEFAULT_PATIENTS);
  const [purchaseHistory, setPurchaseHistory] = useLocalStorage<Record<string, PurchaseRecord[]>>("pharma_purchase_history", DEFAULT_HISTORY);
  const [savedBills, setSavedBills] = useLocalStorage<SavedBill[]>("pharma_bills_list", []);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<"cash" | "card" | "upi" | "credit">("cash");
  const [barcode, setBarcode] = useState("");
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [lastBill, setLastBill] = useState<any>(null);

  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", phone: "", creditLimit: 5000, allergies: "", activeMeds: "" });

  useEffect(() => { setMounted(true); if (!getStaffToken()) router.push("/staff/login"); }, [router]);
  if (!mounted || !patientsLoaded) return null;

  const filtered = MED_DB.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.phone.includes(patientSearch)
  );

  const history = selectedPatient ? (purchaseHistory[selectedPatient.id] || []) : [];

  const getMedicineBaseName = (name: string) => name.split(" ")[0].toLowerCase();

  const checkDuplicate = (med: Medicine) => {
    if (!selectedPatient) return null;
    const base = getMedicineBaseName(med.name);
    const recent = history.find(h => {
      const daysAgo = Math.floor((Date.now() - new Date(h.date).getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo <= 14 && h.items.some(i => getMedicineBaseName(i) === base);
    });
    if (recent) {
      const daysAgo = Math.floor((Date.now() - new Date(recent.date).getTime()) / (1000 * 60 * 60 * 24));
      return `Patient bought ${med.name.split(" ")[0]} ${daysAgo} days ago`;
    }
    return null;
  };

  const checkAllergy = (med: Medicine) => {
    if (!selectedPatient) return null;
    const base = getMedicineBaseName(med.name);
    for (const allergy of selectedPatient.allergies) {
      if (base.includes(allergy.toLowerCase()) || med.name.toLowerCase().includes(allergy.toLowerCase())) {
        return `ALLERGY: Patient is allergic to ${allergy}`;
      }
    }
    return null;
  };

  const checkInteraction = (med: Medicine) => {
    if (!selectedPatient) return null;
    const base = getMedicineBaseName(med.name);
    const warfarin = selectedPatient.activeMeds.some(m => m.toLowerCase().includes("warfarin"));
    if (warfarin && (base.includes("aspirin") || base.includes("ibuprofen"))) {
      return `INTERACTION: ${med.name.split(" ")[0]} + Warfarin = bleeding risk`;
    }
    return null;
  };

  const addToCart = (med: Medicine) => {
    const allergy = checkAllergy(med);
    if (allergy) { toast(allergy, "error"); return; }
    const interaction = checkInteraction(med);
    if (interaction) { toast(interaction, "error"); return; }
    const dup = checkDuplicate(med);
    if (dup) toast(dup, "warning");

    setCart((prev) => {
      const existing = prev.find((c) => c.id === med.id);
      if (existing) {
        if (existing.qty >= med.stock) { toast("Insufficient stock", "error"); return prev; }
        return prev.map((c) => c.id === med.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...med, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const newQty = c.qty + delta;
      if (newQty < 1) return c;
      if (newQty > c.stock) { toast("Max stock reached", "error"); return c; }
      return { ...c, qty: newQty };
    }));
  };

  const remove = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const gstAmount = cart.reduce((sum, c) => sum + (c.price * c.qty * c.gst) / 100, 0);
  const discountAmount = (subtotal + gstAmount) * (discount / 100);
  const total = subtotal + gstAmount - discountAmount;

  const buildBill = (): SavedBill => ({
    id: "BILL-" + Date.now(),
    date: new Date().toISOString(),
    items: cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price, gst: c.gst })),
    subtotal, gst: gstAmount, discount: discountAmount, total, payment,
    patientId: selectedPatient?.id, patientName: selectedPatient?.name,
  });

  const handleBarcode = (e: React.FormEvent) => {
    e.preventDefault();
    const med = MED_DB.find((m) => m.id === barcode || m.name.toLowerCase() === barcode.toLowerCase());
    if (med) { addToCart(med); setBarcode(""); } else { toast("Medicine not found", "error"); }
  };

  const saveBill = () => {
    if (cart.length === 0) { toast("Cart is empty", "error"); return; }
    if (payment === "credit" && !selectedPatient) { toast("Select a patient for credit sale", "error"); return; }

    const bill = buildBill();

    if (payment === "credit" && selectedPatient) {
      const newBalance = selectedPatient.balance + total;
      if (newBalance > selectedPatient.creditLimit) {
        toast(`Credit limit exceeded. Limit: Rs. ${selectedPatient.creditLimit}`, "error");
        return;
      }
      setPatients(prev => prev.map(p => p.id === selectedPatient.id ? { ...p, balance: newBalance } : p));
      const ledger = JSON.parse(localStorage.getItem("pharma_credit_ledger") || "[]");
      ledger.push({
        id: "TXN-" + Date.now(), patientId: selectedPatient.id, patientName: selectedPatient.name,
        billId: bill.id, amount: total, type: "credit", date: new Date().toISOString(), paid: 0,
      });
      localStorage.setItem("pharma_credit_ledger", JSON.stringify(ledger));
    }

    // Save to bills list
    setSavedBills(prev => [bill, ...prev]);

    // Update purchase history
    if (selectedPatient) {
      setPurchaseHistory(prev => ({
        ...prev,
        [selectedPatient.id]: [
          { id: bill.id, date: bill.date, items: bill.items.map(i => i.name), total: bill.total },
          ...(prev[selectedPatient.id] || [])
        ]
      }));
    }

    toast(`Bill ${bill.id} saved. Total: Rs. ${total.toFixed(2)}`, "success");
    setCart([]); setDiscount(0); setPayment("cash"); setSelectedPatient(null); setPatientSearch("");
  };

  const openInvoice = () => {
    if (cart.length === 0) { toast("Cart is empty", "error"); return; }
    setLastBill(buildBill());
    setInvoiceOpen(true);
  };

  const addNewPatient = () => {
    if (!newPatient.name || !newPatient.phone) { toast("Name and phone required", "error"); return; }
    const id = "P-" + Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    const patient: Patient = {
      id, name: newPatient.name, phone: newPatient.phone,
      creditLimit: Number(newPatient.creditLimit), balance: 0,
      allergies: newPatient.allergies.split(",").map(s => s.trim()).filter(Boolean),
      activeMeds: newPatient.activeMeds.split(",").map(s => s.trim()).filter(Boolean),
    };
    setPatients(prev => [...prev, patient]);
    setPurchaseHistory(prev => ({ ...prev, [id]: [] }));
    setSelectedPatient(patient);
    setShowAddPatient(false);
    setNewPatient({ name: "", phone: "", creditLimit: 5000, allergies: "", activeMeds: "" });
    toast(`Patient ${patient.name} added`, "success");
  };

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quick POS</h1>
          <p className="text-slate-400 text-sm mt-0.5">Patient-aware dispensing · {savedBills.length} bills today</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openInvoice} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all">
            <Printer size={16} /> Preview
          </button>
          <button onClick={saveBill} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Save size={16} /> Save Bill
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Medicines */}
        <div className="lg:col-span-5 space-y-4">
          {/* Patient Selector */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={16} className="text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-800">{selectedPatient ? "Patient" : "Select Patient"}</h2>
              </div>
              {!selectedPatient && (
                <button onClick={() => setShowAddPatient(true)} className="text-xs text-blue-600 font-medium hover:underline">+ New</button>
              )}
            </div>

            {selectedPatient ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div>
                  <p className="text-sm font-medium text-slate-800">{selectedPatient.name}</p>
                  <p className="text-xs text-slate-500">{selectedPatient.phone} · Balance: Rs. {selectedPatient.balance.toFixed(2)} · Limit: Rs. {selectedPatient.creditLimit}</p>
                </div>
                <button onClick={() => { setSelectedPatient(null); setPayment("cash"); }} className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
              </div>
            ) : (
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search patient by name or phone..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
                {patientSearch && (
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {filteredPatients.map((p) => (
                      <button key={p.id} onClick={() => { setSelectedPatient(p); setPatientSearch(""); }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-between">
                        <div><p className="text-sm font-medium text-slate-800">{p.name}</p><p className="text-xs text-slate-400">{p.phone}</p></div>
                        <span className="text-xs text-slate-500">Due: Rs. {p.balance}</span>
                      </button>
                    ))}
                    {filteredPatients.length === 0 && <p className="text-xs text-slate-400 py-1">No patients found</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleBarcode} className="flex gap-2">
            <input type="text" placeholder="Scan barcode or type medicine name..." value={barcode} onChange={(e) => setBarcode(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 transition-all" />
            <button type="submit" className="px-4 py-3 rounded-2xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all"><Plus size={18} /></button>
          </form>

          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 transition-all" />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filtered.map((med) => {
              const dup = selectedPatient ? checkDuplicate(med) : null;
              const allergy = selectedPatient ? checkAllergy(med) : null;
              const interaction = selectedPatient ? checkInteraction(med) : null;
              return (
                <button key={med.id} onClick={() => addToCart(med)}
                  className={`w-full text-left p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all group relative ${med.stock <= med.reorderLevel ? "border-red-200 bg-red-50/30" : "border-slate-100 bg-white hover:border-blue-200"}`}>
                  {(dup || allergy || interaction) && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-sm"><ShieldAlert size={12} className="text-white" /></div>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{med.name}</p>
                    <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-200">GST {med.gst}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">Rs. {med.price}</p>
                    <p className={`text-xs font-medium ${med.stock <= med.reorderLevel ? "text-red-600" : "text-slate-400"}`}>{med.stock <= med.reorderLevel ? "LOW STOCK: " : "Stock: "}{med.stock}</p>
                  </div>
                  {dup && <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1"><Repeat size={10} /> {dup}</p>}
                  {allergy && <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1"><AlertTriangle size={10} /> {allergy}</p>}
                  {interaction && <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1"><AlertTriangle size={10} /> {interaction}</p>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle: Cart */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-800">Cart ({cart.length})</h2>
            </div>
            {cart.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">Tap a medicine to add</p>}
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800">{item.name}</p>
                    <button onClick={() => remove(item.id)} className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={12} /></button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"><Minus size={12} /></button>
                      <span className="text-sm font-medium text-slate-800 w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"><Plus size={12} /></button>
                    </div>
                    <p className="text-sm font-bold text-slate-800">Rs. {(item.price * item.qty).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="text-slate-800">Rs. {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">GST</span><span className="text-slate-800">Rs. {gstAmount.toFixed(2)}</span></div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 flex items-center gap-1"><Percent size={12} /> Discount</span>
                <input type="number" value={discount} onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-16 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-sm text-right focus:outline-none focus:border-blue-500" />
                <span className="text-sm text-slate-500">%</span>
                <span className="text-sm text-emerald-600 font-medium ml-auto">-Rs. {discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100"><span>Total</span><span>Rs. {total.toFixed(2)}</span></div>
              {selectedPatient && payment === "credit" && (
                <div className="flex justify-between text-xs"><span className="text-slate-400">New Balance</span><span className="text-amber-600 font-medium">Rs. {(selectedPatient.balance + total).toFixed(2)} / Limit: Rs. {selectedPatient.creditLimit}</span></div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { key: "cash" as const, icon: Banknote, label: "Cash" },
                { key: "card" as const, icon: CreditCard, label: "Card" },
                { key: "upi" as const, icon: Smartphone, label: "UPI" },
                { key: "credit" as const, icon: Clock, label: "Pay Later" },
              ].map((p) => (
                <button key={p.key} onClick={() => setPayment(p.key)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all ${payment === p.key ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                  <p.icon size={18} />{p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Bills */}
          {savedBills.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Recent Bills</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {savedBills.slice(0, 5).map(b => (
                  <div key={b.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-xs font-medium text-slate-700">{b.id}</p>
                      <p className="text-[10px] text-slate-400">{new Date(b.date).toLocaleTimeString()} · {b.items.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800">Rs. {b.total.toFixed(2)}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${b.payment === "credit" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{b.payment}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Patient History */}
        <div className="lg:col-span-3 space-y-4">
          {selectedPatient ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5 sticky top-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                  {selectedPatient.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-400">{selectedPatient.phone} · ID: {selectedPatient.id}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2"><AlertTriangle size={14} className="text-red-500" /><h4 className="text-xs font-semibold text-slate-500 uppercase">Allergies</h4></div>
                {selectedPatient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPatient.allergies.map(a => <span key={a} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">{a}</span>)}
                  </div>
                ) : <p className="text-xs text-slate-400">No known allergies</p>}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2"><Pill size={14} className="text-blue-500" /><h4 className="text-xs font-semibold text-slate-500 uppercase">Active Medications</h4></div>
                {selectedPatient.activeMeds.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedPatient.activeMeds.map(m => (
                      <div key={m} className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100"><Pill size={12} className="text-blue-400" /><span className="text-xs font-medium text-slate-700">{m}</span></div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-400">No active medications</p>}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2"><History size={14} className="text-slate-400" /><h4 className="text-xs font-semibold text-slate-500 uppercase">Recent Purchases</h4></div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {history.map(h => {
                    const daysAgo = Math.floor((Date.now() - new Date(h.date).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={h.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between mb-1"><span className="text-xs font-medium text-slate-700">{h.id}</span><span className="text-[10px] text-slate-400">{daysAgo}d ago</span></div>
                        <p className="text-[10px] text-slate-500">{h.items.join(", ")}</p>
                        <p className="text-[10px] font-bold text-slate-800 mt-0.5">Rs. {h.total}</p>
                      </div>
                    );
                  })}
                  {history.length === 0 && <p className="text-xs text-slate-400">No purchase history</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center sticky top-6">
              <User size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Select a patient to view<br/>allergies, active meds & history</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddPatient(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-slate-900">New Patient</h3><button onClick={() => setShowAddPatient(false)} className="p-1 rounded-lg hover:bg-slate-100"><X size={18} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input type="text" placeholder="Full name" value={newPatient.name} onChange={e => setNewPatient(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500" />
              <input type="text" placeholder="Phone" value={newPatient.phone} onChange={e => setNewPatient(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500" />
              <input type="number" placeholder="Credit limit" value={newPatient.creditLimit} onChange={e => setNewPatient(p => ({ ...p, creditLimit: Number(e.target.value) }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500" />
              <input type="text" placeholder="Allergies (comma separated)" value={newPatient.allergies} onChange={e => setNewPatient(p => ({ ...p, allergies: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500" />
              <input type="text" placeholder="Active meds (comma separated)" value={newPatient.activeMeds} onChange={e => setNewPatient(p => ({ ...p, activeMeds: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <button onClick={addNewPatient} className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Add Patient</button>
          </div>
        </div>
      )}

      <InvoiceModal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} bill={lastBill} />
    </div>
  );
}