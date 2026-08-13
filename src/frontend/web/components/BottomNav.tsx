"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, ClipboardList, Repeat, User } from "lucide-react";

export default function BottomNav() {
  const path = usePathname();
  if (path?.includes("/login") || path?.includes("/admin") || path?.includes("/staff") || path?.includes("/register")) return null;

  const links = [
    { href: "/shop", icon: Home, label: "Shop" },
    { href: "/wishlist", icon: Heart, label: "Saved" },
    { href: "/prescriptions", icon: ClipboardList, label: "Rx" },
    { href: "/subscriptions", icon: Repeat, label: "Refills" },
    { href: "/orders", icon: User, label: "Orders" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] sm:hidden">
      <div className="flex items-center justify-around py-2">
        {links.map((l) => {
          const active = path === l.href;
          return (
            <Link key={l.href} href={l.href} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${active ? "text-blue-600" : "text-slate-400"}`}>
              <l.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{l.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
