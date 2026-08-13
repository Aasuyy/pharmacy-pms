"""
Unit Tests — Database Operations
"""

import pytest

class TestDatabase:
    def test_database_initialization(self, test_db):
        conn = test_db.get_connection()
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        conn.close()

        expected = ["users", "drugs", "patients", "prescriptions", 
                    "prescription_items", "sales", "sale_items", 
                    "suppliers", "audit_logs", "blockchain_records"]
        for table in expected:
            assert table in tables

    def test_user_creation(self, test_db):
        from src.backend.core.auth import AuthManager
        auth = AuthManager(test_db)
        success = auth.create_user("testuser", "password", "pharmacist", "Test User")
        assert success is True

        user = auth.get_user_by_username("testuser")
        assert user is not None
        assert user["role"] == "pharmacist"

    def test_transaction_rollback(self, test_db):
        try:
            with test_db.transaction() as conn:
                conn.execute("INSERT INTO drugs (drug_code, name) VALUES (?, ?)", ("TEST-001", "Test Drug"))
                raise Exception("Simulated error")
        except Exception:
            pass

        conn = test_db.get_connection()
        cursor = conn.execute("SELECT * FROM drugs WHERE drug_code = ?", ("TEST-001",))
        result = cursor.fetchone()
        conn.close()
        assert result is None  # Should have rolled back
