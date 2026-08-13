"use client";
import { X, Printer } from "lucide-react";
import { useEffect } from "react";

interface BillItem {
  name: string;
  qty: number;
  price: number;
  gst: number;
}

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  bill: {
    id: string;
    date: string;
    items: BillItem[];
    subtotal: number;
    gst: number;
    discount: number;
    total: number;
    payment: string;
  } | null;
}

export default function InvoiceModal({ open, onClose, bill }: InvoiceModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open || !bill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto print:shadow-none print:max-w-none print:w-full" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between print:hidden">
            <h3 className="text-lg font-bold text-slate-900">Invoice Preview</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
          </div>

          <div id="invoice-print" className="space-y-4">
            <div className="text-center border-b-2 border-slate-200 pb-4">
              <h2 className="text-2xl font-bold text-slate-900">PharmaPro Pharmacy</h2>
              <p className="text-sm text-slate-500">Kathmandu, Nepal · GSTIN: 123456789</p>
              <p className="text-sm text-slate-500">Tel: 01-4XXXXXX · pharma@pro.com</p>
            </div>

            <div className="flex justify-between text-sm">
              <div>
                <p className="text-slate-400 text-xs uppercase">Bill #</p>
                <p className="font-bold text-slate-800">{bill.id}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs uppercase">Date</p>
                <p className="font-medium text-slate-800">{new Date(bill.date).toLocaleString()}</p>
              </div>
            </div>

            <table className="w-full text-sm border-t border-slate-200">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-slate-500 font-medium">Item</th>
                  <th className="text-right py-2 text-slate-500 font-medium">Qty</th>
                  <th className="text-right py-2 text-slate-500 font-medium">Rate</th>
                  <th className="text-right py-2 text-slate-500 font-medium">GST</th>
                  <th className="text-right py-2 text-slate-500 font-medium">Amt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 text-slate-800 font-medium">{item.name}</td>
                    <td className="py-2 text-right text-slate-600">{item.qty}</td>
                    <td className="py-2 text-right text-slate-600">Rs. {item.price}</td>
                    <td className="py-2 text-right text-slate-600">{item.gst}%</td>
                    <td className="py-2 text-right font-bold text-slate-800">Rs. {((item.price * item.qty) * (1 + item.gst/100)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 text-sm border-t-2 border-slate-200 pt-4">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="text-slate-800">Rs. {bill.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total GST</span><span className="text-slate-800">Rs. {bill.gst.toFixed(2)}</span></div>
              {bill.discount > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="text-emerald-600 font-medium">-Rs. {bill.discount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100"><span>Grand Total</span><span>Rs. {bill.total.toFixed(2)}</span></div>
              <div className="flex justify-between pt-1"><span className="text-slate-500">Payment Mode</span><span className="text-slate-800 font-medium capitalize">{bill.payment}</span></div>
            </div>

            <div className="text-center text-xs text-slate-400 pt-6 border-t border-slate-200">
              <p className="font-medium">Thank you for your purchase!</p>
              <p className="mt-1">Medicines sold cannot be returned once dispensed.</p>
              <p className="mt-0.5">Get well soon!</p>
            </div>
          </div>

          <button onClick={() => window.print()} className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 print:hidden">
            <Printer size={16} /> Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}