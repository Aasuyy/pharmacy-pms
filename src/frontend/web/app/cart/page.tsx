"use client";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, getCount } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <ShoppingBag className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-700 mb-2">Your Cart is Empty</h1>
        <p className="text-slate-500 mb-6">Browse medicines and add them here.</p>
        <Link href="/shop" className="flex items-center gap-2 text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Shopping Cart ({getCount()})</h1>
          <Link href="/shop" className="flex items-center gap-2 text-blue-600 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{item.name}</h3>
                <p className="text-sm text-slate-500">{item.generic}</p>
                <p className="text-blue-600 font-bold mt-1">Rs. {item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center text-lg font-bold text-slate-800">
            <span>Total</span>
            <span>Rs. {getTotal().toFixed(2)}</span>
          </div>
          <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
