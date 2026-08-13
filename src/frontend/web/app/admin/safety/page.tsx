"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Shield, Plus, Trash2, Clock, AlertTriangle, Pill, Save } from "lucide-react";

interface InteractionRule {
  id: string;
  drug: string;
  conflicts: string[];
}

interface PatientAllergy {
  id: string;
  name: string;
  allergies: string[];
}

export default function AdminSafety() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);

  const [validityMonths, setValidityMonths] = useState(6);
  const [interactions, setInteractions] = useState<InteractionRule[]>([
    { id: "1", drug: "Warfarin", conflicts: ["Aspirin", "Ibuprofen", "Vitamin K"] },
    { id: "2", drug: "Metformin", conflicts: ["Contrast dye"] },
    { id: "3", drug: "Amlodipine", conflicts: ["Simvastatin"] },
  ]);
  const [patients] = useState<PatientAllergy[]>([
    { id: "P-001", name: "Ram Bahadur", allergies: ["Penicillin", "Sulfa"] },
    { id: "P-002", name: "Sita Kumari", allergies: [] },
    { id: "P-003", name: "Gopal Thapa", allergies: ["Aspirin"] },
  ]);

  const [newDrug, setNewDrug] = useState("");
  const [newConflicts, setNewConflicts] = useState("");

  useEffect(() => {
    setMounted(true);
    if (!getAdminToken()) router.push("/admin/login");
    const saved = localStorage.getItem("pharma_safety_config");
    if (saved) {
      const config = JSON.parse(saved);
      setValidityMonths(config.validityMonths || 6);
      if (config.interactions) setInteractions(config.interactions);
    }
  }, [router]);
  if (!mounted) return null;

  const saveConfig = () => {
    localStorage.setItem("pharma_safety_config", JSON.stringify({ validityMonths, interactions }));
    toast("Safety configuration saved", "success");
  };

  const addInteraction = () => {
    if (!newDrug || !newConflicts) { toast("Enter drug and conflicts", "error"); return; }
    setInteractions([...interactions, {
      id: Date.now().toString(),
      drug: newDrug,
      conflicts: newConflicts.split(",").map(c => c.trim()).filter(Boolean)
    }]);
    setNewDrug("");
    setNewConflicts("");
    toast("Interaction rule added", "success");
  };

  const removeInteraction = (id: string) => {
    setInteractions(interactions.filter(i => i.id !== id));
    toast("Rule removed", "success");
  };

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Safety & Compliance</h1>
          <p className="text-slate-400 text-sm mt-0.5">Configure dispensing safety rules</p>
        </div>
        <button onClick={saveConfig} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
          <Save size={16} /> Save Changes
        </button>
      </div>

      {/* Rx Validity */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Clock size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Prescription Validity</h2>
            <p className="text-xs text-slate-400">Block dispensing of expired prescriptions</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm text-slate-600">Rx expires after</label>
          <select value={validityMonths} onChange={e => setValidityMonths(Number(e.target.value))}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all">
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
          </select>
          <span className="text-sm text-slate-500">from issue date</span>
        </div>
      </div>

      {/* Drug Interactions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Drug Interaction Database</h2>
            <p className="text-xs text-slate-400">Block dangerous drug combinations</p>
          </div>
        </div>

        <div className="flex gap-3">
          <input type="text" placeholder="Drug name (e.g. Warfarin)" value={newDrug} onChange={e => setNewDrug(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
          <input type="text" placeholder="Conflicts, comma separated (e.g. Aspirin, Ibuprofen)" value={newConflicts} onChange={e => setNewConflicts(e.target.value)}
            className="flex-[2] px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 transition-all" />
          <button onClick={addInteraction} className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-2">
          {interactions.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Pill size={14} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-800">{rule.drug}</span>
                <span className="text-xs text-slate-400">conflicts with</span>
                <div className="flex gap-1">
                  {rule.conflicts.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-xs font-medium border border-red-100">{c}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => removeInteraction(rule.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {interactions.length === 0 && <p className="text-sm text-slate-400 py-2">No interaction rules</p>}
        </div>
      </div>

      {/* Patient Allergies (Read-only view) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Shield size={18} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Patient Allergy Records</h2>
            <p className="text-xs text-slate-400">View-only. Edit in patient profile.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {patients.map((p) => (
            <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm font-medium text-slate-800">{p.name}</p>
              <p className="text-xs text-slate-400 mb-1.5">ID: {p.id}</p>
              <div className="flex flex-wrap gap-1">
                {p.allergies.length > 0 ? p.allergies.map((a) => (
                  <span key={a} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100">{a}</span>
                )) : (
                  <span className="text-xs text-slate-400">No known allergies</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
