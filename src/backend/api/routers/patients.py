"""Patient management router."""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import sqlite3

from src.backend.api.deps import get_current_user, require_role, DB_PATH, UserOut

router = APIRouter()

class PatientCreate(BaseModel):
    patient_code: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None

class PatientOut(PatientCreate):
    id: int
    created_at: Optional[str] = None

@router.get("/", response_model=List[PatientOut])
async def list_patients(
    search: Optional[str] = None,
    current_user: UserOut = Depends(get_current_user)
):
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    query = "SELECT * FROM patients WHERE 1=1"
    params = []
    if search:
        query += " AND (name LIKE ? OR patient_code LIKE ? OR phone LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    query += " ORDER BY name"
    rows = db.execute(query, params).fetchall()
    db.close()
    return [dict(r) for r in rows]

@router.get("/{patient_id}", response_model=PatientOut)
async def get_patient(patient_id: int, current_user: UserOut = Depends(get_current_user)):
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    row = db.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail="Patient not found")
    return dict(row)

@router.post("/", response_model=PatientOut, status_code=201)
async def create_patient(
    patient: PatientCreate,
    current_user: UserOut = Depends(require_role("admin", "pharmacist", "technician"))
):
    db = sqlite3.connect(DB_PATH)
    cursor = db.execute(
        """INSERT INTO patients (patient_code, name, age, gender, phone, email, address, allergies, medical_history)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (patient.patient_code, patient.name, patient.age, patient.gender,
         patient.phone, patient.email, patient.address, patient.allergies, patient.medical_history)
    )
    db.commit()
    patient_id = cursor.lastrowid
    db.close()
    return {**patient.dict(), "id": patient_id, "created_at": None}