"""
Backend Core — Authentication Manager
Handles password hashing, JWT tokens, and user management.
"""

import hashlib
import os
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt

# In production, use proper bcrypt via passlib
# from passlib.context import CryptContext
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

class AuthManager:
    """Handles all authentication operations."""

    def __init__(self, database):
        self.db = database

    def hash_password(self, password: str) -> str:
        """Hash password using SHA-256 (use bcrypt in production)."""
        return hashlib.sha256(password.encode()).hexdigest()

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash."""
        return self.hash_password(plain_password) == hashed_password

    def create_access_token(self, data: Dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    def decode_token(self, token: str) -> Optional[Dict]:
        """Decode and validate JWT token."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None

    def authenticate_user(self, username: str, password: str) -> Optional[Dict]:
        """Authenticate user credentials."""
        conn = self.db.get_connection()
        cursor = conn.execute(
            "SELECT * FROM users WHERE username = ? AND is_active = 1",
            (username,)
        )
        user = cursor.fetchone()
        conn.close()

        if user and self.verify_password(password, user["password_hash"]):
            return dict(user)
        return None

    def create_user(self, username: str, password: str, role: str, full_name: str) -> bool:
        """Create new user account."""
        conn = self.db.get_connection()
        try:
            conn.execute(
                """INSERT INTO users (username, password_hash, role, full_name)
                   VALUES (?, ?, ?, ?)""",
                (username, self.hash_password(password), role, full_name)
            )
            conn.commit()
            return True
        except Exception:
            return False
        finally:
            conn.close()

    def get_user_by_username(self, username: str) -> Optional[Dict]:
        """Get user by username."""
        conn = self.db.get_connection()
        cursor = conn.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()
        return dict(user) if user else None

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
        token = jwt.encode({"admin_id": admin["id"], "email": admin["email"], "type": "admin"}, SECRET_KEY, algorithm="HS256")
        return {"message": "Admin login successful", "token": token, "admin": {"id": admin["id"], "email": admin["email"], "full_name": admin["full_name"]}}
    finally:
        conn.close()

