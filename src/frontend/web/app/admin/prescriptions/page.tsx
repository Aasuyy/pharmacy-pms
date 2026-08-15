"use client";
import { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";

interface Prescription {
  id: number;
  customer_id: number;
  image_url: string;
  status: string;
  notes: string;
  created_at: string;
}

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com"}/prescriptions/`);
      const data = await res.json();
      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com"}/prescriptions/${id}/status?status=${status}`, {
        method: "PATCH",
      });
      if (res.ok) loadPrescriptions();
    } catch (err) {
      console.error(err);
    }
  };

  const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Pending Review" },
    approved: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Approved" },
    rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Rejected" },
  };

  return (
    <div>
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-xl font-bold text-slate-900">Prescriptions</h1>
        <p className="text-xs text-slate-500">Review customer prescription uploads</p>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading prescriptions...</div>
          ) : prescriptions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <FileText size={48} className="mx-auto mb-4 text-slate-300" />
              <p>No prescriptions uploaded yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prescriptions.map((p) => {
                  const status = statusConfig[p.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">#{p.id}</td>
                      <td className="px-4 py-3 text-slate-600">Customer #{p.customer_id}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{p.notes || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p.status === "pending" && (
                            <>
                              <button onClick={() => handleStatusUpdate(p.id, "approved")} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">
                                Approve
                              </button>
                              <button onClick={() => handleStatusUpdate(p.id, "rejected")} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200">
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
