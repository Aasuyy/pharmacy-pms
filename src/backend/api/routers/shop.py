from fastapi import APIRouter, HTTPException
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
        
        low_stock = []
        try:
            cur.execute("SELECT id, name, COALESCE(brand, ''), stock_quantity, price FROM drugs WHERE stock_quantity < 10 ORDER BY stock_quantity ASC")
            for r in cur.fetchall():
                low_stock.append({
                    "id": r[0],
                    "name": r[1],
                    "brand": r[2],
                    "stock_quantity": r[3],
                    "price": float(r[4]) if r[4] is not None else 0.0
                })
        except Exception as e:
            print(f"Low stock error: {e}")

        expiring_soon = []
        try:
            if db_type == "postgres":
                cur.execute("SELECT id, name, COALESCE(brand, ''), expiry_date, stock_quantity FROM drugs WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days' ORDER BY expiry_date ASC")
            else:
                cur.execute("SELECT id, name, COALESCE(brand, ''), expiry_date, stock_quantity FROM drugs WHERE expiry_date <= date('now', '+30 days') ORDER BY expiry_date ASC")
            for r in cur.fetchall():
                expiring_soon.append({
                    "id": r[0],
                    "name": r[1],
                    "brand": r[2],
                    "expiry_date": str(r[3]) if r[3] else None,
                    "stock_quantity": r[4]
                })
        except Exception as e:
            print(f"Expiry error: {e}")

        return {
            "low_stock": low_stock,
            "expiring_soon": expiring_soon,
            "total_alerts": len(low_stock) + len(expiring_soon)
        }
    except Exception as general_err:
        raise HTTPException(status_code=500, detail=str(general_err))
    finally:
        conn.close()

@router.get("/reports/sales")
def get_sales_report():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        
        # Total revenue & orders count
        total_orders = 0
        total_revenue = 0.0
        try:
            cur.execute("SELECT COUNT(id), COALESCE(SUM(total_amount), 0) FROM orders")
            row = cur.fetchone()
            if row:
                total_orders = row[0] or 0
                total_revenue = float(row[1]) if row[1] is not None else 0.0
        except Exception as e:
            print(f"Revenue count error: {e}")

        # Top selling drugs
        top_drugs = []
        try:
            cur.execute("""
                SELECT d.name, SUM(oi.quantity) AS total_qty, SUM(oi.quantity * oi.price) AS total_sales
                FROM order_items oi
                JOIN drugs d ON oi.drug_id = d.id
                GROUP BY d.name
                ORDER BY total_qty DESC
                LIMIT 5
            """)
            for r in cur.fetchall():
                top_drugs.append({
                    "name": r[0],
                    "total_quantity": int(r[1]) if r[1] is not None else 0,
                    "total_sales": float(r[2]) if r[2] is not None else 0.0
                })
        except Exception as e:
            print(f"Top drugs report query error: {e}")

        return {
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "top_drugs": top_drugs
        }
    except Exception as general_err:
        raise HTTPException(status_code=500, detail=str(general_err))
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

        if db_type == "postgres":
            cur.execute("INSERT INTO orders (total_amount, status) VALUES (%s, 'completed') RETURNING id", (total,))
            order_id = cur.fetchone()[0]
        else:
            cur.execute("INSERT INTO orders (total_amount, status) VALUES (?, 'completed')", (total,))
            order_id = cur.lastrowid

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
