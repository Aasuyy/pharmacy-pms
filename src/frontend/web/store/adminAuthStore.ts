import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Admin {
  id: number;
  email: string;
  full_name: string;
}

interface AdminAuthState {
  admin: Admin | null;
  token: string | null;
  setAdmin: (admin: Admin, token: string) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      setAdmin: (admin, token) => set({ admin, token }),
      logout: () => set({ admin: null, token: null }),
    }),
    { name: "admin-auth" }
  )
);
