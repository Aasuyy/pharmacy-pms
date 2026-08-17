"use client";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2, Printer, CheckCircle, CreditCard } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com";

interface Drug {
  id: number;
  name: string;
  brand: string;
  price: number;
  stock_quantity: number;
}

interface CartItem extends Drug {
  cart_qty: number;
}

export default function POSPage() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/shop/drugs`)
      .then((r) => r.json())
      .then((data) => setDrugs(Array.isArray(data) ? data : []))
      .catch(() => setDrugs([]));
  }, []);

  const addToCart = (drug: Drug) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === drug.id);
      if (existing) {
        if (existing.cart_qty >= drug.stock_quantity) return prev;
        return prev.map((item) =>
          item.id === drug.id ? { ...item, cart_qty: item.cart_qty + 1 } : item
        );
      }
      return [...prev, { ...drug, cart_qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.cart_qty + delta;
            if (newQty > item.stock_quantity) return item;
            return newQty > 0 ? { ...item, cart_qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.cart_qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    const payload = {
      items: cart.map((item) => ({
        drug_id: item.id,
        quantity: item.cart_qty,
        unit_price: item.price,
      })),
      payment_method: "cash",
      customer_name: "Walk-in Customer",
    };

    try {
      const res = await fetch(`${API_URL}/shop/pos/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCheckoutSuccess(data);
        setCart([]);
        // Refresh stock
        fetch(`${API_URL}/shop/drugs`)
          .then((r) => r.json())
          .then((d) => setDrugs(Array.isArray(d) ? d : []));
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (e) {
      alert("Error processing checkout");
    } finally {
      setLoading(false);
    }
  };

  const filteredDrugs = drugs.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.brand && d.brand.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col lg:flex-row gap-6">
      {/* Left: Inventory / Search */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">POS / Sales Counter</h1>
            <p className="text-xs text-slate-500">Select medicines to ring up a new sale</p>
          </div>
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search drug or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto max-h-[calc(100vh-220px)] p-1">
          {filteredDrugs.map((drug) => {
            const isOutOfStock = drug.stock_quantity <= 0;
            return (
              <div
                key={drug.id}
                onClick={() => !isOutOfStock && addToCart(drug)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isOutOfStock
                    ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
                    : "bg-white border-slate-200 hover:border-blue-500 hover:shadow-sm"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{drug.name}</h3>
                    <span className="text-xs font-bold text-blue-600">Rs. {drug.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{drug.brand || "Generic"}</p>
                </div>
                <div className="mt-4 flex justify-between items-center text-xs">
                  <span
                    className={`font-medium ${
                      drug.stock_quantity < 10 ? "text-amber-600" : "text-slate-500"
                    }`}
                  >
                    Stock: {drug.stock_quantity}
                  </span>
                  <button
                    disabled={isOutOfStock}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-full lg:w-96 bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-blue-600" />
              <h2 className="font-bold text-slate-900">Current Order</h2>
            </div>
            <span className="text-xs font-medium text-slate-500">{cart.length} Items</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-380px)] pr-1">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1 pr-2">
                  <p className="text-sm font-medium text-slate-900 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-slate-500">Rs. {item.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.cart_qty}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded ml-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                No items in cart. Click a medicine on the left to add.
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 mt-4 space-y-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-100">
              <span>Total</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || loading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <CreditCard size={16} />
            {loading ? "Processing..." : "Complete Sale"}
          </button>
        </div>
      </div>

      {/* Success Modal / Printable Receipt */}
      {checkoutSuccess && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-6">
              <CheckCircle size={48} className="text-emerald-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-slate-900">Sale Complete!</h3>
              <p className="text-xs text-slate-500">Order #{checkoutSuccess.order_id}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Paid:</span>
                <span className="font-bold text-slate-900">Rs. {checkoutSuccess.total_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-600 font-medium capitalize">Completed</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-700 text-xs font-medium py-2 rounded-lg hover:bg-slate-50"
              >
                <Printer size={14} /> Print Receipt
              </button>
              <button
                onClick={() => setCheckoutSuccess(null)}
                className="flex-1 bg-blue-600 text-white text-xs font-medium py-2 rounded-lg hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
