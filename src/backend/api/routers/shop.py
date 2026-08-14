from fastapi import APIRouter, Query, HTTPException
import sqlite3
import os

from src.backend.api.deps import DB_PATH, get_db

router = APIRouter()

# Using get_db from deps

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
@router.get("/categories")
async def list_categories():
    db = get_db()
    rows = db.execute("SELECT DISTINCT category FROM drugs WHERE category IS NOT NULL ORDER BY category").fetchall()
    db.close()
    return {"categories": [r["category"] for r in rows]}
