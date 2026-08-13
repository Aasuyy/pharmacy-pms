"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, placeOrder } from "@/lib/api";
import { MapPin, CreditCard, Truck, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "Kathmandu",
    payment: "cod",
    notes: "",
    prescriptionId: "",
  });

  useEffect(() => {
    getCart().then(setCart).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handlePlace = async () => {
    if (!form.fullName || !form.phone || !form.address) return;
    setPlacing(true);
    try {
      const res = await placeOrder({
        items: cart.items.map((i: any) => ({ medicine_id: i.medicine_id, quantity: i.quantity })),
        shipping_address: {
          full_name: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
        },
        payment_method: form.payment,
        prescription_id: form.prescriptionId || null,
        notes: form.notes,
      });
      setOrderId(res.order_id);
      setDone(true);
    } catch (e) {
      alert("Failed to place order. " + (e as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 size={32} className="text-[#84cc16] animate-spin" /></div>;
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <CheckCircle size={64} className="text-[#39ff14] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
          <p className="text-white/40 text-sm mb-6">Your order <span className="text-white font-mono">{orderId}</span> has been received. We'll confirm shortly.</p>
          <Link href="/orders" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#84cc16] to-[#39ff14] text-[#0a0a0a] text-sm font-bold">View My Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/cart" className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]"><ArrowLeft size={16} /></Link>
          <h1 className="font-bold text-lg">Checkout</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Order Summary */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Truck size={14} className="text-[#84cc16]" /> Order Summary</h3>
          <div className="space-y-2 mb-3">
            {cart.items?.map((item: any) => (
              <div key={item.medicine_id} className="flex justify-between text-sm">
                <span className="text-white/60">{item.medicine.name} x{item.quantity}</span>
                <span>Rs. {item.subtotal}</span>
              </div>
            ))}
          </div>
          <div className="h-px bg-white/[0.06] mb-3" />
          <div className="flex justify-between font-bold"><span>Total</span><span className="text-[#84cc16]">Rs. {cart.total}</span></div>
        </div>

        {/* Shipping */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2"><MapPin size={14} className="text-[#84cc16]" /> Shipping Details</h3>
          <input value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} placeholder="Full Name" className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#84cc16]/40" />
          <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#84cc16]/40" />
          <input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="Delivery Address" className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#84cc16]/40" />
          <select value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white outline-none focus:border-[#84cc16]/40">
            <option value="Kathmandu" className="bg-[#1a1a1a]">Kathmandu</option>
            <option value="Lalitpur" className="bg-[#1a1a1a]">Lalitpur</option>
            <option value="Bhaktapur" className="bg-[#1a1a1a]">Bhaktapur</option>
            <option value="Pokhara" className="bg-[#1a1a1a]">Pokhara</option>
          </select>
        </div>

        {/* Payment */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2"><CreditCard size={14} className="text-[#84cc16]" /> Payment Method</h3>
          {[
            { id: "cod", label: "Cash on Delivery", sub: "Pay when you receive" },
            { id: "esewa", label: "eSewa", sub: "Pay via eSewa wallet" },
            { id: "khalti", label: "Khalti", sub: "Pay via Khalti wallet" },
          ].map((opt) => (
            <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.payment === opt.id ? "border-[#84cc16]/40 bg-[#84cc16]/5" : "border-white/[0.06] bg-white/[0.01]"}`}>
              <input type="radio" name="payment" value={opt.id} checked={form.payment === opt.id} onChange={(e) => setForm({...form, payment: e.target.value})} className="accent-[#84cc16]" />
              <div>
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-white/30 text-xs">{opt.sub}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Notes */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Delivery notes (optional)" rows={3} className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#84cc16]/40 resize-none" />
        </div>

        <button
          onClick={handlePlace}
          disabled={placing || !form.fullName || !form.phone || !form.address}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#84cc16] to-[#39ff14] text-[#0a0a0a] font-bold text-sm hover:shadow-[0_8px_32px_rgba(132,204,22,0.3)] active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {placing ? <><Loader2 size={16} className="animate-spin" /> Placing Order...</> : `Place Order · Rs. ${cart.total}`}
        </button>
      </main>
    </div>
  );
}
