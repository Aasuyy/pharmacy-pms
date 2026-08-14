from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import sqlite3
import os

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
        import hashlib
        pw_hash = hashlib.sha256(data.password.encode()).hexdigest()
        
        placeholder = "%s" if db_type == "postgres" else "?"
        try:
            cur.execute(f"INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ({','.join([placeholder]*5)})",
                       (data.email, pw_hash, data.full_name, data.phone, 'customer'))
            conn.commit()
        except Exception as e:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        cur.execute(f"SELECT id FROM users WHERE email = {placeholder}", (data.email,))
        user_id = cur.fetchone()["id"] if db_type == "postgres" else cur.fetchone()[0]
        
        cur.execute(f"INSERT INTO customers (user_id, address, city) VALUES ({','.join([placeholder]*3)})",
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
        import hashlib
        pw_hash = hashlib.sha256(data.password.encode()).hexdigest()
        
        placeholder = "%s" if db_type == "postgres" else "?"
        cur.execute(f"SELECT id, email, full_name, role FROM users WHERE email = {placeholder} AND password_hash = {placeholder}",
                   (data.email, pw_hash))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user = dict(row)
        import secrets
        token = secrets.token_urlsafe(32)
        return {"token": token, "user": user}
    finally:
        conn.close()

@router.get("/me")
async def get_me():
    return {"message": "Customer profile endpoint"}

@router.get("/me")
async def get_current_customer():
    # Demo: return a mock customer if no auth (or implement JWT later)
    return {
        "id": 1,
        "email": "guest@pharmapro.com",
        "full_name": "Guest User",
        "phone": "",
        "role": "customer",
        "address": "",
        "city": "Kathmandu"
    }

@router.get("/orders")
async def get_customer_orders():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM orders ORDER BY created_at DESC LIMIT 20")
        rows = cur.fetchall()
        return {"orders": [dict(row) for row in rows]}
    finally:
        conn.close()
