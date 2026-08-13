from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timedelta
from jose import jwt, JWTError
import sqlite3
import hashlib
import os

import os
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data", "pharmacy.db"))
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
SECRET_KEY = "your-super-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

router = APIRouter()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(plain: str) -> str:
    return hashlib.sha256(plain.encode()).hexdigest()

def verify_password(plain, hashed):
    if not hashed:
        return False
    if len(hashed) == 64:
        return hashlib.sha256(plain.encode()).hexdigest() == hashed
    return plain == hashed

def create_token(sub: str):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": sub, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def get_customer_by_email(email: str):
    db = get_db()
    row = db.execute("SELECT * FROM customers WHERE email = ?", (email,)).fetchone()
    db.close()
    return dict(row) if row else None

def get_customer_by_id(customer_id: int):
    db = get_db()
    row = db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,)).fetchone()
    db.close()
    return dict(row) if row else None

def get_current_customer_id(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        customer_id = payload.get("sub")
        if not customer_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return int(customer_id)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/auth/register")
async def customer_register(data: dict):
    db = get_db()
    existing = db.execute("SELECT id FROM customers WHERE email = ?", (data.get("email"),)).fetchone()
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    pw_hash = hash_password(data.get("password", ""))
    cursor = db.execute("""
        INSERT INTO customers (email, password_hash, full_name, phone, city, address, is_email_verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (data.get("email"), pw_hash, data.get("full_name"), data.get("phone"), 
          data.get("city"), data.get("address"), False, datetime.utcnow().isoformat()))
    db.commit()
    customer_id = cursor.lastrowid
    db.close()
    
    token = create_token(str(customer_id))
    return {"access_token": token, "token_type": "bearer", "customer_id": customer_id}

@router.post("/auth/login")
async def customer_login(data: dict):
    customer = get_customer_by_email(data.get("email", ""))
    if not customer:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(data.get("password", ""), customer.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(str(customer["id"]))
    return {"access_token": token, "token_type": "bearer"}

@router.get("/auth/me")
async def customer_me(authorization: str = Header(None)):
    customer_id = get_current_customer_id(authorization)
    customer = get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=401, detail="Customer not found")
    return {
        "id": customer["id"],
        "email": customer["email"],
        "full_name": customer.get("full_name"),
        "phone": customer.get("phone"),
        "city": customer.get("city"),
        "address": customer.get("address"),
        "is_email_verified": bool(customer.get("is_email_verified", 0))
    }

@router.put("/auth/me")
async def customer_update(data: dict, authorization: str = Header(None)):
    customer_id = get_current_customer_id(authorization)
    db = get_db()
    db.execute("""
        UPDATE customers SET full_name = ?, phone = ?, city = ?, address = ? WHERE id = ?
    """, (data.get("full_name"), data.get("phone"), data.get("city"), data.get("address"), customer_id))
    db.commit()
    db.close()
    return {"message": "Profile updated"}

@router.get("/auth/orders")
async def customer_orders(authorization: str = Header(None)):
    customer_id = get_current_customer_id(authorization)
    db = get_db()
    orders = db.execute("""
        SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC
    """, (customer_id,)).fetchall()
    db.close()
    return [dict(o) for o in orders]
    return [dict(o) for o in orders]