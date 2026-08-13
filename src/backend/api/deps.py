from fastapi import Depends, HTTPException, WebSocket, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import os
import hashlib
import secrets

SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "data", "pharmacy.db")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)
customer_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/customer/auth/login", auto_error=False)

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserOut(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    role: str

class CustomerOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    is_email_verified: bool = False
    is_2fa_enabled: bool = False

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_user(username: str):
    db = get_db()
    row = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    db.close()
    return dict(row) if row else None

def get_customer_by_email(email: str):
    db = get_db()
    row = db.execute("SELECT * FROM customers WHERE email = ?", (email,)).fetchone()
    db.close()
    return dict(row) if row else None

def get_customer_by_id(customer_id: int):
    db = get_db()
    row = db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,)).fetchone()
    db.close()
    return dict(row) if row else None

def hash_password(plain: str) -> str:
    return hashlib.sha256(plain.encode()).hexdigest()

def verify_password(plain, hashed):
    if not hashed:
        return False
    if len(hashed) == 64:
        return hashlib.sha256(plain.encode()).hexdigest() == hashed
    if hashed.startswith("$2"):
        try:
            return pwd_context.verify(plain, hashed)
        except:
            return False
    return plain == hashed

async def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = get_user(username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return UserOut(**user)

async def get_current_customer(token: str = Depends(customer_oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        customer_id = payload.get("sub")
        if not customer_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    customer = get_customer_by_id(int(customer_id))
    if not customer:
        raise HTTPException(status_code=401, detail="Customer not found")
    return CustomerOut(**customer)

def require_role(*allowed_roles: str):
    def checker(current_user: UserOut = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail=f"Requires: {allowed_roles}")
        return current_user
    return checker

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    async def broadcast(self, message: dict):
        for conn in list(self.active_connections):
            try:
                await conn.send_json(message)
            except:
                self.disconnect(conn)

ws_manager = WebSocketManager()