"""Drug inventory router."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
import sqlite3

from src.backend.api.deps import get_current_user, require_role, ws_manager, get_db, DB_PATH
from src.backend.api.deps import UserOut

router = APIRouter()

class DrugCreate(BaseModel):
    name: str
    generic_name: Optional[str] = None
    drug_code: str
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    stock: int = 0
    reorder_point: int = 10
    cost_price: float = 0.0
    selling_price: float = 0.0
    expiry_date: Optional[str] = None
    barcode: Optional[str] = None
    controlled: bool = False

class DrugOut(DrugCreate):
    id: int
    created_at: Optional[str] = None

@router.get("/", response_model=List[DrugOut])
async def list_drugs(
    search: Optional[str] = None,
    low_stock: bool = False,
    current_user: UserOut = Depends(get_current_user)
):
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    query = "SELECT * FROM drugs WHERE 1=1"
    params = []
    if search:
        query += " AND (name LIKE ? OR generic_name LIKE ? OR drug_code LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    if low_stock:
        query += " AND stock <= reorder_point"
    query += " ORDER BY name"
    rows = db.execute(query, params).fetchall()
    db.close()
    return [dict(r) for r in rows]

@router.get("/{drug_id}", response_model=DrugOut)
async def get_drug(drug_id: int, current_user: UserOut = Depends(get_current_user)):
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    row = db.execute("SELECT * FROM drugs WHERE id = ?", (drug_id,)).fetchone()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail="Drug not found")
    return dict(row)

@router.post("/", response_model=DrugOut, status_code=status.HTTP_201_CREATED)
async def create_drug(
    drug: DrugCreate,
    current_user: UserOut = Depends(require_role("admin", "pharmacist"))
):
    db = sqlite3.connect(DB_PATH)
    cursor = db.execute(
        """INSERT INTO drugs (name, generic_name, drug_code, category, manufacturer, stock,
            reorder_point, cost_price, selling_price, expiry_date, barcode, controlled)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (drug.name, drug.generic_name, drug.drug_code, drug.category, drug.manufacturer,
         drug.stock, drug.reorder_point, drug.cost_price, drug.selling_price,
         drug.expiry_date, drug.barcode, drug.controlled)
    )
    db.commit()
    drug_id = cursor.lastrowid
    db.close()
    await ws_manager.broadcast({"type": "drug_added", "drug_id": drug_id, "name": drug.name})
    return {**drug.dict(), "id": drug_id, "created_at": None}

@router.put("/{drug_id}", response_model=DrugOut)
async def update_drug(
    drug_id: int,
    drug: DrugCreate,
    current_user: UserOut = Depends(require_role("admin", "pharmacist"))
):
    db = sqlite3.connect(DB_PATH)
    db.execute(
        """UPDATE drugs SET name=?, generic_name=?, drug_code=?, category=?, manufacturer=?,
            stock=?, reorder_point=?, cost_price=?, selling_price=?, expiry_date=?,
            barcode=?, controlled=? WHERE id=?""",
        (drug.name, drug.generic_name, drug.drug_code, drug.category, drug.manufacturer,
         drug.stock, drug.reorder_point, drug.cost_price, drug.selling_price,
         drug.expiry_date, drug.barcode, drug.controlled, drug_id)
    )
    db.commit()
    db.close()
    await ws_manager.broadcast({"type": "drug_updated", "drug_id": drug_id})
    return {**drug.dict(), "id": drug_id}

@router.delete("/{drug_id}")
async def delete_drug(
    drug_id: int,
    current_user: UserOut = Depends(require_role("admin"))
):
    db = sqlite3.connect(DB_PATH)
    db.execute("DELETE FROM drugs WHERE id = ?", (drug_id,))
    db.commit()
    db.close()
    await ws_manager.broadcast({"type": "drug_deleted", "drug_id": drug_id})
    return {"message": "Drug deleted"}