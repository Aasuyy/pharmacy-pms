"use client";
import { usePathname } from "next/navigation";
import StaffSidebar from "@/components/StaffSidebar";
import RoleGuard from "@/components/RoleGuard";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/staff/login") {
    return <div className="min-h-screen bg-white">{children}</div>;
  }
  return (
    <RoleGuard>
      <div className="flex min-h-screen bg-slate-50">
        <StaffSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </RoleGuard>
  );
}
