"""Prescription router."""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import sqlite3

from src.backend.api.deps import get_current_user, require_role, DB_PATH, UserOut

router = APIRouter()

class RxItem(BaseModel):
    drug_id: int
    quantity: int
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None

class PrescriptionCreate(BaseModel):
    patient_id: int
    doctor_name: Optional[str] = None
    doctor_license: Optional[str] = None
    diagnosis: Optional[str] = None
    items: List[RxItem]
    status: str = "pending"  # pending, filled, cancelled

class PrescriptionOut(PrescriptionCreate):
    id: int
    rx_code: Optional[str] = None
    created_at: Optional[str] = None
    filled_at: Optional[str] = None
    filled_by: Optional[int] = None

@router.get("/", response_model=List[PrescriptionOut])
async def list_prescriptions(
    patient_id: Optional[int] = None,
    status: Optional[str] = None,
    current_user: UserOut = Depends(get_current_user)
):
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    query = "SELECT * FROM prescriptions WHERE 1=1"
    params = []
    if patient_id:
        query += " AND patient_id = ?"
        params.append(patient_id)
    if status:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY created_at DESC"
    rows = db.execute(query, params).fetchall()
    db.close()
    return [dict(r) for r in rows]

@router.post("/", response_model=PrescriptionOut, status_code=201)
async def create_prescription(
    rx: PrescriptionCreate,
    current_user: UserOut = Depends(require_role("admin", "pharmacist", "technician"))
):
    db = sqlite3.connect(DB_PATH)
    rx_code = f"RX-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    cursor = db.execute(
        """INSERT INTO prescriptions (rx_code, patient_id, doctor_name, doctor_license, diagnosis, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (rx_code, rx.patient_id, rx.doctor_name, rx.doctor_license, rx.diagnosis, rx.status, current_user.id)
    )
    rx_id = cursor.lastrowid
    for item in rx.items:
        db.execute(
            """INSERT INTO prescription_items (prescription_id, drug_id, quantity, dosage, frequency, duration, instructions)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (rx_id, item.drug_id, item.quantity, item.dosage, item.frequency, item.duration, item.instructions)
        )
    db.commit()
    db.close()
    return {**rx.dict(), "id": rx_id, "rx_code": rx_code, "created_at": datetime.now().isoformat()}

@router.post("/{rx_id}/dispense")
async def dispense_prescription(
    rx_id: int,
    current_user: UserOut = Depends(require_role("admin", "pharmacist"))
):
    db = sqlite3.connect(DB_PATH)
    db.execute(
        "UPDATE prescriptions SET status = 'filled', filled_at = ?, filled_by = ? WHERE id = ?",
        (datetime.now().isoformat(), current_user.id, rx_id)
    )
    db.commit()
    db.close()
    return {"message": "Prescription dispensed"}