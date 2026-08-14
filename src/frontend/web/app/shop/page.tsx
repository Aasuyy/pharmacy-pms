"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { fetchMedicines, fetchCategories, addToCart, getCart } from "@/lib/api";
import { Search, ShoppingCart, Pill, Heart, Filter, X, Upload, Loader2, Plus, Sparkles } from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  generic: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  stock: number;
  unit: string;
  image: string;
  requires_prescription: boolean;
  description: string;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function ShopPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [medsRes, catsRes, cartRes] = await Promise.all([
        fetchMedicines({ category: activeCategory || undefined, search: search || undefined }),
        fetchCategories(),
        getCart().catch(() => ({ item_count: 0 })),
      ]);
      setMedicines((medsRes.drugs || medsRes.items || []).map((d: any) => ({
          id: String(d.id),
          name: d.name,
          generic: d.generic_name || d.generic || "",
          brand: d.manufacturer || d.brand || "",
          category: d.category || "",
          price: d.selling_price || d.price || 0,
          mrp: d.cost_price || d.mrp || d.selling_price || 0,
          stock: d.stock || 0,
          unit: d.unit || "tablet",
          image: d.image || "",
          requires_prescription: d.controlled || d.requires_prescription || false,
          description: d.description || "",
          tags: d.tags || []
        })));
      setCategories(catsRes || []);
      setCartCount(cartRes.item_count || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddToCart = async (med: Medicine) => {
    if (med.requires_prescription) {
      setSelectedMed(med);
      setShowPrescriptionModal(true);
      return;
    }
    setAddingId(med.id);
    try {
      await addToCart(med.id, 1);
      const cart = await getCart();
      setCartCount(cart.item_count || 0);
    } finally {
      setAddingId(null);
    }
  };

  const discountPct = (price: number, mrp: number) => Math.round(((mrp - price) / mrp) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/shop" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Pill size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800 hidden sm:block">PharmaPro</span>
          </Link>
          
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicines, brands, generics..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          <Link href="/symptom-checker" className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-50 text-violet-600 text-xs font-medium hover:bg-violet-100 transition-all">
            <Sparkles size={14} /> AI Check
          </Link>

          <Link href="/cart" className="relative p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all">
            <ShoppingCart size={20} className="text-slate-600" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 shadow-xl shadow-blue-500/10 p-8 text-white">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-white/5 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Genuine Medicines <span className="text-blue-100">Delivered</span></h1>
            <p className="text-blue-100/80 text-sm max-w-md">Upload prescriptions, order OTC & prescription drugs, track delivery — all from your home.</p>
            <div className="flex gap-3 mt-5">
              <Link href="/prescriptions" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/30 transition-all">
                <Upload size={14} /> Upload Prescription
              </Link>
              <Link href="/orders" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white/90 text-sm hover:bg-white/20 transition-all">
                My Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-sm ${
              !activeCategory ? "bg-blue-600 text-white shadow-blue-500/25" : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            <Filter size={14} /> All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-sm ${
                activeCategory === cat.id ? "bg-blue-600 text-white shadow-blue-500/25" : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-blue-600 animate-spin" />
          </div>
        ) : medicines.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No medicines found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {medicines.map((med) => (
              <div key={med.id} className="group relative rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden">
                <Link href={`/shop/${med.id}`} className="block">
                  <div className="aspect-square bg-gradient-to-br from-slate-50 to-white flex items-center justify-center relative">
                    <Pill size={48} className="text-slate-200 group-hover:text-blue-200 transition-colors" />
                    {med.requires_prescription && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-bold">
                        Rx Required
                      </span>
                    )}
                    {discountPct(med.price, med.mrp) > 0 && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold">
                        -{discountPct(med.price, med.mrp)}%
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/shop/${med.id}`}>
                    <h3 className="font-semibold text-sm text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{med.name}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{med.generic} · {med.unit}</p>
                  </Link>
                  <div className="flex items-end gap-2 mt-3">
                    <span className="text-lg font-bold text-slate-900">Rs. {med.price}</span>
                    <span className="text-xs text-slate-400 line-through mb-0.5">Rs. {med.mrp}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(med)}
                    disabled={addingId === med.id || med.stock <= 0}
                    className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-1"
                  >
                    {addingId === med.id ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    {med.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Prescription Required Modal */}
      {showPrescriptionModal && selectedMed && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowPrescriptionModal(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-100 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
              <Pill size={24} className="text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Prescription Required</h3>
            <p className="text-slate-500 text-sm mb-6">
              <span className="text-slate-800 font-medium">{selectedMed.name}</span> requires a valid prescription. Please upload one to purchase this medicine.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowPrescriptionModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <Link href="/prescriptions" onClick={() => setShowPrescriptionModal(false)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold text-center hover:shadow-lg transition-all">
                Upload Rx
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
