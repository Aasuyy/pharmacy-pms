"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const name = searchParams.get("name");

    if (!token) {
      setStatus("error");
      setMessage("Authentication failed. No token received.");
      return;
    }

    if (role === "admin") {
      localStorage.setItem("pharma_admin_token", token);
      if (name) localStorage.setItem("pharma_admin_role", "admin");
      setStatus("success");
      setMessage("Admin login successful! Redirecting...");
      setTimeout(() => { window.location.href = "/admin/dashboard"; }, 1500);
    } else if (role === "staff" || role === "moderator") {
      localStorage.setItem("pharma_staff_token", token);
      setStatus("success");
      setMessage("Staff login successful! Redirecting...");
      setTimeout(() => { window.location.href = "/staff/dashboard"; }, 1500);
    } else {
      localStorage.setItem("pharma_customer_token", token);
      setStatus("success");
      setMessage(`Welcome${name ? `, ${name}` : ""}! Redirecting...`);
      setTimeout(() => { window.location.href = "/shop"; }, 1500);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center">
        {status === "processing" && (
          <>
            <Loader2 size={48} className="text-[#84cc16] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Signing you in...</h2>
            <p className="text-white/40 text-sm">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle size={48} className="text-[#39ff14] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Success!</h2>
            <p className="text-white/40 text-sm">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Login Failed</h2>
            <p className="text-white/40 text-sm mb-6">{message}</p>
            <a href="/login" className="text-[#84cc16] hover:text-[#39ff14] transition-colors text-sm">← Back to login</a>
          </>
        )}
      </div>
    </div>
  );
}
