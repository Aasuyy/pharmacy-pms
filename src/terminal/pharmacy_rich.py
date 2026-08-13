#!/usr/bin/env python3
"""
Terminal App — Rich UI Version (Step 3)
Beautiful terminal interface with colors, tables, and dashboards.
Requirements: pip install rich
Run: python src/terminal/pharmacy_rich.py
"""

import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.layout import Layout
from rich import box
from rich.prompt import Prompt, IntPrompt, FloatPrompt
from rich.text import Text

from src.backend.core.database import db
from src.backend.core.auth import AuthManager

console = Console()

class RichTerminalApp:
    def __init__(self):
        self.auth = AuthManager(db)
        self.current_user = None

    def clear(self):
        console.clear()

    def header(self, title=""):
        self.clear()
        t = Text()
        t.append("💊 PHARMACY PMS v3.0", style="bold cyan")
        if title:
            t.append(f"\n   {title}", style="bold yellow")
        console.print(Panel(t, border_style="cyan", padding=(1, 2)))
        if self.current_user:
            console.print(f"[dim]User: {self.current_user['full_name']} ({self.current_user['role']})[/dim]\n")

    def login(self):
        self.header("LOGIN")
        console.print("[dim]Default: admin / admin123[/dim]\n")
        for i in range(3, 0, -1):
            u = Prompt.ask("  Username", default="admin")
            p = Prompt.ask("  Password", password=True, default="admin123")
            if self.auth.authenticate_user(u, p):
                self.current_user = self.auth.get_user_by_username(u)
                console.print(f"[green]\n  ✓ Welcome, {self.current_user['full_name']}![/green]")
                Prompt.ask("  Enter", default="")
                return True
            console.print(f"[red]  ✗ Wrong. {i-1} tries left.[/red]")
        return False

    def dashboard(self):
        self.header("DASHBOARD")
        from datetime import datetime, timedelta

        with db.transaction() as conn:
            cursor = conn.execute("SELECT COUNT(*) as c FROM drugs")
            total_drugs = cursor.fetchone()["c"]
            cursor = conn.execute("SELECT COUNT(*) as c FROM drugs WHERE stock_quantity <= reorder_level")
            low = cursor.fetchone()["c"]
            cutoff = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
            cursor = conn.execute("SELECT COUNT(*) as c FROM drugs WHERE expiry_date <= ?", (cutoff,))
            exp = cursor.fetchone()["c"]
            today = datetime.now().strftime("%Y-%m-%d")
            cursor = conn.execute("SELECT COALESCE(SUM(total_amount), 0) as t FROM sales WHERE date(created_at) = ?", (today,))
            rev = cursor.fetchone()["t"]
            cursor = conn.execute("SELECT COUNT(*) as c FROM prescriptions WHERE status = 'pending'")
            pending = cursor.fetchone()["c"]

        layout = Layout()
        layout.split_column(Layout(name="top", size=8), Layout(name="bottom"))
        layout["top"].split_row(
            Layout(Panel(f"[blue]{total_drugs}[/blue]\nDrugs", title="📦", border_style="blue")),
            Layout(Panel(f"[red]{low}[/red]\nLow Stock", title="⚠️", border_style="red")),
            Layout(Panel(f"[yellow]{exp}[/yellow]\nExpiring", title="📅", border_style="yellow")),
            Layout(Panel(f"[green]${rev:.2f}[/green]\nRevenue", title="💰", border_style="green")),
            Layout(Panel(f"[magenta]{pending}[/magenta]\nPending RX", title="📝", border_style="magenta"))
        )

        # Recent prescriptions
        with db.transaction() as conn:
            cursor = conn.execute("""
                SELECT p.*, pt.name as patient_name 
                FROM prescriptions p JOIN patients pt ON p.patient_id = pt.id 
                ORDER BY p.created_at DESC LIMIT 5
            """)
            rx_list = [dict(row) for row in cursor.fetchall()]

        table = Table(title="Recent Prescriptions", box=box.ROUNDED, border_style="magenta")
        table.add_column("RX", style="cyan")
        table.add_column("Patient", style="white")
        table.add_column("Total", justify="right", style="green")
        table.add_column("Status", style="yellow")
        for rx in rx_list:
            c = "green" if rx['status'] == 'dispensed' else "orange3"
            table.add_row(rx['rx_code'], rx['patient_name'], f"${rx['total_amount']:.2f}", f"[{c}]{rx['status']}[/{c}]")
        layout["bottom"].update(table)

        console.print(layout)
        Prompt.ask("\n  Enter", default="")

    def show_drugs(self):
        self.header("INVENTORY")
        with db.transaction() as conn:
            cursor = conn.execute("SELECT * FROM drugs ORDER BY name")
            drugs = [dict(row) for row in cursor.fetchall()]

        table = Table(box=box.ROUNDED, border_style="blue")
        table.add_column("ID", style="dim", width=5)
        table.add_column("Code", style="cyan")
        table.add_column("Name", style="white")
        table.add_column("Stock", justify="right")
        table.add_column("Price", justify="right", style="green")
        table.add_column("Expiry", style="yellow")
        table.add_column("Status", style="bold")

        for d in drugs:
            s = "[green]OK[/green]" if d['stock_quantity'] > d['reorder_level'] else "[red]LOW[/red]"
            table.add_row(str(d['id']), d['drug_code'], d['name'], str(d['stock_quantity']),
                         f"${d['unit_price']:.2f}", d['expiry_date'], s)
        console.print(table)
        Prompt.ask("\n  Enter", default="")

    def add_drug(self):
        self.header("ADD DRUG")
        from src.backend.core.models import DrugCreate
        d = DrugCreate(
            drug_code=Prompt.ask("  Code"),
            name=Prompt.ask("  Name"),
            generic_name=Prompt.ask("  Generic", default=""),
            manufacturer=Prompt.ask("  Manufacturer", default=""),
            category=Prompt.ask("  Category", choices=["Tablet","Syrup","Injection","Capsule","Cream"], default="Tablet"),
            batch_number=Prompt.ask("  Batch"),
            expiry_date=Prompt.ask("  Expiry (YYYY-MM-DD)"),
            stock_quantity=IntPrompt.ask("  Stock"),
            unit_price=FloatPrompt.ask("  Price"),
            reorder_level=IntPrompt.ask("  Reorder", default=10)
        )
        with db.transaction() as conn:
            cursor = conn.execute("""
                INSERT INTO drugs (drug_code, name, generic_name, manufacturer, category, batch_number,
                                 expiry_date, stock_quantity, unit_price, reorder_level)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (d.drug_code, d.name, d.generic_name, d.manufacturer, d.category, d.batch_number,
                  d.expiry_date, d.stock_quantity, d.unit_price, d.reorder_level))
            did = cursor.lastrowid
        console.print(f"[green]\n  ✓ Added ID: {did}[/green]")
        Prompt.ask("  Enter", default="")

    def show_patients(self):
        self.header("PATIENTS")
        with db.transaction() as conn:
            cursor = conn.execute("SELECT * FROM patients ORDER BY name")
            patients = [dict(row) for row in cursor.fetchall()]

        table = Table(box=box.ROUNDED, border_style="magenta")
        table.add_column("ID", style="dim")
        table.add_column("Code", style="cyan")
        table.add_column("Name", style="white")
        table.add_column("Phone", style="blue")
        for p in patients:
            table.add_row(str(p['id']), p['patient_code'], p['name'], p['phone'] or "N/A")
        console.print(table)
        Prompt.ask("\n  Enter", default="")

    def add_patient(self):
        self.header("REGISTER PATIENT")
        from src.backend.core.models import PatientCreate
        p = PatientCreate(
            patient_code=Prompt.ask("  Code"),
            name=Prompt.ask("  Name"),
            phone=Prompt.ask("  Phone", default=""),
            email=Prompt.ask("  Email", default=""),
            date_of_birth=Prompt.ask("  DOB", default=""),
            allergies=Prompt.ask("  Allergies", default="")
        )
        with db.transaction() as conn:
            cursor = conn.execute("""
                INSERT INTO patients (patient_code, name, phone, email, date_of_birth, allergies)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (p.patient_code, p.name, p.phone, p.email, p.date_of_birth, p.allergies))
            pid = cursor.lastrowid
        console.print(f"[green]\n  ✓ Registered ID: {pid}[/green]")
        Prompt.ask("  Enter", default="")

    def create_rx(self):
        self.header("CREATE PRESCRIPTION")
        self.show_patients()
        pat_id = IntPrompt.ask("\n  Patient ID")
        doctor = Prompt.ask("  Doctor")

        items = []
        while True:
            self.show_drugs()
            did = Prompt.ask("\n  Drug ID (or 'done')", default="done")
            if did.lower() == 'done': break
            qty = IntPrompt.ask("  Qty")
            price = FloatPrompt.ask("  Unit Price")
            items.append({"drug_id": int(did), "qty": qty, "price": price})

        if items:
            total = sum(i['qty']*i['price'] for i in items)
            with db.transaction() as conn:
                cursor = conn.execute("SELECT COUNT(*) as c FROM prescriptions")
                count = cursor.fetchone()["c"] + 1
                rx_code = f"RX-{count:06d}"
                cursor = conn.execute("""
                    INSERT INTO prescriptions (rx_code, patient_id, doctor_name, total_amount, created_by)
                    VALUES (?, ?, ?, ?, ?)
                """, (rx_code, pat_id, doctor, total, self.current_user['id']))
                rx_id = cursor.lastrowid
                for item in items:
                    conn.execute("""
                        INSERT INTO prescription_items (prescription_id, drug_id, quantity, unit_price, total_price)
                        VALUES (?, ?, ?, ?, ?)
                    """, (rx_id, item['drug_id'], item['qty'], item['price'], item['qty']*item['price']))
                    conn.execute("UPDATE drugs SET stock_quantity = stock_quantity - ? WHERE id = ?",
                               (item['qty'], item['drug_id']))
            console.print(f"[green]\n  ✓ RX: {rx_code} | ${total:.2f}[/green]")
        Prompt.ask("  Enter", default="")

    def show_prescriptions(self):
        self.header("PRESCRIPTIONS")
        with db.transaction() as conn:
            cursor = conn.execute("""
                SELECT p.*, pt.name as patient_name 
                FROM prescriptions p JOIN patients pt ON p.patient_id = pt.id 
                ORDER BY p.created_at DESC
            """)
            rx_list = [dict(row) for row in cursor.fetchall()]

        table = Table(box=box.ROUNDED, border_style="magenta")
        table.add_column("RX", style="cyan")
        table.add_column("Patient", style="white")
        table.add_column("Total", justify="right", style="green")
        table.add_column("Status", style="bold")
        for rx in rx_list:
            c = "green" if rx['status'] == 'dispensed' else "orange3"
            table.add_row(rx['rx_code'], rx['patient_name'], f"${rx['total_amount']:.2f}", f"[{c}]{rx['status']}[/{c}]")
        console.print(table)
        Prompt.ask("\n  Enter", default="")

    def dispense(self):
        self.header("DISPENSE")
        self.show_prescriptions()
        rx_id = IntPrompt.ask("\n  RX ID")
        with db.transaction() as conn:
            cursor = conn.execute("SELECT status FROM prescriptions WHERE id = ?", (rx_id,))
            row = cursor.fetchone()
            if row and row['status'] == 'pending':
                conn.execute("UPDATE prescriptions SET status='dispensed', dispensed_at=CURRENT_TIMESTAMP WHERE id=?", (rx_id,))
                console.print("[green]  ✓ Dispensed[/green]")
            else:
                console.print("[red]  ✗ Cannot dispense[/red]")
        Prompt.ask("  Enter", default="")

    def quick_sale(self):
        self.header("QUICK SALE")
        items = []
        while True:
            self.show_drugs()
            did = Prompt.ask("\n  Drug ID (or 'done')", default="done")
            if did.lower() == 'done': break
            qty = IntPrompt.ask("  Qty")
            price = FloatPrompt.ask("  Price")
            items.append({"drug_id": int(did), "qty": qty, "price": price})

        if items:
            total = sum(i['qty']*i['price'] for i in items)
            payment = Prompt.ask("  Payment", choices=["Cash","Card","Insurance","Mobile"], default="Cash")
            with db.transaction() as conn:
                cursor = conn.execute("SELECT COUNT(*) as c FROM sales")
                count = cursor.fetchone()["c"] + 1
                sale_code = f"SALE-{count:06d}"
                cursor = conn.execute("""
                    INSERT INTO sales (sale_code, total_amount, payment_method, created_by)
                    VALUES (?, ?, ?, ?)
                """, (sale_code, total, payment, self.current_user['id']))
                sale_id = cursor.lastrowid
                for item in items:
                    conn.execute("""
                        INSERT INTO sale_items (sale_id, drug_id, quantity, unit_price, total_price)
                        VALUES (?, ?, ?, ?, ?)
                    """, (sale_id, item['drug_id'], item['qty'], item['price'], item['qty']*item['price']))
                    conn.execute("UPDATE drugs SET stock_quantity = stock_quantity - ? WHERE id = ?",
                               (item['qty'], item['drug_id']))

            # Receipt
            r = Table(box=box.DOUBLE_EDGE, border_style="green", width=45)
            r.add_column(justify="center")
            r.add_row("[bold green]RECEIPT[/bold green]")
            r.add_row(f"[dim]{sale_code}[/dim]")
            for i in items:
                r.add_row(f"{i['qty']}x Drug#{i['drug_id']}  [bold]${i['qty']*i['price']:.2f}[/bold]")
            r.add_row(f"[bold]TOTAL: ${total:.2f}[/bold]")
            r.add_row(f"Payment: {payment}")
            console.print(Panel(r, border_style="green"))
        Prompt.ask("  Enter", default="")

    def daily_report(self):
        self.header("DAILY REPORT")
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        with db.transaction() as conn:
            cursor = conn.execute("SELECT * FROM sales WHERE date(created_at) = ?", (today,))
            sales = [dict(row) for row in cursor.fetchall()]
        total = sum(s['total_amount'] for s in sales)
        console.print(Panel(f"[bold]Date:[/bold] {today}\n[bold]Sales:[/bold] {len(sales)}\n[bold]Revenue:[/bold] [green]${total:.2f}[/green]", title="📊", border_style="green"))
        Prompt.ask("  Enter", default="")

    def menu(self):
        self.clear()
        self.header()
        console.print("""
[bold cyan]  MAIN MENU[/bold cyan]
  [1] 🏠 Dashboard          [7]  ➕ Register Patient
  [2] 📦 View Drugs         [8]  📝 Create RX
  [3] ➕ Add Drug           [9]  📋 View RX
  [4] ⚠️  Low Stock         [10] 💊 Dispense
  [5] 📅 Expiry Alerts      [11] 💰 Quick Sale
  [6] 👥 View Patients      [12] 📊 Daily Report
  [0] 🚪 Exit
        """)

    def run(self):
        if not self.login():
            return
        while True:
            self.menu()
            c = Prompt.ask("  Select", default="1")
            actions = {
                "1": self.dashboard, "2": self.show_drugs, "3": self.add_drug,
                "4": lambda: self._alerts("low"), "5": lambda: self._alerts("expiry"),
                "6": self.show_patients, "7": self.add_patient,
                "8": self.create_rx, "9": self.show_prescriptions, "10": self.dispense,
                "11": self.quick_sale, "12": self.daily_report
            }
            if c == "0":
                console.print("\n[dim]Goodbye![/dim]\n"); break
            elif c in actions:
                actions[c]()
            else:
                console.print("[red]Invalid[/red]"); Prompt.ask("Enter", default="")

    def _alerts(self, alert_type):
        from datetime import datetime, timedelta
        self.header(alert_type.upper() + " ALERTS")
        with db.transaction() as conn:
            if alert_type == "low":
                cursor = conn.execute("SELECT * FROM drugs WHERE stock_quantity <= reorder_level")
            else:
                cutoff = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
                cursor = conn.execute("SELECT * FROM drugs WHERE expiry_date <= ? ORDER BY expiry_date", (cutoff,))
            drugs = [dict(row) for row in cursor.fetchall()]

        if not drugs:
            console.print(Panel("[green]All clear![/green]", border_style="green"))
        else:
            table = Table(box=box.ROUNDED, border_style="red" if alert_type=="low" else "yellow")
            table.add_column("Code", style="cyan")
            table.add_column("Name", style="white")
            table.add_column("Info", style="bold")
            for d in drugs:
                if alert_type == "low":
                    info = f"Stock: {d['stock_quantity']} / Reorder: {d['reorder_level']}"
                else:
                    info = f"Expires: {d['expiry_date']}"
                table.add_row(d['drug_code'], d['name'], info)
            console.print(table)
        Prompt.ask("\n  Enter", default="")

if __name__ == "__main__":
    RichTerminalApp().run()
