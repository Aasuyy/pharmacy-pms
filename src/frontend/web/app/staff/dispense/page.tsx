"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStaffToken } from "@/lib/rbac";
import { useToast } from "@/components/Toast";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  ClipboardCheck, Search, ChevronRight, CheckCircle, Pill,
  Printer, AlertTriangle, ShieldAlert, Package
} from "lucide-react";

interface Batch {
  batchNo: string;
  expiry: string;
  qty: number;
}

interface RxItem {
  id: string;
  rxId: string;
  patient: string;
  medicine: string;
  qty: number;
  status: "verify" | "pick" | "label" | "handover" | "done";
  doctor: string;
  date: string;
  patientId: string;
  batches: Batch[];
  selectedBatch?: string;
}

interface PatientProfile {
  id: string;
  name: string;
  allergies: string[];
  activeMeds: string[];
}

interface SafetyConfig {
  validityMonths: number;
  interactions: { id: string; drug: string; conflicts: string[] }[];
}

const PATIENT_DB: Record<string, PatientProfile> = {
  "P-001": { id: "P-001", name: "Ram Bahadur", allergies: ["Penicillin", "Sulfa"], activeMeds: ["Metformin 500mg"] },
  "P-002": { id: "P-002", name: "Sita Kumari", allergies: [], activeMeds: ["Amlodipine 5mg"] },
  "P-003": { id: "P-003", name: "Gopal Thapa", allergies: ["Aspirin"], activeMeds: ["Warfarin 5mg"] },
};

const DEFAULT_CONFIG: SafetyConfig = {
  validityMonths: 6,
  interactions: [
    { id: "1", drug: "Warfarin", conflicts: ["Aspirin", "Ibuprofen", "Vitamin K"] },
    { id: "2", drug: "Metformin", conflicts: ["Contrast dye"] },
    { id: "3", drug: "Amlodipine", conflicts: ["Simvastatin"] },
  ],
};

