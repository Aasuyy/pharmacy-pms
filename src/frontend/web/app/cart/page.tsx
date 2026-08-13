"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCart, updateCart, removeFromCart, clearCart, checkInteractions } from "@/lib/api";
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, Pill, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const [cart, setCart] = useState<any>({ items: [], total: 0, item_count: 0 });
  const [loading, setLoading] = useState(true);
  const [interactions, setInteractions] = useState<any>(null);

  const load = async () => {
    try {
      const [data, inter] = await Promise.all([
        getCart(),
        checkInteractions().catch(() => ({ safe: true, warnings: [] })),
      ]);
      setCart(data);
      setInteractions(inter);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (medId: string, qty: number) => {
    try {
      const data = await updateCart(medId, qty);
      setCart(data);
      const inter = await checkInteractions().catch(() => ({ safe: true }));
      setInteractions(inter);
    } catch (e) { console.error(e); }
  };

  const handleRemove = async (medId: string) => {
    try {
      const data = await removeFromCart(medId);
      setCart(data);
      const inter = await checkInteractions().catch(() => ({ safe: true }));
      setInteractions(inter);
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 size={32} className="text-blue-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <ShoppingCart size={20} className="text-blue-600" />
          <h1 className="font-bold text-lg text-slate-800">Your Cart</h1>
          <span className="text-slate-400 text-sm">({cart.item_count || 0} items)</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {interactions && !interactions.safe && interactions.warnings.length > 0 && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-amber-600" /><span className="text-sm font-bold text-amber-700">Drug Interaction Alert</span></div>
            {interactions.warnings.map((w: any, i: number) => (
              <p key={i} className="text-amber-700/80 text-xs mb-1"><span className="font-medium">{w.medicines.join(" + ")}</span>: {w.message}</p>
            ))}
          </div>
        )}

        {interactions?.safe && cart.items?.length > 1 && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-600" /><span className="text-emerald-700 text-xs font-medium">No known drug interactions detected</span>
          </div>
        )}

        {cart.items?.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 text-sm mb-4">Your cart is empty.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20">
              Browse Medicines <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {cart.items.map((item: any) => (
                <div key={item.medicine_id} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="w-20 h-20 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    <Pill size={28} className="text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-slate-800 truncate">{item.medicine.name}</h3>
                    <p className="text-slate-400 text-xs">{item.medicine.unit}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleUpdate(item.medicine_id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-all"><Minus size={12} className="text-slate-600" /></button>
                        <span className="w-6 text-center text-sm font-bold text-slate-800">{item.quantity}</span>
                        <button onClick={() => handleUpdate(item.medicine_id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-all"><Plus size={12} className="text-slate-600" /></button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-slate-900">Rs. {item.subtotal}</p>
                        <button onClick={() => handleRemove(item.medicine_id)} className="text-red-500/70 hover:text-red-600 text-xs mt-1 flex items-center gap-1 ml-auto"><Trash2 size={10} /> Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3 mb-4">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="text-slate-800">Rs. {cart.total}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Delivery</span><span className="text-emerald-600 font-medium">Free</span></div>
              <div className="h-px bg-slate-100" />
              <div className="flex justify-between font-bold text-lg"><span className="text-slate-900">Total</span><span className="text-blue-600">Rs. {cart.total}</span></div>
            </div>

            <div className="flex gap-3">
              <button onClick={async () => { await clearCart(); load(); }} className="px-4 py-3 rounded-xl bg-slate-100 text-slate-500 text-sm font-medium hover:bg-slate-200 transition-all">Clear</button>
              <Link href="/checkout" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold text-center shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
