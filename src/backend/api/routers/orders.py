from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import os

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
async def create_order(data: OrderCreate):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        total = 0
        for item in data.items:
            placeholder = "%s" if db_type == "postgres" else "?"
            cur.execute(f"SELECT selling_price FROM drugs WHERE id = {placeholder}", (item.medicine_id,))
            row = cur.fetchone()
            if row:
                price = row["selling_price"] if db_type == "postgres" else row[0]
                total += price * item.quantity
        
        import json
        placeholder = "%s" if db_type == "postgres" else "?"
        addr = json.dumps(data.shipping_address) if db_type == "postgres" else json.dumps(data.shipping_address)
        
        cur.execute(f"""
            INSERT INTO orders (customer_id, total, status, payment_method, shipping_address, prescription_id, notes)
            VALUES ({','.join([placeholder]*7)})
        """, (1, total, 'pending', data.payment_method, addr, data.prescription_id, data.notes))
        
        conn.commit()
        return {"message": "Order created", "order_id": 1, "total": total}
    finally:
        conn.close()

@router.get("/")
async def list_orders():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM orders ORDER BY created_at DESC")
        rows = cur.fetchall()
        return {"orders": [dict(row) for row in rows]}
    finally:
        conn.close()
