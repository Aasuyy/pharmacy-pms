from fastapi import APIRouter, HTTPException, Header
from jose import jwt, JWTError
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

@router.post("/register")
async def register_vendor(data: dict, authorization: str = Header(None)):
    customer_id = get_customer_id_from_token(authorization)
    db = get_db()
    existing = db.execute("SELECT id FROM vendors WHERE customer_id = ?", (customer_id,)).fetchone()
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="Already a vendor")
    
    db.execute("""
        INSERT INTO vendors (customer_id, business_name, business_address, business_phone, 
                            business_email, pan_number, is_verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    """, (customer_id, data.get("business_name"), data.get("business_address"),
          data.get("business_phone"), data.get("business_email"), data.get("pan_number"), False))
    db.commit()
    db.close()
    return {"message": "Vendor application submitted"}

@router.get("/my-store")
async def my_store(authorization: str = Header(None)):
    customer_id = get_customer_id_from_token(authorization)
    db = get_db()
    vendor = db.execute("SELECT * FROM vendors WHERE customer_id = ?", (customer_id,)).fetchone()
    if not vendor:
        db.close()
        raise HTTPException(status_code=404, detail="Not a vendor")
    
    drugs = db.execute("SELECT * FROM drugs WHERE vendor_id = ?", (vendor["id"],)).fetchall()
    sales = db.execute("SELECT COUNT(*) as count, COALESCE(SUM(grand_total), 0) as total FROM orders WHERE vendor_id = ?", (vendor["id"],)).fetchone()
    
    db.close()
    return {
        "business_name": vendor["business_name"],
        "business_address": vendor["business_address"],
        "rating": vendor.get("rating", 0) or 0,
        "total_sales": sales["total"] or 0,
        "drugs": [dict(d) for d in drugs]
    }