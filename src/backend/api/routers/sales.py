"""Sales / POS router."""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import sqlite3

from src.backend.api.deps import get_current_user, require_role, DB_PATH, UserOut

router = APIRouter()

class SaleItem(BaseModel):
    drug_id: int
    quantity: int
    price_override: Optional[float] = None

class SaleCreate(BaseModel):
    patient_id: Optional[int] = None
    items: List[SaleItem]
    payment_method: str = "cash"
    discount: float = 0.0
    notes: Optional[str] = None

class SaleOut(SaleCreate):
    id: int
    total_amount: float
    created_at: Optional[str] = None
    created_by: Optional[int] = None

@router.get("/", response_model=List[SaleOut])
async def list_sales(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: UserOut = Depends(get_current_user)
):
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    query = "SELECT * FROM sales WHERE 1=1"
    params = []
    if date_from:
        query += " AND created_at >= ?"
        params.append(date_from)
    if date_to:
        query += " AND created_at <= ?"
        params.append(date_to)
    query += " ORDER BY created_at DESC"
    rows = db.execute(query, params).fetchall()

    sales = []
    for row in rows:
        sale = dict(row)
        items = db.execute("SELECT si.*, d.name as drug_name FROM sale_items si JOIN drugs d ON si.drug_id = d.id WHERE si.sale_id = ?", (sale["id"],)).fetchall()
        sale["items"] = [dict(i) for i in items]
        sales.append(sale)
    db.close()
    return sales

@router.post("/", response_model=SaleOut, status_code=201)
async def create_sale(
    sale: SaleCreate,
    current_user: UserOut = Depends(require_role("admin", "pharmacist", "cashier"))
):
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row

    total = 0.0
    for item in sale.items:
        drug = db.execute("SELECT selling_price, stock FROM drugs WHERE id = ?", (item.drug_id,)).fetchone()
        if not drug:
            db.close()
            raise HTTPException(status_code=404, detail=f"Drug {item.drug_id} not found")
        if drug["stock"] < item.quantity:
            db.close()
            raise HTTPException(status_code=400, detail=f"Insufficient stock for drug {item.drug_id}")
        price = item.price_override or drug["selling_price"]
        total += price * item.quantity

    total -= sale.discount
    if total < 0: total = 0

    cursor = db.execute(
        """INSERT INTO sales (patient_id, total_amount, payment_method, discount, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?)""",
        (sale.patient_id, total, sale.payment_method, sale.discount, sale.notes, current_user.id)
    )
    sale_id = cursor.lastrowid

    for item in sale.items:
        drug = db.execute("SELECT selling_price FROM drugs WHERE id = ?", (item.drug_id,)).fetchone()
        price = item.price_override or drug["selling_price"]
        db.execute(
            """INSERT INTO sale_items (sale_id, drug_id, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?)""",
            (sale_id, item.drug_id, item.quantity, price, price * item.quantity)
        )
        db.execute("UPDATE drugs SET stock = stock - ? WHERE id = ?", (item.quantity, item.drug_id))

    db.commit()
    db.close()
    return {**sale.dict(), "id": sale_id, "total_amount": total, "created_at": datetime.now().isoformat()}