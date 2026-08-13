"""
Backend Core — Pydantic Models
Request/response schemas for API validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

# ─── Enums ───
class UserRole(str, Enum):
    ADMIN = "admin"
    PHARMACIST = "pharmacist"
    TECHNICIAN = "technician"
    CASHIER = "cashier"

class RxStatus(str, Enum):
    PENDING = "pending"
    DISPENSED = "dispensed"
    CANCELLED = "cancelled"

class SaleType(str, Enum):
    OTC = "OTC"
    PRESCRIPTION = "prescription"
    INSURANCE = "insurance"

class PaymentMethod(str, Enum):
    CASH = "Cash"
    CARD = "Card"
    INSURANCE = "Insurance"
    MOBILE = "Mobile"

# ─── User Models ───
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    role: UserRole
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    full_name: Optional[str]
    is_active: bool
    created_at: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ─── Drug Models ───
class DrugCreate(BaseModel):
    drug_code: str = Field(..., min_length=2, max_length=20)
    name: str = Field(..., min_length=1, max_length=100)
    generic_name: Optional[str] = None
    manufacturer: Optional[str] = None
    category: str = "Tablet"
    batch_number: str
    expiry_date: str  # YYYY-MM-DD
    stock_quantity: int = Field(0, ge=0)
    unit_price: float = Field(0.0, ge=0)
    reorder_level: int = Field(10, ge=0)
    is_controlled: bool = False

class DrugUpdate(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    manufacturer: Optional[str] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[str] = None
    stock_quantity: Optional[int] = None
    unit_price: Optional[float] = None
    reorder_level: Optional[int] = None
    is_controlled: Optional[bool] = None

class DrugResponse(DrugCreate):
    id: int
    created_at: str
    updated_at: str

# ─── Patient Models ───
class PatientCreate(BaseModel):
    patient_code: str = Field(..., min_length=2, max_length=20)
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None
    email: Optional[str] = None
    date_of_birth: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None

class PatientResponse(PatientCreate):
    id: int
    created_at: str

# ─── Prescription Models ───
class PrescriptionItemCreate(BaseModel):
    drug_id: int
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    dosage: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None

class PrescriptionCreate(BaseModel):
    patient_id: int
    doctor_name: str
    items: List[PrescriptionItemCreate]
    notes: Optional[str] = None

class PrescriptionResponse(BaseModel):
    id: int
    rx_code: str
    patient_id: int
    patient_name: Optional[str]
    doctor_name: Optional[str]
    status: str
    total_amount: float
    notes: Optional[str]
    created_by: Optional[int]
    created_at: str
    dispensed_at: Optional[str]

# ─── Sale Models ───
class SaleItemCreate(BaseModel):
    drug_id: int
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)

class SaleCreate(BaseModel):
    items: List[SaleItemCreate]
    payment_method: PaymentMethod = PaymentMethod.CASH
    sale_type: SaleType = SaleType.OTC
    discount_amount: float = 0.0
    tax_amount: float = 0.0

class SaleResponse(BaseModel):
    id: int
    sale_code: str
    sale_type: str
    total_amount: float
    payment_method: str
    discount_amount: float
    tax_amount: float
    final_amount: float
    created_by: Optional[int]
    created_at: str

# ─── Dashboard Models ───
class DashboardStats(BaseModel):
    total_drugs: int
    low_stock_count: int
    expiring_count: int
    today_revenue: float
    pending_prescriptions: int
    total_patients: int
    today_sales_count: int
