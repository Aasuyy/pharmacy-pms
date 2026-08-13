"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Minus, ShoppingCart, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/Toast";

interface Medicine {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  gst: number;
  requiresRx: boolean;
}

const MED_DB: Record<string, Medicine> = {
  "m1": { id: "m1", name: "Paracetamol 500mg", price: 3, stock: 45, category: "Pain Relief", description: "For fever and mild pain.", gst: 12, requiresRx: false },
  "m2": { id: "m2", name: "Amoxicillin 500mg", price: 15, stock: 12, category: "Antibiotics", description: "Requires prescription.", gst: 12, requiresRx: true },
  "m3": { id: "m3", name: "Vitamin C 1000mg", price: 35, stock: 28, category: "Vitamins", description: "Immune support.", gst: 5, requiresRx: false },
  "m4": { id: "m4", name: "Cetirizine 10mg", price: 8, stock: 60, category: "Allergy", description: "Antihistamine.", gst: 5, requiresRx: false },
  "m5": { id: "m5", name: "ORS Powder", price: 5, stock: 100, category: "Hydration", description: "Oral rehydration salts.", gst: 0, requiresRx: false },
  "m6": { id: "m6", name: "Ibuprofen 400mg", price: 6, stock: 30, category: "Pain Relief", description: "Anti-inflammatory.", gst: 12, requiresRx: false },
  "m7": { id: "m7", name: "Omeprazole 20mg", price: 12, stock: 8, category: "Digestive", description: "For acid reflux.", gst: 12, requiresRx: false },
};

export default function MedicineDetail() {
  const params = useParams();
  const { toast, ToastContainer } = useToast();
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState<any[]>([]);

  const id = params.id as string;
  const med = MED_DB[id];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("pharma_customer_cart") || "[]");
    setCart(saved);
  }, []);

  if (!med) return <div className="min-h-screen flex items-center justify-center text-slate-400">Medicine not found</div>;

  const addToCart = () => {
    const existing = cart.find((c: any) => c.id === med.id);
    let newCart;
    if (existing) {
      newCart = cart.map((c: any) => c.id === med.id ? { ...c, qty: c.qty + qty } : c);
    } else {
      newCart = [...cart, { id: med.id, name: med.name, price: med.price, qty, gst: med.gst, requiresRx: med.requiresRx }];
    }
    setCart(newCart);
    localStorage.setItem("pharma_customer_cart", JSON.stringify(newCart));
    toast(`Added ${qty} x ${med.name} to cart`, "success");
  };

  const finalPrice = med.price * qty;
  const gstAmount = (finalPrice * med.gst) / 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> Back to shop
        </Link>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="w-full h-48 rounded-xl bg-slate-50 flex items-center justify-center text-6xl">💊</div>
          <div>
            <p className="text-xs text-slate-400 mb-1">{med.category}</p>
            <h1 className="text-xl font-bold text-slate-900">{med.name}</h1>
            <p className="text-sm text-slate-500 mt-1">{med.description}</p>
          </div>
          {med.requiresRx && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle size={16} className="text-amber-600" />
              <p className="text-xs text-amber-700 font-medium">This medicine requires a valid prescription.</p>
            </div>
          )}
          <div className="flex items-end justify-between pt-2">
            <div>
              <p className="text-2xl font-bold text-slate-900">Rs. {med.price}</p>
              <p className="text-xs text-slate-400">+ Rs. {gstAmount.toFixed(2)} GST ({med.gst}%)</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600"><Minus size={14} /></button>
              <span className="w-6 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty(Math.min(med.stock, qty + 1))} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600"><Plus size={14} /></button>
            </div>
          </div>
          <button onClick={addToCart} className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
            <ShoppingCart size={16} /> Add to Cart — Rs. {(finalPrice + gstAmount).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
