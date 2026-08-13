from fastapi import APIRouter, Query, HTTPException
import sqlite3
import os

import os
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data", "pharmacy.db"))
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

router = APIRouter()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@router.get("/drugs")
async def list_drugs(search: str = Query(None), category: str = Query(None)):
    db = get_db()
    query = "SELECT * FROM drugs WHERE 1=1"
    params = []
    if search:
        query += " AND (name LIKE ? OR generic_name LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    if category:
        query += " AND category = ?"
        params.append(category)
    query += " ORDER BY name"
    rows = db.execute(query, params).fetchall()
    db.close()
    return {"drugs": [dict(r) for r in rows]}

@router.get("/drugs/{drug_id}")
async def get_drug(drug_id: int):
    db = get_db()
    row = db.execute("SELECT * FROM drugs WHERE id = ?", (drug_id,)).fetchone()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail="Drug not found")
    return dict(row)