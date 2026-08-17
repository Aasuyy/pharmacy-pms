from fastapi import APIRouter, HTTPException, Depends
import os
import sqlite3
import psycopg2

router = APIRouter()

def get_db():
    db_url = os.getenv("DATABASE_URL")
    if db_url and db_url.startswith("postgres"):
        conn = psycopg2.connect(db_url)
        return conn, "postgres"
    else:
        db_path = os.path.join(os.path.dirname(__file__), "../../../pharmacy.db")
        conn = sqlite3.connect(db_path)
        return conn, "sqlite"

@router.get("/alerts")
def get_inventory_alerts():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        
        # Low Stock Query (< 10 units)
        cur.execute("SELECT id, name, brand, stock_quantity, price FROM drugs WHERE stock_quantity < 10 ORDER BY stock_quantity ASC")
        cols = [desc[0] for desc in cur.description]
        low_stock = [dict(zip(cols, row)) for row in cur.fetchall()]
        
        # Expiring Soon Query (Within 30 days)
        try:
            if db_type == "postgres":
                cur.execute("SELECT id, name, brand, expiry_date, stock_quantity FROM drugs WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days' ORDER BY expiry_date ASC")
            else:
                cur.execute("SELECT id, name, brand, expiry_date, stock_quantity FROM drugs WHERE expiry_date <= date('now', '+30 days') ORDER BY expiry_date ASC")
            cols_exp = [desc[0] for desc in cur.description]
            expiring_soon = [dict(zip(cols_exp, row)) for row in cur.fetchall()]
        except Exception:
            expiring_soon = []

        return {
            "low_stock": low_stock,
            "expiring_soon": expiring_soon,
            "total_alerts": len(low_stock) + len(expiring_soon)
        }
    finally:
        conn.close()

@router.post("/pos/checkout")
def pos_checkout(payload: dict):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        items = payload.get("items", [])
        total = payload.get("total_amount", 0)
        
        if not items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        # Create Order
        if db_type == "postgres":
            cur.execute("INSERT INTO orders (total_amount, status) VALUES (%s, 'completed') RETURNING id", (total,))
            order_id = cur.fetchone()[0]
        else:
            cur.execute("INSERT INTO orders (total_amount, status) VALUES (?, 'completed')", (total,))
            order_id = cur.lastrowid

        # Deduct stock & create items
        for item in items:
            drug_id = item["id"]
            qty = item["quantity"]
            price = item["price"]

            if db_type == "postgres":
                cur.execute("UPDATE drugs SET stock_quantity = stock_quantity - %s WHERE id = %s", (qty, drug_id))
                cur.execute("INSERT INTO order_items (order_id, drug_id, quantity, price) VALUES (%s, %s, %s, %s)", (order_id, drug_id, qty, price))
            else:
                cur.execute("UPDATE drugs SET stock_quantity = stock_quantity - ? WHERE id = ?", (qty, drug_id))
                cur.execute("INSERT INTO order_items (order_id, drug_id, quantity, price) VALUES (?, ?, ?, ?)", (order_id, drug_id, qty, price))

        conn.commit()
        return {"status": "success", "order_id": order_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
