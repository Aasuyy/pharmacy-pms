import os
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Query, HTTPException
import sqlite3
from src.backend.api.deps import get_db

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


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

class DrugCreate(BaseModel):
    name: str
    generic_name: str
    category: str
    manufacturer: str
    price: float
    stock: int
    reorder_point: int = 10
    manufacture_date: Optional[str] = None
    manufacture_date: Optional[str] = None
    expiry_date: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class DrugUpdate(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    reorder_point: Optional[int] = None
    manufacture_date: Optional[str] = None
    manufacture_date: Optional[str] = None
    expiry_date: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

@router.post("/drugs")
def create_drug(data: DrugCreate):
    conn, db_type = get_db()
    cur = None
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        
        # Build dynamic INSERT - only include fields that have values
        fields = ["name", "generic_name", "category", "manufacturer", "price", "stock", "reorder_point"]
        values = [data.name, data.generic_name, data.category, data.manufacturer, data.price, data.stock, data.reorder_point]
        
        if data.manufacture_date:
            fields.append("manufacture_date")
            values.append(data.manufacture_date)
        if data.expiry_date:
            fields.append("expiry_date")
            values.append(data.expiry_date)
        if data.description:
            fields.append("description")
            values.append(data.description)
        if data.image_url:
            fields.append("image_url")
            values.append(data.image_url)
        
        placeholders = ",".join([ph] * len(values))
        query = f"INSERT INTO drugs ({','.join(fields)}) VALUES ({placeholders}) RETURNING id"
        
        cur.execute(query, values)
        row = cur.fetchone()
        new_id = row["id"] if row and hasattr(row, "keys") else (row[0] if row else None)
        conn.commit()
        return {"message": "Drug created", "id": new_id}
    except Exception as e:
        import traceback
        error_msg = f"ERROR: {str(e)}\n{traceback.format_exc()}"
        print(error_msg, flush=True)
        try:
            if conn:
                conn.rollback()
        except:
            pass
        raise HTTPException(status_code=500, detail=error_msg)
    finally:
        try:
            if cur:
                cur.close()
            if conn:
                conn.close()
        except:
            pass

@router.put("/drugs/{drug_id}")
def update_drug(drug_id: int, data: DrugUpdate):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        
        # Build dynamic update
        fields = []
        values = []
        if data.name is not None:
            fields.append(f"name = {ph}")
            values.append(data.name)
        if data.generic_name is not None:
            fields.append(f"generic_name = {ph}")
            values.append(data.generic_name)
        if data.category is not None:
            fields.append(f"category = {ph}")
            values.append(data.category)
        if data.manufacturer is not None:
            fields.append(f"manufacturer = {ph}")
            values.append(data.manufacturer)
        if data.price is not None:
            fields.append(f"price = {ph}")
            values.append(data.price)
        if data.stock is not None:
            fields.append(f"stock = {ph}")
            values.append(data.stock)
        if data.reorder_point is not None:
            fields.append(f"reorder_point = {ph}")
            values.append(data.reorder_point)
        if data.manufacture_date is not None:
            fields.append(f"manufacture_date = {ph}")
            values.append(data.manufacture_date)
        if data.expiry_date is not None:
            fields.append(f"expiry_date = {ph}")
            values.append(data.expiry_date)
        if data.description is not None:
            fields.append(f"description = {ph}")
            values.append(data.description)
        if data.image_url is not None:
            fields.append(f"image_url = {ph}")
            values.append(data.image_url)
        
        if not fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(drug_id)
        query = f"UPDATE drugs SET {', '.join(fields)} WHERE id = {ph}"
        cur.execute(query, values)
        conn.commit()
        
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Drug not found")
        
        return {"message": "Drug updated", "id": drug_id}
    finally:
        conn.close()

@router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        result = cloudinary.uploader.upload(file.file)
        return {"url": result["secure_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/debug/schema")
def debug_schema():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        if db_type == "postgres":
            cur.execute("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'drugs' 
                ORDER BY ordinal_position
            """)
        else:
            cur.execute("PRAGMA table_info(drugs)")
        rows = cur.fetchall()
        return {"db_type": db_type, "columns": [dict(row) if hasattr(row, "keys") else list(row) for row in rows]}
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()





@router.delete("/drugs/{drug_id}")
def delete_drug(drug_id: int):
    import traceback
    conn = None
    try:
        conn, db_type = get_db()
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        
        cur.execute(f"SELECT id FROM drugs WHERE id = {ph}", (drug_id,))
        if not cur.fetchone():
            return {"error": "Drug not found"}
        
        # Delete from order_items using SAVEPOINT (so failure doesn't abort whole tx)
        if db_type == "postgres":
            cur.execute("SAVEPOINT sp_order_items")
            try:
                cur.execute(f"DELETE FROM order_items WHERE drug_id = {ph}", (drug_id,))
                cur.execute("RELEASE SAVEPOINT sp_order_items")
            except Exception:
                cur.execute("ROLLBACK TO SAVEPOINT sp_order_items")
        else:
            try:
                cur.execute(f"DELETE FROM order_items WHERE drug_id = {ph}", (drug_id,))
            except Exception:
                pass
        
        # Delete the drug
        cur.execute(f"DELETE FROM drugs WHERE id = {ph}", (drug_id,))
        conn.commit()
        return {"message": "Drug deleted"}
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except:
                pass
        return {"error": str(e), "traceback": traceback.format_exc()}
    finally:
        if conn:
            try:
                conn.close()
            except:
                pass

@router.get("/suppliers")
def list_suppliers():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM suppliers ORDER BY id DESC")
        cols = [desc[0] for desc in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]
    finally:
        conn.close()

@router.post("/suppliers")
def add_supplier(data: dict):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        cur.execute(
            f"INSERT INTO suppliers (name, contact, email, address) VALUES ({ph}, {ph}, {ph}, {ph})",
            (data["name"], data.get("contact"), data.get("email"), data.get("address"))
        )
        conn.commit()
        return {"message": "Supplier added"}
    finally:
        conn.close()

@router.get("/purchase-orders")
def list_pos():
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT p.*, s.name as supplier_name FROM purchase_orders p LEFT JOIN suppliers s ON p.supplier_id = s.id ORDER BY p.id DESC")
        cols = [desc[0] for desc in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]
    finally:
        conn.close()

@router.post("/purchase-orders")
def create_po(data: dict):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        items = data.get("items", [])
        total = sum(i["quantity"] * i["price"] for i in items)
        if db_type == "postgres":
            cur.execute("INSERT INTO purchase_orders (supplier_id, status, total_amount) VALUES (%s, %s, %s) RETURNING id", (data["supplier_id"], "pending", total))
            po_id = cur.fetchone()[0]
        else:
            cur.execute("INSERT INTO purchase_orders (supplier_id, status, total_amount) VALUES (?, ?, ?)", (data["supplier_id"], "pending", total))
            po_id = cur.lastrowid
        for item in items:
            cur.execute(f"INSERT INTO purchase_order_items (po_id, drug_id, quantity, price) VALUES ({ph}, {ph}, {ph}, {ph})", (po_id, item["drug_id"], item["quantity"], item["price"]))
        conn.commit()
        return {"message": "Purchase order created", "po_id": po_id}
    finally:
        conn.close()

@router.get("/expiring")
def get_expiring(days: int = 30):
    """Get drugs expiring within N days"""
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        
        if db_type == "postgres":
            cur.execute(
                "SELECT id, name, stock_quantity, expiry_date FROM drugs WHERE expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE + INTERVAL '%s days' ORDER BY expiry_date",
                (days,)
            )
        else:
            cur.execute(
                "SELECT id, name, stock_quantity, expiry_date FROM drugs WHERE expiry_date IS NOT NULL AND expiry_date <= date('now', ?) ORDER BY expiry_date",
                (f'+{days} days',)
            )
        
        rows = cur.fetchall()
        if rows and hasattr(rows[0], "keys"):
            return [dict(row) for row in rows]
        cols = [desc[0] for desc in cur.description]
        return [dict(zip(cols, row)) for row in rows]
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()

from pydantic import BaseModel
from typing import List

class CartItem(BaseModel):
    drug_id: int
    quantity: int
    unit_price: float

class CheckoutRequest(BaseModel):
    items: List[CartItem]
    payment_method: str = "cash"
    customer_name: str = "Walk-in Customer"

@router.post("/pos/checkout")
def pos_checkout(req: CheckoutRequest):
    conn, db_type = get_db()
    ph = "%s" if db_type == "postgres" else "?"
    try:
        cur = conn.cursor()
        total_amount = sum(item.quantity * item.unit_price for item in req.items)
        
        # 1. Create Order
        if db_type == "postgres":
            cur.execute(
                "INSERT INTO orders (total_amount, status, created_at) VALUES (%s, %s, NOW()) RETURNING id",
                (total_amount, "completed")
            )
            order_id = cur.fetchone()[0]
        else:
            cur.execute(
                "INSERT INTO orders (total_amount, status, created_at) VALUES (?, ?, datetime('now'))",
                (total_amount, "completed")
            )
            order_id = cur.lastrowid
        
        # 2. Process Items & Deduct Stock
        for item in req.items:
            # Check current stock
            cur.execute(f"SELECT stock_quantity FROM drugs WHERE id = {ph}", (item.drug_id,))
            row = cur.fetchone()
            if row and row[0] >= item.quantity:
                # Deduct stock
                cur.execute(
                    f"UPDATE drugs SET stock_quantity = stock_quantity - {ph} WHERE id = {ph}",
                    (item.quantity, item.drug_id)
                )
            else:
                conn.rollback()
                return {"error": f"Insufficient stock for Drug ID {item.drug_id}"}, 400
        
        conn.commit()
        return {
            "success": True, 
            "order_id": order_id, 
            "total_amount": total_amount,
            "message": "Transaction completed successfully"
        }
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        conn.close()

