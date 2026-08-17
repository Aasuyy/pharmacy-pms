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
        
        # Low stock query threshold <= 10
        cur.execute("SELECT id, name, stock, price FROM drugs WHERE stock <= 10")
        low_stock_rows = cur.fetchall()
        low_stock = [
            {"id": r[0], "name": r[1], "stock": r[2], "price": float(r[3])}
            for r in low_stock_rows
        ]

        # Expiring soon query
        cur.execute("SELECT id, name, stock, expiry_date FROM drugs WHERE expiry_date IS NOT NULL AND expiry_date <= '2026-09-30'")
        expiring_rows = cur.fetchall()
        expiring_soon = [
            {"id": r[0], "name": r[1], "stock": r[2], "expiry_date": str(r[3])}
            for r in expiring_rows
        ]

        return {
            "low_stock": low_stock,
            "expiring_soon": expiring_soon,
            "total_alerts": len(low_stock) + len(expiring_soon)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/reports/sales")
def get_sales_report():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*), COALESCE(SUM(total_price), 0) FROM orders")
        row = cur.fetchone()
        
        total_orders = row[0] if row else 0
        total_revenue = float(row[1]) if row and row[1] is not None else 0.0

        return {
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "top_drugs": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
