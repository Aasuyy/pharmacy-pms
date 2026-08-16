from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import io
from datetime import datetime

import os
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
import json

from src.backend.api.deps import get_db


router = APIRouter()

class OrderItem(BaseModel):
    medicine_id: str
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItem]
    shipping_address: dict
    payment_method: str
    prescription_id: Optional[str] = None
    notes: Optional[str] = None

@router.post("/checkout")
async def create_order(data: OrderCreate, authorization: Optional[str] = Header(None)):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        
        # Calculate total
        total = 0
        for item in data.items:
            ph = "%s" if db_type == "postgres" else "?"
            cur.execute(f"SELECT selling_price FROM drugs WHERE id = {ph}", (item.medicine_id,))
            row = cur.fetchone()
            if row:
                price = row["selling_price"] if db_type == "postgres" else row[0]
                total += price * item.quantity
        
        # For now, use customer_id = 1 (guest). Later extract from JWT.
        customer_id = 1
        
        ph = "%s" if db_type == "postgres" else "?"
        addr = json.dumps(data.shipping_address)
        
        cur.execute(f"""
            INSERT INTO orders (customer_id, total, status, payment_method, shipping_address, prescription_id, notes)
            VALUES ({','.join([ph]*7)})
            RETURNING id
        """ if db_type == "postgres" else f"""
            INSERT INTO orders (customer_id, total, status, payment_method, shipping_address, prescription_id, notes)
            VALUES ({','.join([ph]*7)})
        """, (customer_id, total, 'pending', data.payment_method, addr, data.prescription_id, data.notes))
        
        if db_type == "postgres":
            order_id = cur.fetchone()["id"]
        else:
            order_id = cur.lastrowid
        
        # Insert order items
        for item in data.items:
            ph = "%s" if db_type == "postgres" else "?"
            cur.execute(f"SELECT selling_price FROM drugs WHERE id = {ph}", (item.medicine_id,))
            row = cur.fetchone()
            price = row["selling_price"] if db_type == "postgres" else row[0]
            
            cur.execute(f"""
                INSERT INTO order_items (order_id, drug_id, quantity, price)
                VALUES ({','.join([ph]*4)})
            """, (order_id, item.medicine_id, item.quantity, price))
        
                    # Deduct stock for each item
            for item in data.items:
                cur.execute(f"UPDATE drugs SET stock = stock - {ph} WHERE id = {ph} AND stock >= {ph}",
                           (item.quantity, item.medicine_id, item.quantity))
                if cur.rowcount == 0:
                    conn.rollback()
                    raise HTTPException(status_code=400, detail=f"Insufficient stock for medicine ID {item.medicine_id}")
            conn.commit()
        return {"message": "Order created", "order_id": order_id, "total": total}
    finally:
        conn.close()

@router.get("/")
async def list_orders():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        cur.execute("SELECT * FROM orders ORDER BY created_at DESC")
        rows = cur.fetchall()
        orders = []
        for row in rows:
            order = dict(row)
            cur.execute(f"SELECT * FROM order_items WHERE order_id = {ph}", (order["id"],))
            items = cur.fetchall()
            order["items"] = [dict(item) for item in items]
            orders.append(order)
        return {"orders": orders}
    finally:
        conn.close()

@router.get("/{order_id}")
async def get_order(order_id: int):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        cur.execute(f"SELECT * FROM orders WHERE id = {ph}", (order_id,))
        order = cur.fetchone()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        cur.execute(f"SELECT * FROM order_items WHERE order_id = {ph}", (order_id,))
        items = cur.fetchall()
        
        result = dict(order)
        result["items"] = [dict(row) for row in items]
        return result
    finally:
        conn.close()

@router.patch("/{order_id}/status")

async def update_order_status(order_id: int, status: str):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        
        # Get order details first
        cur.execute(f"SELECT * FROM orders WHERE id = {ph}", (order_id,))
        order = cur.fetchone()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        order_dict = dict(order)
        
        # Update status
        cur.execute(f"UPDATE orders SET status = {ph} WHERE id = {ph}", (status, order_id))
        conn.commit()
        
        # Send SMS notification
        phone = order_dict.get("shipping_address", {}).get("phone") if isinstance(order_dict.get("shipping_address"), dict) else None
        if phone:
            msg = f"Hi! Your PharmaPro order #{order_id} is now {status.upper()}. Thank you for choosing us!"
            try:
                send_sms(phone, msg)
            except Exception:
                pass  # SMS not configured
        
        return {"message": "Status updated", "order_id": order_id, "status": status}
    finally:
        conn.close()

@router.get("/{order_id}/invoice")
def download_invoice(order_id: int):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        
        # Get order
        cur.execute(f"SELECT * FROM orders WHERE id = {ph}", (order_id,))
        order_row = cur.fetchone()
        if not order_row:
            raise HTTPException(status_code=404, detail="Order not found")
        order = dict(order_row)
        
        # Get customer
        customer_id = order.get("customer_id")
        cur.execute(f"SELECT full_name, email, phone, address, city FROM customers WHERE id = {ph}", (customer_id,))
        cust_row = cur.fetchone()
        customer = dict(cust_row) if cust_row else {}
        
        # Get items
        cur.execute(f"SELECT * FROM order_items WHERE order_id = {ph}", (order_id,))
        item_rows = cur.fetchall()
        items = [dict(r) for r in item_rows]
        
        # Build PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=30)
        elements = []
        styles = getSampleStyleSheet()
        
        # Header
        title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor("#1e40af"), spaceAfter=20)
        elements.append(Paragraph("PharmaPro", title_style))
        elements.append(Paragraph("Pharmacy Management System", styles['Normal']))
        elements.append(Paragraph("Kathmandu, Nepal | pharmacy@pharmapro.com", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Invoice info
        elements.append(Paragraph(f"<b>INVOICE #{order_id}</b>", styles['Heading2']))
        elements.append(Paragraph(f"Date: {order.get('created_at', datetime.now().isoformat())[:10]}", styles['Normal']))
        elements.append(Paragraph(f"Status: {order.get('status', 'N/A').upper()}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Customer info
        elements.append(Paragraph("<b>BILL TO:</b>", styles['Heading3']))
        elements.append(Paragraph(f"{customer.get('full_name', 'Guest')}", styles['Normal']))
        elements.append(Paragraph(f"{customer.get('email', '')}", styles['Normal']))
        elements.append(Paragraph(f"{customer.get('phone', '')}", styles['Normal']))
        elements.append(Paragraph(f"{customer.get('address', '')}, {customer.get('city', '')}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Items table
        table_data = [["#", "Medicine", "Qty", "Unit Price", "Total"]]
        for idx, item in enumerate(items, 1):
            table_data.append([
                str(idx),
                item.get("drug_name", "Item"),
                str(item.get("quantity", 1)),
                f"Rs. {item.get('unit_price', 0)}",
                f"Rs. {item.get('quantity', 1) * item.get('unit_price', 0)}"
            ])
        
        # Add total row
        table_data.append(["", "", "", "TOTAL", f"Rs. {order.get('total', 0)}"])
        
        table = Table(table_data, colWidths=[0.5*inch, 3*inch, 0.8*inch, 1.2*inch, 1.2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e40af")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (1, 1), (1, -2), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -2), colors.HexColor("#f8fafc")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#e2e8f0")),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 30))
        
        # Footer
        elements.append(Paragraph("<i>Thank you for choosing PharmaPro. Get well soon!</i>", styles['Italic']))
        
        doc.build(elements)
        buffer.seek(0)
        
        return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=invoice_{order_id}.pdf"})
            finally:
                conn.close()
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

