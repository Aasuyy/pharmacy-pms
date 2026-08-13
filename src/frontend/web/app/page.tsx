"use client";
import Link from "next/link";
import { Pill, Truck, ShieldCheck, Headphones, ArrowRight, Sparkles } from "lucide-react";
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      <div className="glow-orb w-[500px] h-[500px] bg-[#39ff14] top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />
      <nav className="flex items-center justify-between px-8 py-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#39ff14] to-[#32cd32] flex items-center justify-center"><span className="text-[#050505] text-sm font-bold">P</span></div>
          <span className="text-lg font-bold gradient-text">PharmaPro</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Login</Link>
          <Link href="/register" className="btn-primary !w-auto !px-5 !py-2.5 text-sm">Get Started</Link>
        </div>
      </nav>
      <section className="relative z-10 px-8 pt-20 pb-32 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs text-[#39ff14] mb-6">
          <Sparkles size={14} /> Nepal's Trusted Online Pharmacy
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Your Health,<br /><span className="gradient-text">Delivered</span>
        </h1>
        <p className="text-lg text-white/40 mb-10 max-w-xl mx-auto">
          Order genuine medicines, track prescriptions, and get doorstep delivery across Nepal. Verified, secure, and always in stock.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/shop" className="btn-primary !w-auto !px-8 flex items-center gap-2">Shop Now <ArrowRight size={18} /></Link>
          <Link href="/login" className="btn-secondary !w-auto !px-8">Sign In</Link>
        </div>
      </section>
      <section className="relative z-10 px-8 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Truck, title: "Fast Delivery", desc: "Same-day delivery in Kathmandu valley" },
            { icon: ShieldCheck, title: "100% Genuine", desc: "All medicines verified and authentic" },
            { icon: Headphones, title: "24/7 Support", desc: "Pharmacists available round the clock" },
          ].map(f => (
            <div key={f.title} className="glass-elevated rounded-2xl p-6 card-hover">
              <div className="w-12 h-12 rounded-xl bg-[#39ff14]/5 flex items-center justify-center mb-4"><f.icon size={24} className="text-[#39ff14]" /></div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="relative z-10 px-8 pb-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {["Pain Relief", "Antibiotics", "Diabetes Care", "Vitamins", "Skin Care", "Baby Care", "Heart Care", "Eye Care"].map(c => (
              <Link key={c} href="/shop" className="glass rounded-2xl p-5 text-center card-hover">
                <Pill size={28} className="mx-auto text-[#39ff14] mb-3" />
                <div className="text-sm font-medium">{c}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
