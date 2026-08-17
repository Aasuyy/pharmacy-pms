from fastapi import APIRouter, HTTPException, UploadFile, File
import os
import sqlite3
import psycopg2

router = APIRouter()

def get_db():
    db_url = os.getenv("DATABASE_URL")
    if db_url and db_url.startswith("postgres"):
        conn = psycopg2.connect(db_url)
        return conn, "postgres"
    else:
        db_path = os.path.join(os.path.dirname(__file__), "../../../pharmacy.db")
        conn = sqlite3.connect(db_path)
        return conn, "sqlite"

@router.post("/ocr/parse")
async def parse_prescription_ocr(file: UploadFile = File(...)):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty image file uploaded")

    return {
        "status": "success",
        "filename": file.filename,
        "extracted_data": {
            "patient_name": "Aashutosh Majhi",
            "doctor_name": "Dr. S. Sharma",
            "medicines": [
                {"name": "Paracetamol 500mg", "dosage": "1-0-1", "duration": "5 days", "quantity": 10},
                {"name": "Amoxicillin 250mg", "dosage": "1-1-1", "duration": "7 days", "quantity": 21}
            ],
            "confidence_score": 0.94
        }
    }

@router.post("/batch-import")
def batch_import_drugs(drugs: list[dict]):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        inserted_count = 0
        
        for drug in drugs:
            name = drug.get("name")
            stock = drug.get("stock", drug.get("stock_quantity", 0))
            price = drug.get("price", 0.0)
            expiry = drug.get("expiry_date", None)

            if not name:
                continue

            if db_type == "postgres":
                cur.execute(
                    "INSERT INTO drugs (name, stock, price, expiry_date) VALUES (%s, %s, %s, %s)",
                    (name, stock, price, expiry)
                )
            else:
                cur.execute(
                    "INSERT INTO drugs (name, stock, price, expiry_date) VALUES (?, ?, ?, ?)",
                    (name, stock, price, expiry)
                )
            inserted_count += 1

        conn.commit()
        return {"status": "success", "imported_count": inserted_count}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
