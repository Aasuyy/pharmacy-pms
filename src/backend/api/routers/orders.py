from fastapi import APIRouter, HTTPException, Header
from jose import jwt, JWTError
from datetime import datetime
import sqlite3
import os

import os
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data", "pharmacy.db"))
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
SECRET_KEY = "your-super-secret-key-change-in-production"
ALGORITHM = "HS256"

router = APIRouter()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_customer_id_from_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/checkout")
async def checkout(data: dict, authorization: str = Header(None)):
    customer_id = get_customer_id_from_token(authorization)
    db = get_db()
    
    cart = db.execute("SELECT * FROM carts WHERE customer_id = ?", (customer_id,)).fetchone()
    if not cart:
        db.close()
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    items = db.execute("""
        SELECT ci.*, d.name, d.selling_price, d.discount_percent, d.stock
        FROM cart_items ci
        JOIN drugs d ON ci.drug_id = d.id
        WHERE ci.cart_id = ?
    """, (cart["id"],)).fetchall()
    
    if not items:
        db.close()
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    subtotal = 0
    for item in items:
        price = round(item["selling_price"] * (1 - item["discount_percent"]/100.0), 2)
        subtotal += price * item["quantity"]
    
    vat = round(subtotal * 0.13, 2)
    discount = data.get("discount", 0)
    grand_total = round(subtotal + vat - discount, 2)
    
    order_number = f"PH{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{customer_id}"
    cursor = db.execute("""
        INSERT INTO orders (customer_id, order_number, subtotal, vat, discount, grand_total, 
                           payment_method, shipping_address, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (customer_id, order_number, subtotal, vat, discount, grand_total,
          data.get("payment_method", "cash"), data.get("shipping_address", ""), "pending", datetime.utcnow().isoformat()))
    order_id = cursor.lastrowid
    
    for item in items:
        price = round(item["selling_price"] * (1 - item["discount_percent"]/100.0), 2)
        db.execute("INSERT INTO order_items (order_id, drug_id, quantity, price) VALUES (?, ?, ?, ?)",
                   (order_id, item["drug_id"], item["quantity"], price))
        db.execute("UPDATE drugs SET stock = stock - ? WHERE id = ?", (item["quantity"], item["drug_id"]))
    
    db.execute("DELETE FROM cart_items WHERE cart_id = ?", (cart["id"],))
    
    db.commit()
    db.close()
    return {"message": "Order placed", "order_id": order_id, "order_number": order_number}