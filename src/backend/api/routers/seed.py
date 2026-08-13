from fastapi import APIRouter
import sqlite3
import os
from src.backend.api.deps import DB_PATH

router = APIRouter()

SAMPLE_DRUGS = [
    {"name": "Paracetamol 500mg", "generic_name": "Paracetamol", "drug_code": "PCM500", "category": "Pain Relief", "manufacturer": "Sun Pharma", "stock": 150, "reorder_point": 20, "cost_price": 2.5, "selling_price": 5.0, "expiry_date": "2027-06-01", "barcode": "8901234567890", "controlled": False},
    {"name": "Ibuprofen 400mg", "generic_name": "Ibuprofen", "drug_code": "IBU400", "category": "Pain Relief", "manufacturer": "Cipla", "stock": 200, "reorder_point": 30, "cost_price": 3.0, "selling_price": 6.5, "expiry_date": "2027-08-15", "barcode": "8901234567891", "controlled": False},
    {"name": "Amoxicillin 250mg", "generic_name": "Amoxicillin", "drug_code": "AMX250", "category": "Antibiotics", "manufacturer": "Dr. Reddy's", "stock": 80, "reorder_point": 15, "cost_price": 8.0, "selling_price": 15.0, "expiry_date": "2026-12-01", "barcode": "8901234567892", "controlled": True},
    {"name": "Cetirizine 10mg", "generic_name": "Cetirizine", "drug_code": "CET10", "category": "Allergy", "manufacturer": "Zydus", "stock": 120, "reorder_point": 25, "cost_price": 1.5, "selling_price": 3.5, "expiry_date": "2027-03-20", "barcode": "8901234567893", "controlled": False},
    {"name": "Metformin 500mg", "generic_name": "Metformin", "drug_code": "MET500", "category": "Diabetes", "manufacturer": "Lupin", "stock": 90, "reorder_point": 20, "cost_price": 4.0, "selling_price": 8.0, "expiry_date": "2027-01-10", "barcode": "8901234567894", "controlled": True},
    {"name": "Aspirin 75mg", "generic_name": "Aspirin", "drug_code": "ASP75", "category": "Cardiac", "manufacturer": "Torrent", "stock": 250, "reorder_point": 40, "cost_price": 1.0, "selling_price": 2.5, "expiry_date": "2027-05-30", "barcode": "8901234567895", "controlled": False},
    {"name": "Omeprazole 20mg", "generic_name": "Omeprazole", "drug_code": "OME20", "category": "Gastric", "manufacturer": "Alkem", "stock": 100, "reorder_point": 20, "cost_price": 3.5, "selling_price": 7.0, "expiry_date": "2027-04-15", "barcode": "8901234567896", "controlled": False},
    {"name": "Azithromycin 500mg", "generic_name": "Azithromycin", "drug_code": "AZI500", "category": "Antibiotics", "manufacturer": "Sun Pharma", "stock": 60, "reorder_point": 10, "cost_price": 12.0, "selling_price": 25.0, "expiry_date": "2026-10-01", "barcode": "8901234567897", "controlled": True},
    {"name": "Vitamin D3 60K", "generic_name": "Cholecalciferol", "drug_code": "VITD60", "category": "Vitamins", "manufacturer": "Mankind", "stock": 180, "reorder_point": 30, "cost_price": 5.0, "selling_price": 10.0, "expiry_date": "2027-07-20", "barcode": "8901234567898", "controlled": False},
    {"name": "Cough Syrup 100ml", "generic_name": "Dextromethorphan", "drug_code": "COUGH100", "category": "Cold & Flu", "manufacturer": "P&G", "stock": 75, "reorder_point": 15, "cost_price": 6.0, "selling_price": 12.0, "expiry_date": "2026-11-15", "barcode": "8901234567899", "controlled": False},
    {"name": "ORS Powder", "generic_name": "Oral Rehydration Salts", "drug_code": "ORS001", "category": "Electrolytes", "manufacturer": "WHO", "stock": 300, "reorder_point": 50, "cost_price": 0.8, "selling_price": 2.0, "expiry_date": "2027-09-01", "barcode": "8901234567900", "controlled": False},
    {"name": "Insulin Glargine", "generic_name": "Insulin Glargine", "drug_code": "INSGLA", "category": "Diabetes", "manufacturer": "Sanofi", "stock": 40, "reorder_point": 10, "cost_price": 45.0, "selling_price": 85.0, "expiry_date": "2026-09-01", "barcode": "8901234567901", "controlled": True},
]

def init_db():
    # Ensure the data directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    # Drop old table if schema mismatch
    db.execute("DROP TABLE IF EXISTS drugs")
    db.execute("""
        CREATE TABLE drugs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            generic_name TEXT,
            drug_code TEXT UNIQUE,
            category TEXT,
            manufacturer TEXT,
            stock INTEGER DEFAULT 0,
            reorder_point INTEGER DEFAULT 10,
            cost_price REAL DEFAULT 0,
            selling_price REAL DEFAULT 0,
            expiry_date TEXT,
            barcode TEXT,
            controlled BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.commit()
    db.close()

@router.post("/seed")
async def seed_database():
    init_db()
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()
    count = cursor.execute("SELECT COUNT(*) FROM drugs").fetchone()[0]
    if count > 0:
        db.close()
        return {"message": f"Database already has {count} drugs. Skipping seed."}
    for drug in SAMPLE_DRUGS:
        cursor.execute(
            """INSERT INTO drugs (name, generic_name, drug_code, category, manufacturer, stock,
                reorder_point, cost_price, selling_price, expiry_date, barcode, controlled)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (drug["name"], drug["generic_name"], drug["drug_code"], drug["category"], drug["manufacturer"],
             drug["stock"], drug["reorder_point"], drug["cost_price"], drug["selling_price"],
             drug["expiry_date"], drug["barcode"], drug["controlled"])
        )
    db.commit()
    db.close()
    return {"message": f"Seeded {len(SAMPLE_DRUGS)} drugs successfully"}
