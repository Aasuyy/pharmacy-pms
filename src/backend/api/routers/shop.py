from fastapi import APIRouter, Query, HTTPException
import sqlite3

from src.backend.api.deps import get_db

router = APIRouter()

@router.get("/drugs")
async def list_drugs(search: str = Query(None), category: str = Query(None)):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        query = "SELECT * FROM drugs WHERE 1=1"
        params = []
        if search:
            query += " AND (name LIKE ? OR generic_name LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%"])
        if category:
            query += " AND category = ?"
            params.append(category)
        
        placeholder = "%s" if db_type == "postgres" else "?"
        query = query.replace("?", placeholder)
        
        cur.execute(query, params)
        rows = cur.fetchall()
        drugs = [dict(row) for row in rows]
        return {"drugs": drugs}
    finally:
        conn.close()

@router.get("/drugs/{drug_id}")
async def get_drug(drug_id: int):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        placeholder = "%s" if db_type == "postgres" else "?"
        cur.execute(f"SELECT * FROM drugs WHERE id = {placeholder}", (drug_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Drug not found")
        return dict(row)
    finally:
        conn.close()

@router.get("/categories")
async def list_categories():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT category FROM drugs WHERE category IS NOT NULL ORDER BY category")
        rows = cur.fetchall()
        cats = [row["category"] if db_type == "postgres" else row[0] for row in rows]
        return {"categories": cats}
    finally:
        conn.close()
