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
            send_sms(phone, msg)
        
        return {"message": "Status updated", "order_id": order_id, "status": status}
    finally:
        conn.close()

