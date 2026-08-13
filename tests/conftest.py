"""
Pytest Configuration
"""

import pytest
import os
import sys

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../src"))

from src.backend.core.database import Database
from src.backend.core.auth import AuthManager

@pytest.fixture
def test_db():
    """Create a fresh test database."""
    db_path = "data/test_pharmacy.db"
    if os.path.exists(db_path):
        os.remove(db_path)
    db = Database(db_path)
    auth = AuthManager(db)
    auth.create_user("admin", "admin123", "admin", "Test Admin")
    yield db
    if os.path.exists(db_path):
        os.remove(db_path)

@pytest.fixture
def auth_manager(test_db):
    return AuthManager(test_db)
