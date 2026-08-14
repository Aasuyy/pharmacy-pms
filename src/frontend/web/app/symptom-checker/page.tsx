"use client";
import Link from "next/link";
import { Stethoscope, ArrowLeft } from "lucide-react";

export default function SymptomCheckerPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <Stethoscope className="w-16 h-16 text-slate-300 mb-4" />
      <h1 className="text-2xl font-bold text-slate-700 mb-2">Symptom Checker</h1>
      <p className="text-slate-500 mb-6">AI symptom checker coming soon.</p>
      <Link href="/shop" className="flex items-center gap-2 text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>
    </div>
  );
}
