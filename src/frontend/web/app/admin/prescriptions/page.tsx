"use client";
import { useState } from "react";
import { FileText, UploadCloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com";

export default function PrescriptionsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setOcrResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/prescriptions/ocr/parse`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setOcrResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Prescription Processing & OCR</h1>
        <p className="text-sm text-slate-500 mt-1">Scan prescription receipts to extract active medication lists</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* File Upload Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <UploadCloud className="text-blue-600" size={20} /> Upload Rx Image
          </h2>

          <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center bg-slate-50/50">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-4 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="text-xs text-slate-600 font-medium mb-4">
                Selected: <span className="text-slate-900">{file.name}</span>
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
              {loading ? "Processing OCR..." : "Extract Prescription Data"}
            </button>
          </div>
        </div>

        {/* OCR Parsed Output Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-600" size={20} /> Extracted Rx Details
          </h2>

          {ocrResult?.extracted_data ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-semibold">Patient:</span>{" "}
                  <strong className="text-slate-800">{ocrResult.extracted_data.patient_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold">Prescriber:</span>{" "}
                  <strong className="text-slate-800">{ocrResult.extracted_data.doctor_name}</strong>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Detected Medicines</p>
                <div className="space-y-2">
                  {ocrResult.extracted_data.medicines.map((med: any, idx: number) => (
                    <div key={idx} className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{med.name}</p>
                        <p className="text-slate-500">Dosage: {med.dosage} ({med.duration})</p>
                      </div>
                      <span className="font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                        Qty: {med.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400">
              <AlertCircle size={32} className="mb-2 opacity-50" />
              <p className="text-xs">No parsed prescription loaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
