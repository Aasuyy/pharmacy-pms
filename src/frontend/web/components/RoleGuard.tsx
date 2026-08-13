"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { getStaffToken } from "@/lib/rbac";

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !getAdminToken()) {
      router.push("/admin/login");
    }
    if (pathname.startsWith("/staff") && pathname !== "/staff/login" && !getStaffToken()) {
      router.push("/staff/login");
    }
  }, [pathname, router]);
  return <>{children}</>;
}