export default function StaffDispense() {
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [blocker, setBlocker] = useState<{ title: string; message: string; action: () => void } | null>(null);
  const [config, setConfig] = useState<SafetyConfig>(DEFAULT_CONFIG);

  const [rxs, setRxs, rxsLoaded] = useLocalStorage<RxItem[]>("pharma_dispense_rxs", [
  { id: "1", rxId: "RX-001", patient: "Ram Bahadur", medicine: "Amoxicillin 500mg", qty: 10, status: "verify", doctor: "Dr. Sharma", date: "2026-08-12", patientId: "P-001", batches: [
    { batchNo: "B-2026-A", expiry: "2026-08-18", qty: 20 },
    { batchNo: "B-2026-B", expiry: "2027-12-01", qty: 25 },
  ]},
  { id: "2", rxId: "RX-002", patient: "Sita Kumari", medicine: "Amlodipine 5mg", qty: 30, status: "pick", doctor: "Dr. Patel", date: "2026-02-01", patientId: "P-002", batches: [
    { batchNo: "B-2026-C", expiry: "2026-09-10", qty: 12 },
  ]},
  { id: "3", rxId: "RX-003", patient: "Gopal Thapa", medicine: "Aspirin 75mg", qty: 30, status: "label", doctor: "Dr. Sharma", date: "2026-08-11", patientId: "P-003", batches: [
    { batchNo: "B-2026-D", expiry: "2026-08-20", qty: 28 },
  ]},
]);

  useEffect(() => {
    setMounted(true);
    if (!getStaffToken()) router.push("/staff/login");
    const saved = localStorage.getItem("pharma_safety_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({
          validityMonths: parsed.validityMonths ?? 6,
          interactions: parsed.interactions ?? DEFAULT_CONFIG.interactions,
        });
      } catch {
        setConfig(DEFAULT_CONFIG);
      }
    }
  }, [router]);
  if (!mounted || !rxsLoaded) return null;

  const steps: RxItem["status"][] = ["verify", "pick", "label", "handover", "done"];
  const stepLabels = { verify: "Verify", pick: "Pick", label: "Label", handover: "Handover", done: "Done" };

  const getMedicineName = (med: string) => med.split(" ")[0];

  const getFEFOBatch = (batches: Batch[]) => {
    const valid = batches.filter(b => new Date(b.expiry) > new Date() && b.qty > 0);
    if (valid.length === 0) return null;
    return valid.sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime())[0];
  };

  const runSafetyChecks = (rx: RxItem): { pass: boolean; title: string; message: string } => {
    const patient = PATIENT_DB[rx.patientId];
    if (!patient) return { pass: true, title: "", message: "" };

    const rxDate = new Date(rx.date);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - config.validityMonths);
    if (rxDate < cutoff) {
      return {
        pass: false,
        title: "Prescription Expired",
        message: `Rx dated ${rx.date} is over ${config.validityMonths} months old. Contact ${rx.doctor} for a new Rx.`,
      };
    }

    const medName = getMedicineName(rx.medicine);
    for (const allergy of patient.allergies) {
      if (rx.medicine.toLowerCase().includes(allergy.toLowerCase())) {
        return {
          pass: false,
          title: "Allergy Alert",
          message: `${patient.name} is allergic to ${allergy}. This Rx contains ${medName}.`,
        };
      }
    }

    for (const activeMed of patient.activeMeds) {
      const activeName = getMedicineName(activeMed);
      const rule = config.interactions.find(i => i.drug.toLowerCase() === activeName.toLowerCase());
      if (rule) {
        for (const conflict of rule.conflicts) {
          if (rx.medicine.toLowerCase().includes(conflict.toLowerCase())) {
            return {
              pass: false,
              title: "Drug Interaction Warning",
              message: `${activeName} + ${medName} = dangerous interaction. Patient is on ${activeMed}.`,
            };
          }
        }
      }
    }

    // FEFO check - ensure non-expired batch exists
    const fefo = getFEFOBatch(rx.batches);
    if (!fefo) {
      return {
        pass: false,
        title: "No Valid Batch",
        message: `All batches of ${rx.medicine} are expired or out of stock. Cannot dispense.`,
      };
    }

    return { pass: true, title: "", message: "" };
  };

  const advance = (id: string) => {
    const rx = rxs.find(r => r.id === id);
    if (!rx) return;

    const idx = steps.indexOf(rx.status);
    if (idx >= steps.length - 1) return;

    // FEFO auto-select batch when moving to pick
    if (rx.status === "verify") {
      const fefo = getFEFOBatch(rx.batches);
      if (fefo) {
        setRxs(rxs.map(r => r.id === id ? { ...r, selectedBatch: fefo.batchNo } : r));
      }
    }

    if (rx.status === "handover") {
      const check = runSafetyChecks(rx);
      if (!check.pass) {
        setBlocker({
          title: check.title,
          message: check.message,
          action: () => {
            setBlocker(null);
            setRxs(rxs.map(r => r.id === id ? { ...r, status: "done" } : r));
            toast(`${rx.rxId} dispensed with override`, "success");
          },
        });
        return;
      }
      toast(`${rx.rxId} dispensed successfully`, "success");
    }

    setRxs(rxs.map(r => r.id === id ? { ...r, status: steps[idx + 1] } : r));
  };

  const filtered = rxs.filter(r =>
    r.patient.toLowerCase().includes(search.toLowerCase()) ||
    r.rxId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dispense Workflow</h1>
        <p className="text-slate-400 text-sm mt-0.5">Safety + FEFO batch picking. Rx valid for {config.validityMonths} months.</p>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search prescriptions..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
      </div>

      <div className="flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><ShieldAlert size={14} className="text-amber-500" /> Auto-checks: Rx validity, allergies, interactions, batch expiry</span>
      </div>

      <div className="space-y-4">
        {filtered.map((r) => {
          const patient = PATIENT_DB[r.patientId];
          const hasRisk = patient && (patient.allergies.length > 0 || patient.activeMeds.length > 0);
          const fefo = r.selectedBatch || (r.status !== "verify" ? getFEFOBatch(r.batches)?.batchNo : null);
          return (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <ClipboardCheck size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{r.rxId}</p>
                    <p className="text-xs text-slate-400">{r.patient} · {r.doctor} · {r.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasRisk && <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-200">RISK</span>}
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium capitalize ${
                    r.status === "done" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>{stepLabels[r.status]}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <Pill size={16} className="text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{r.medicine}</p>
                  <p className="text-xs text-slate-400">Qty: {r.qty}</p>
                </div>
                {patient && (
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Allergies</p>
                    <p className="text-xs font-medium text-slate-700">{patient.allergies.join(", ") || "None"}</p>
                  </div>
                )}
              </div>

              {/* FEFO Batch Info */}
              {fefo && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <Package size={14} className="text-blue-500" />
                  <span className="text-xs text-blue-700 font-medium">FEFO Batch: {fefo}</span>
                  <span className="text-xs text-slate-400 ml-auto">Oldest non-expired batch auto-selected</span>
                </div>
              )}

              {r.status !== "done" && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1">
                    {steps.map((s, i) => {
                      const currentIdx = steps.indexOf(r.status);
                      const isDone = i <= currentIdx;
                      return (
                        <div key={s} className="flex items-center flex-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isDone ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                            {isDone ? <CheckCircle size={12} /> : i + 1}
                          </div>
                          {i < steps.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${i < currentIdx ? "bg-blue-600" : "bg-slate-100"}`} />}
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => advance(r.id)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1">
                    {r.status === "handover" ? "Complete" : "Next"} <ChevronRight size={12} />
                  </button>
                </div>
              )}

              {r.status === "done" && (
                <div className="flex items-center gap-2">
                  <button onClick={() => toast("Label printed", "success")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-all">
                    <Printer size={12} /> Print Label
                  </button>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><CheckCircle size={12} /> Completed</span>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-12 text-slate-400">No prescriptions found</div>}
      </div>

      {blocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">{blocker.title}</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{blocker.message}</p>
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700">
              By clicking override, you confirm you have verified this with the prescribing doctor and accept full responsibility.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setBlocker(null)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={blocker.action} className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">Doctor Override</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}