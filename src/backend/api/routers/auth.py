import hashlib
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.backend.api.deps import get_db

router = APIRouter(tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/admin/login")
async def admin_login(data: LoginRequest):
    conn, db_type = get_db()
    try:
        cur = conn.cursor()
        ph = "%s" if db_type == "postgres" else "?"
        password_hash = hashlib.sha256(data.password.encode()).hexdigest()
        cur.execute(f"SELECT * FROM admins WHERE email = {ph} AND password_hash = {ph}", (data.email, password_hash))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
        admin = dict(row)
        return {"message": "Admin login successful", "token": "admin-token", "admin": {"id": admin["id"], "email": admin["email"], "full_name": admin["full_name"]}}
    finally:
        conn.close()
