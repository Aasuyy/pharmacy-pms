#!/usr/bin/env python3
"""
Terminal App — Basic Version (Step 1)
Pure Python CLI with JSON storage. Zero dependencies.
Run: python src/terminal/pharmacy_basic.py
"""

import json
import os
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), "../../data")
os.makedirs(DATA_DIR, exist_ok=True)

FILES = {
    "drugs": os.path.join(DATA_DIR, "drugs.json"),
    "patients": os.path.join(DATA_DIR, "patients.json"),
    "prescriptions": os.path.join(DATA_DIR, "prescriptions.json"),
    "sales": os.path.join(DATA_DIR, "sales.json"),
}

def load(file):
    if not os.path.exists(file):
        return []
    with open(file) as f:
        return json.load(f)

def save(file, data):
    with open(file, "w") as f:
        json.dump(data, f, indent=2)

def gid(data, prefix):
    return f"{prefix}-{len(data)+1:04d}"

def ask(prompt, req=True):
    while True:
        v = input(f"  {prompt}: ").strip()
        if v or not req:
            return v
        print("    [Required]")

class App:
    def __init__(self):
        self.drugs = load(FILES["drugs"])
        self.patients = load(FILES["patients"])
        self.prescriptions = load(FILES["prescriptions"])
        self.sales = load(FILES["sales"])

    def save_all(self):
        for k, v in [("drugs", self.drugs), ("patients", self.patients),
                     ("prescriptions", self.prescriptions), ("sales", self.sales)]:
            save(FILES[k], v)

    def header(self, title):
        os.system("cls" if os.name == "nt" else "clear")
        print("\n" + "=" * 50)
        print(f"  PHARMACY PMS — {title}")
        print("=" * 50 + "\n")

    def menu(self):
        print("""
  [1] Add Drug       [6]  Register Patient
  [2] View Drugs     [7]  View Patients
  [3] Search Drug    [8]  Create Prescription
  [4] Update Stock   [9]  View Prescriptions
  [5] Expiry Alerts  [10] Dispense RX
  [11] Quick Sale    [12] Daily Report
  [0] Exit
        """)

    def add_drug(self):
        self.header("ADD DRUG")
        d = {
            "id": gid(self.drugs, "DRG"),
            "name": ask("Name"),
            "generic": ask("Generic"),
            "batch": ask("Batch"),
            "expiry": ask("Expiry (YYYY-MM-DD)"),
            "stock": int(ask("Stock")),
            "price": float(ask("Price")),
            "reorder": int(ask("Reorder Level")),
            "created": datetime.now().isoformat()
        }
        self.drugs.append(d)
        self.save_all()
        print(f"\n  ✓ Added: {d['id']}")
        input("\n  Enter...")

    def view_drugs(self):
        self.header("DRUG INVENTORY")
        print(f"  {'ID':<10} {'Name':<20} {'Stock':<8} {'Price':<10}")
        print("  " + "-" * 50)
        for d in self.drugs:
            alert = " [LOW]" if d['stock'] <= d.get('reorder', 10) else ""
            print(f"  {d['id']:<10} {d['name'][:18]:<20} {d['stock']:<8} ${d['price']:<9.2f}{alert}")
        input("\n  Enter...")

    def add_patient(self):
        self.header("REGISTER PATIENT")
        p = {
            "id": gid(self.patients, "PAT"),
            "name": ask("Name"),
            "phone": ask("Phone"),
            "allergies": ask("Allergies", req=False),
            "created": datetime.now().isoformat()
        }
        self.patients.append(p)
        self.save_all()
        print(f"\n  ✓ Registered: {p['id']}")
        input("\n  Enter...")

    def create_rx(self):
        self.header("CREATE PRESCRIPTION")
        self.view_patients_brief()
        pat = ask("\n  Patient ID")
        patient = next((p for p in self.patients if p['id'] == pat), None)
        if not patient:
            print("  ✗ Not found"); input(); return

        items = []
        while True:
            self.view_drugs_brief()
            did = ask("\n  Drug ID (or 'done')")
            if did.lower() == 'done': break
            drug = next((d for d in self.drugs if d['id'] == did), None)
            if not drug: print("  ✗ Not found"); continue
            qty = int(ask(f"  Qty (avail: {drug['stock']})"))
            if qty > drug['stock']: print("  ✗ No stock"); continue
            items.append({"drug_id": did, "name": drug['name'], "qty": qty, "price": drug['price']})
            drug['stock'] -= qty

        if items:
            rx = {
                "id": gid(self.prescriptions, "RX"),
                "patient_id": pat,
                "patient_name": patient['name'],
                "doctor": ask("Doctor"),
                "items": items,
                "total": sum(i['qty']*i['price'] for i in items),
                "status": "pending",
                "created": datetime.now().isoformat()
            }
            self.prescriptions.append(rx)
            self.save_all()
            print(f"\n  ✓ RX: {rx['id']} | Total: ${rx['total']:.2f}")
        input("\n  Enter...")

    def view_patients_brief(self):
        print(f"\n  {'ID':<10} {'Name':<25}")
        print("  " + "-" * 35)
        for p in self.patients:
            print(f"  {p['id']:<10} {p['name'][:23]:<25}")

    def view_drugs_brief(self):
        print(f"\n  {'ID':<10} {'Name':<20} {'Stock':<8}")
        print("  " + "-" * 40)
        for d in self.drugs:
            print(f"  {d['id']:<10} {d['name'][:18]:<20} {d['stock']:<8}")

    def dispense(self):
        self.header("DISPENSE PRESCRIPTION")
        for rx in self.prescriptions:
            print(f"  {rx['id']} | {rx['patient_name']} | ${rx['total']:.2f} | {rx['status']}")
        rid = ask("\n  RX ID")
        rx = next((r for r in self.prescriptions if r['id'] == rid), None)
        if rx and rx['status'] == 'pending':
            rx['status'] = 'dispensed'
            rx['dispensed'] = datetime.now().isoformat()
            self.save_all()
            print("  ✓ Dispensed")
        else:
            print("  ✗ Invalid")
        input("\n  Enter...")

    def quick_sale(self):
        self.header("QUICK SALE")
        items = []
        while True:
            self.view_drugs_brief()
            did = ask("\n  Drug ID (or 'done')")
            if did.lower() == 'done': break
            drug = next((d for d in self.drugs if d['id'] == did), None)
            if not drug: continue
            qty = int(ask("  Qty"))
            if qty > drug['stock']: print("  ✗ No stock"); continue
            items.append({"drug_id": did, "name": drug['name'], "qty": qty, "price": drug['price']})
            drug['stock'] -= qty

        if items:
            total = sum(i['qty']*i['price'] for i in items)
            sale = {
                "id": gid(self.sales, "SALE"),
                "items": items,
                "total": total,
                "payment": ask("Payment (Cash/Card)"),
                "created": datetime.now().isoformat()
            }
            self.sales.append(sale)
            self.save_all()
            print(f"\n  ✓ Sale: {sale['id']} | ${total:.2f}")
            self.print_receipt(sale)
        input("\n  Enter...")

    def print_receipt(self, sale):
        print("\n  +" + "-" * 30 + "+")
        print("  |      PHARMACY RECEIPT      |")
        print("  +" + "-" * 30 + "+")
        print(f"  | {sale['id']:<26} |")
        for i in sale['items']:
            print(f"  | {i['qty']}x {i['name'][:18]:<18} ${i['qty']*i['price']:.2f} |")
        print("  +" + "-" * 30 + "+")
        print(f"  | TOTAL: ${sale['total']:.2f}{' '*15} |")
        print("  +" + "-" * 30 + "+")

    def daily_report(self):
        self.header("DAILY REPORT")
        today = datetime.now().strftime("%Y-%m-%d")
        sales_today = [s for s in self.sales if s['created'].startswith(today)]
        total = sum(s['total'] for s in sales_today)
        print(f"\n  Date: {today}")
        print(f"  Sales: {len(sales_today)}")
        print(f"  Revenue: ${total:.2f}")
        input("\n  Enter...")

    def expiry_alerts(self):
        self.header("EXPIRY ALERTS")
        today = datetime.now().date()
        cutoff = today + timedelta(days=30)
        for d in self.drugs:
            exp = datetime.strptime(d['expiry'], "%Y-%m-%d").date()
            if exp <= cutoff:
                days = (exp - today).days
                status = "EXPIRED" if days < 0 else f"{days}d left"
                print(f"  {d['id']} | {d['name'][:20]} | {status}")
        input("\n  Enter...")

    def run(self):
        while True:
            self.header("MAIN MENU")
            self.menu()
            c = ask("Select")
            if c == "1": self.add_drug()
            elif c == "2": self.view_drugs()
            elif c == "5": self.expiry_alerts()
            elif c == "6": self.add_patient()
            elif c == "8": self.create_rx()
            elif c == "10": self.dispense()
            elif c == "11": self.quick_sale()
            elif c == "12": self.daily_report()
            elif c == "0": print("\n  Goodbye!\n"); break
            else: print("  ✗ Invalid"); input("  Enter...")

if __name__ == "__main__":
    App().run()
