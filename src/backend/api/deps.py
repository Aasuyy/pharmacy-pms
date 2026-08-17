import os
from typing import Generator
from src.backend.db.session import SessionLocal

SECRET_KEY = os.getenv("SECRET_KEY", "pharmapro-2026-secret-key-change-me-later")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
