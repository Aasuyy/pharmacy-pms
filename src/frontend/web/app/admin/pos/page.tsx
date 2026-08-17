"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, Receipt, X, Check } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com";

interface Drug {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
}

interface CartItem {
  drug: Drug;
  quantity: number;
}

export default function POSPage() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/shop/drugs?t=${Date.now()}`)
      .then(r => r.json())
      .then(data => setDrugs(Array.isArray(data) ? data : []))
      .catch(() => setDrugs([]));
  }, []);

  useEffect(() => {
    // Focus search on mount and after checkout
    searchRef.current?.focus();
  }, [showReceipt]);

  const filteredDrugs = drugs.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (drug: Drug) => {
    setCart(prev => {
      const existing = prev.find(item => item.drug.id === drug.id);
      if (existing) {
        if (existing.quantity >= drug.stock_quantity) return prev;
        return prev.map(item => 
          item.drug.id === drug.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { drug, quantity: 1 }];
    });
    setSearch("");
    searchRef.current?.focus();
  };

  const updateQty = (drugId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.drug.id !== drugId) return item;
      const newQty = item.quantity + delta;
      if (newQty < 1) return item;
      if (newQty > item.drug.stock_quantity) return item;
      return { ...item, quantity: newQty };
    }));
  };

  const removeItem = (drugId: number) => {
    setCart(prev => prev.filter(item => item.drug.id !== drugId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.drug.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const checkout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName || "Walk-in",
          items: cart.map(item => ({
            drug_id: item.drug.id,
            quantity: item.quantity,
            price: item.drug.price
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Checkout failed");
      
      setLastOrder(data);
      setShowReceipt(true);
      setCart([]);
      setCustomerName("");
      // Refresh drug stock
      fetch(`${API_URL}/shop/drugs?t=${Date.now()}`)
        .then(r => r.json())
        .then(data => setDrugs(Array.isArray(data) ? data : []));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Point of Sale</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Drug Search */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search drugs by name..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {search && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-h-96 overflow-y-auto">
                {filteredDrugs.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">No drugs found</div>
                ) : (
                  filteredDrugs.map(drug => (
                    <button
                      key={drug.id}
                      onClick={() => addToCart(drug)}
                      disabled={drug.stock_quantity <= 0}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 disabled:opacity-50 text-left"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{drug.name}</p>
                        <p className="text-xs text-slate-500">Stock: {drug.stock_quantity}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">Rs. {drug.price}</span>
                        <Plus size={16} className="text-blue-600" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Cart Items */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ShoppingCart size={20} />
                Cart ({itemCount} items)
              </h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Scan or search to add items</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.drug.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.drug.name}</p>
                        <p className="text-xs text-slate-500">Rs. {item.drug.price} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQty(item.drug.id, -1)}
                          className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.drug.id, 1)}
                          disabled={item.quantity >= item.drug.stock_quantity}
                          className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="w-20 text-right font-semibold">
                          Rs. {(item.drug.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeItem(item.drug.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Checkout Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 h-fit sticky top-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Checkout</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Walk-in customer"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="border-t border-slate-100 pt-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Items</span>
                <span className="font-medium">{itemCount}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-slate-900">Total</span>
                <span className="text-blue-600">Rs. {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={checkout}
              disabled={cart.length === 0 || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : (
                <>
                  <Check size={18} />
                  Complete Sale
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt size={20} className="text-emerald-600" />
                Receipt
              </h3>
              <button onClick={() => setShowReceipt(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-sm text-slate-500">PharmaPro Pharmacy</p>
              <p className="text-xs text-slate-400">{new Date().toLocaleString()}</p>
              <p className="text-sm font-medium mt-2">Order #{lastOrder.order_id}</p>
            </div>

            <div className="border-t border-b border-slate-100 py-4 mb-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Paid</span>
                <span className="text-blue-600">Rs. {lastOrder.total?.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => { setShowReceipt(false); searchRef.current?.focus(); }}
              className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800"
            >
              New Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
