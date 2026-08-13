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

def get_or_create_cart(customer_id: int):
    db = get_db()
    cart = db.execute("SELECT * FROM carts WHERE customer_id = ?", (customer_id,)).fetchone()
    if not cart:
        cursor = db.execute("INSERT INTO carts (customer_id) VALUES (?)", (customer_id,))
        db.commit()
        cart = db.execute("SELECT * FROM carts WHERE id = ?", (cursor.lastrowid,)).fetchone()
    db.close()
    return dict(cart)

@router.get("/")
async def get_cart(authorization: str = Header(None)):
    customer_id = get_customer_id_from_token(authorization)
    cart = get_or_create_cart(customer_id)
    db = get_db()
    items = db.execute("""
        SELECT ci.id, ci.quantity, d.id as drug_id, d.name, d.selling_price, d.discount_percent,
               ROUND(d.selling_price * (1 - d.discount_percent/100.0), 2) as discounted_price
        FROM cart_items ci
        JOIN drugs d ON ci.drug_id = d.id
        WHERE ci.cart_id = ?
    """, (cart["id"],)).fetchall()
    
    item_list = []
    total = 0
    for item in items:
        item_dict = dict(item)
        item_dict["item_total"] = round(item_dict["discounted_price"] * item_dict["quantity"], 2)
        total += item_dict["item_total"]
        item_list.append(item_dict)
    
    db.close()
    return {"items": item_list, "total": round(total, 2), "item_count": len(item_list)}

@router.post("/add")
async def add_to_cart(data: dict, authorization: str = Header(None)):
    customer_id = get_customer_id_from_token(authorization)
    cart = get_or_create_cart(customer_id)
    db = get_db()
    
    drug = db.execute("SELECT stock FROM drugs WHERE id = ?", (data.get("drug_id"),)).fetchone()
    if not drug:
        db.close()
        raise HTTPException(status_code=404, detail="Drug not found")
    
    existing = db.execute("SELECT * FROM cart_items WHERE cart_id = ? AND drug_id = ?", 
                          (cart["id"], data.get("drug_id"))).fetchone()
    if existing:
        new_qty = existing["quantity"] + data.get("quantity", 1)
        if new_qty > drug["stock"]:
            db.close()
            raise HTTPException(status_code=400, detail="Not enough stock")
        db.execute("UPDATE cart_items SET quantity = ? WHERE id = ?", (new_qty, existing["id"]))
    else:
        if data.get("quantity", 1) > drug["stock"]:
            db.close()
            raise HTTPException(status_code=400, detail="Not enough stock")
        db.execute("INSERT INTO cart_items (cart_id, drug_id, quantity) VALUES (?, ?, ?)",
                   (cart["id"], data.get("drug_id"), data.get("quantity", 1)))
    
    db.commit()
    db.close()
    return {"message": "Added to cart"}

@router.put("/update/{item_id}")
async def update_cart_item(item_id: int, data: dict, authorization: str = Header(None)):
    customer_id = get_customer_id_from_token(authorization)
    cart = get_or_create_cart(customer_id)
    db = get_db()
    db.execute("UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?",
               (data.get("quantity"), item_id, cart["id"]))
    db.commit()
    db.close()
    return {"message": "Updated"}

@router.delete("/remove/{item_id}")
async def remove_cart_item(item_id: int, authorization: str = Header(None)):
    customer_id = get_customer_id_from_token(authorization)
    cart = get_or_create_cart(customer_id)
    db = get_db()
    db.execute("DELETE FROM cart_items WHERE id = ? AND cart_id = ?", (item_id, cart["id"]))
    db.commit()
    db.close()
    return {"message": "Removed"}
@router.delete("/clear")
async def clear_cart(authorization: str = Header(None)):
    customer_id = get_customer_id_from_token(authorization)
    cart = get_or_create_cart(customer_id)
    db = get_db()
    db.execute("DELETE FROM cart_items WHERE cart_id = ?", (cart["id"],))
    db.commit()
    db.close()
    return {"message": "Cart cleared"}

@router.put("/update-drug/{drug_id}")
async def update_cart_by_drug(drug_id: int, data: dict, authorization: str = Header(None)):
    customer_id = get_customer_id_from_token(authorization)
    cart = get_or_create_cart(customer_id)
    db = get_db()
    db.execute("UPDATE cart_items SET quantity = ? WHERE drug_id = ? AND cart_id = ?",
               (data.get("quantity"), drug_id, cart["id"]))
    db.commit()
    db.close()
    return {"message": "Updated"}

@router.delete("/remove-drug/{drug_id}")
async def remove_cart_by_drug(drug_id: int, authorization: str = Header(None)):
    customer_id = get_customer_id_from_token(authorization)
    cart = get_or_create_cart(customer_id)
    db = get_db()
    db.execute("DELETE FROM cart_items WHERE drug_id = ? AND cart_id = ?", (drug_id, cart["id"]))
    db.commit()
    db.close()
    return {"message": "Removed"}
