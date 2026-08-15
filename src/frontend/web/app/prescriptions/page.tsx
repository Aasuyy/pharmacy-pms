"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Upload, FileText, ChevronRight, Clock, CheckCircle, XCircle } from "lucide-react";

export default function PrescriptionsPage() {
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Please sign in to upload prescriptions</p>
          <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm">Sign In</Link>
        </div>
      </div>
    );
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("customer_id", user.id.toString());
    formData.append("notes", notes);
    formData.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com"}/prescriptions/`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      setMessage("✅ Prescription uploaded successfully! Our pharmacist will review it shortly.");
      setFile(null);
      setNotes("");
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/shop" className="text-slate-400 hover:text-slate-600"><ChevronRight size={20} className="rotate-180" /></Link>
          <h1 className="text-lg font-bold text-slate-900">Upload Prescription</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <FileText size={20} className="text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Why upload a prescription?</p>
              <p className="text-xs text-blue-700 mt-1">For controlled medicines (antibiotics, cardiac drugs), Nepali law requires a valid prescription. Upload yours and our pharmacist will verify it within 30 minutes.</p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpload} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Prescription Image</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              <Upload size={32} className="text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">{file ? file.name : "Click or drag to upload prescription photo"}</p>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="prescription-upload" />
              <label htmlFor="prescription-upload" className="mt-2 inline-block text-sm text-blue-600 font-medium cursor-pointer">Select File</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Doctor name, symptoms, etc." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" />
          </div>

          <button type="submit" disabled={uploading || !file} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {uploading ? "Uploading..." : "Upload Prescription"}
          </button>
        </form>
      </div>
    </div>
  );
}
