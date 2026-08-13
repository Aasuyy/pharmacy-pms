"use client";
import { useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, type: "success" | "error" | "warning" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);
  const ToastContainer = useCallback(() => {
    if (toasts.length === 0) return null;
    return (
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-in slide-in-from-right fade-in duration-300 ${
            t.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
            t.type === "error" ? "bg-red-50 border-red-200 text-red-800" :
            "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            {t.type === "success" ? <CheckCircle size={16} /> : t.type === "error" ? <XCircle size={16} /> : <AlertTriangle size={16} />}
            {t.message}
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="ml-2 hover:opacity-70"><X size={14} /></button>
          </div>
        ))}
      </div>
    );
  }, [toasts]);
  return { toast, ToastContainer };
}
