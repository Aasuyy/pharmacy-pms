"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCustomerToken } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { Search, ShoppingCart, ChevronRight, Plus, RefreshCw } from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  image?: string;
  generic?: string;
}

const API_BASE = "https://pharmacy-pms.onrender.com";

async function fetchWithTimeout(url: string, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addItem, getCount } = useCartStore();
  const cartCount = getCount();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [medsRes, catsRes] = await Promise.all([
        fetchWithTimeout(`${API_BASE}/shop/drugs`),
        fetchWithTimeout(`${API_BASE}/shop/categories`),
      ]);

      if (!medsRes.ok) throw new Error(`Drugs API returned ${medsRes.status}`);
      if (!catsRes.ok) throw new Error(`Categories API returned ${catsRes.status}`);

      const medsData = await medsRes.json();
      const catsData = await catsRes.json();

      const meds = Array.isArray(medsData) ? medsData : medsData.drugs || [];
      const cats = Array.isArray(catsData) ? catsData : catsData.categories || [];

      setMedicines(
        meds.map((d: any) => ({
          id: String(d.id),
          name: d.name,
          price: d.selling_price || d.price || 0,
          stock: d.stock || 0,
          category: d.category || "General",
          description: d.generic_name || d.description || "",
          image: d.image || "💊",
          generic: d.generic_name || "",
        }))
      );

      setCategories(["All", ...cats.filter((c: string) => c && c !== "All")]);
    } catch (e: any) {
      console.error("Failed to load shop data", e);
      setError(e.message || "Failed to load medicines. Backend may be waking up...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = medicines.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || m.category === category;
    return matchSearch && matchCat;
  });

  const handleAddToCart = (med: Medicine) => {
    addItem({
      id: med.id,
      name: med.name,
      generic: med.generic,
      price: med.price,
      image: med.image,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-slate-500 text-sm">Loading medicines...</p>
        <p className="text-slate-400 text-xs">If this takes &gt;30s, Render is waking up from sleep</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
        <p className="text-slate-400 text-xs text-center">
          Render free tier spins down after 15 min of inactivity.<br />
          First request wakes it up (~30s).
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <span className="font-bold text-slate-900">PharmaPro</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2 rounded-xl hover:bg-slate-100 transition-all">
              <ShoppingCart size={20} className="text-slate-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {getCustomerToken() ? (
              <Link href="/profile" className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                Me
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">Genuine Medicines Delivered</h1>
          <p className="text-blue-100 text-sm">
            Upload prescriptions, order OTC & prescription drugs, track delivery — all from your home.
          </p>
        </div>

        {/* Search + Categories */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  category === c
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((med) => (
            <div
              key={med.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3 hover:shadow-md transition-all"
            >
              <div className="w-full h-32 rounded-xl bg-slate-50 flex items-center justify-center text-4xl">
                {med.image}
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{med.category}</p>
                <h3 className="text-sm font-semibold text-slate-900">{med.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{med.description}</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-lg font-bold text-slate-900">Rs. {med.price}</p>
                  <p className={`text-xs ${med.stock <= 10 ? "text-red-500" : "text-slate-400"}`}>
                    {med.stock <= 10 ? "Low stock" : `${med.stock} in stock`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(med)}
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-all flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                  <Link
                    href={`/shop/${med.id}`}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-all flex items-center gap-1"
                  >
                    View <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-400 py-12">No medicines found</p>
        )}
      </div>
    </div>
  );
}
