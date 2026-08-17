from fastapi import APIRouter, HTTPException
from src.backend.api.deps import get_db
import hashlib

router = APIRouter(tags=["Staff"])

@router.get("/members")
def list_staff():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM staff_members ORDER BY id DESC")
        cols = [desc[0] for desc in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]
    finally:
        conn.close()

@router.post("/members")
def add_staff(data: dict):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        pwd = hashlib.sha256(data.get("password", "staff123").encode()).hexdigest()
        cur.execute(
            f"INSERT INTO staff_members (full_name, email, phone, role, password_hash) VALUES ({ph}, {ph}, {ph}, {ph}, {ph})",
            (data["full_name"], data.get("email"), data.get("phone"), data.get("role", "staff"), pwd)
        )
        conn.commit()
        return {"message": "Staff added"}
    finally:
        conn.close()

@router.get("/shifts")
def list_shifts():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT s.*, m.full_name as staff_name FROM shifts s LEFT JOIN staff_members m ON s.staff_id = m.id ORDER BY s.id DESC")
        cols = [desc[0] for desc in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]
    finally:
        conn.close()

@router.post("/shifts")
def add_shift(data: dict):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        cur.execute(
            f"INSERT INTO shifts (staff_id, start_time, end_time, shift_date, status) VALUES ({ph}, {ph}, {ph}, {ph}, {ph})",
            (data["staff_id"], data.get("start_time"), data.get("end_time"), data.get("shift_date"), data.get("status", "active"))
        )
        conn.commit()
        return {"message": "Shift added"}
    finally:
        conn.close()

@router.post("/stock-count")
def add_stock_count(data: dict):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        # Get expected stock
        cur.execute(f"SELECT stock_quantity FROM drugs WHERE id = {ph}", (data["drug_id"],))
        row = cur.fetchone()
        expected = row[0] if row else 0
        disc = data["counted_qty"] - expected
        cur.execute(
            f"INSERT INTO stock_counts (drug_id, counted_qty, expected_qty, discrepancy, counted_by) VALUES ({ph}, {ph}, {ph}, {ph}, {ph})",
            (data["drug_id"], data["counted_qty"], expected, disc, data.get("counted_by"))
        )
        conn.commit()
        return {"message": "Stock count recorded", "discrepancy": disc}
    finally:
        conn.close()
