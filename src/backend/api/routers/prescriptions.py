from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from src.backend.api.deps import get_db
import os

router = APIRouter(tags=["Prescriptions"])

class PrescriptionCreate(BaseModel):
    customer_id: int
    notes: Optional[str] = ""

@router.post("/")
async def create_prescription(customer_id: int = Form(...), notes: str = Form(""), file: UploadFile = File(...)):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        # Save file info (in production, upload to cloud storage)
        image_url = f"/uploads/{file.filename}"
        ph = "%s" if db_type == "postgres" else "?"
        cur.execute(f"INSERT INTO prescriptions (customer_id, image_url, notes) VALUES ({ph}, {ph}, {ph}) RETURNING id",
                    (customer_id, image_url, notes))
        result = cur.fetchone()
        conn.commit()
        return {"message": "Prescription uploaded", "id": result[0] if result else None, "image_url": image_url}
    finally:
        conn.close()

@router.get("/")
async def get_prescriptions():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM prescriptions ORDER BY created_at DESC")
        rows = cur.fetchall()
        return {"prescriptions": [dict(row) for row in rows]}
    finally:
        conn.close()

@router.patch("/{prescription_id}/status")
async def update_prescription_status(prescription_id: int, status: str):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        cur.execute(f"UPDATE prescriptions SET status = {ph} WHERE id = {ph}", (status, prescription_id))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Prescription not found")
        return {"message": "Status updated", "id": prescription_id, "status": status}
    finally:
        conn.close()

@router.patch("/{prescription_id}/status")
def update_prescription_status(prescription_id: int, status: str):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        
        # Validate status
        if status not in ["pending", "approved", "rejected"]:
            raise HTTPException(status_code=400, detail="Invalid status. Must be pending, approved, or rejected")
        
        cur.execute(f"UPDATE prescriptions SET status = {ph} WHERE id = {ph}", (status, prescription_id))
        conn.commit()
        
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Prescription not found")
        
        return {"message": f"Prescription {status}", "id": prescription_id, "status": status}
    finally:
        conn.close()

