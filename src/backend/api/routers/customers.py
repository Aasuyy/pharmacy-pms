from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import hashlib
import secrets
import json

from src.backend.api.deps import get_db

router = APIRouter()

class CustomerRegister(BaseModel):
    email: str
    password: str
    full_name: str
    phone: str = ""
    address: str = ""
    city: str = "Kathmandu"

class CustomerLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register_customer(data: CustomerRegister):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        pw_hash = hashlib.sha256(data.password.encode()).hexdigest()
        ph = "%s" if db_type == "postgres" else "?"
        
        try:
            cur.execute(f"INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ({','.join([ph]*5)})",
                       (data.email, pw_hash, data.full_name, data.phone, 'customer'))
            conn.commit()
        except Exception:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        cur.execute(f"SELECT id FROM users WHERE email = {ph}", (data.email,))
        row = cur.fetchone()
        user_id = row["id"] if db_type == "postgres" else row[0]
        
        cur.execute(f"INSERT INTO customers (user_id, address, city) VALUES ({','.join([ph]*3)})",
                   (user_id, data.address, data.city))
        conn.commit()
        return {"message": "Customer registered", "customer_id": user_id}
    finally:
        conn.close()

@router.post("/login")
async def login_customer(data: CustomerLogin):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        pw_hash = hashlib.sha256(data.password.encode()).hexdigest()
        ph = "%s" if db_type == "postgres" else "?"
        
        cur.execute(f"SELECT id, email, full_name, role FROM users WHERE email = {ph} AND password_hash = {ph}",
                   (data.email, pw_hash))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user = dict(row)
        token = secrets.token_urlsafe(32)
        return {"token": token, "user": user}
    finally:
        conn.close()

@router.get("/me")
async def get_me():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        cur.execute(f"SELECT u.id, u.email, u.full_name, u.phone, u.role, c.address, c.city FROM users u LEFT JOIN customers c ON u.id = c.user_id LIMIT 1")
        row = cur.fetchone()
        if not row:
            return {"id": 1, "email": "guest@pharmapro.com", "full_name": "Guest User", "phone": "", "role": "customer", "address": "", "city": "Kathmandu"}
        return dict(row)
    finally:
        conn.close()

@router.get("/orders")
async def get_customer_orders():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        cur.execute("SELECT * FROM orders ORDER BY created_at DESC LIMIT 20")
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

@router.get("/")
def list_customers():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, full_name, email, phone, address, city, created_at FROM customers ORDER BY id DESC")
        rows = cur.fetchall()
        customers = []
        for row in rows:
            customers.append({
                "id": row["id"],
                "full_name": row["full_name"],
                "email": row["email"],
                "phone": row["phone"],
                "address": row["address"],
                "city": row["city"],
                "created_at": row["created_at"]
            })
        return {"customers": customers}
    finally:
        conn.close()

