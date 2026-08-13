"""
Unit Tests — Authentication
"""

import pytest
from src.backend.core.auth import AuthManager

class TestAuth:
    def test_password_hashing(self, auth_manager):
        hash1 = auth_manager.hash_password("test123")
        hash2 = auth_manager.hash_password("test123")
        assert hash1 == hash2
        assert len(hash1) == 64  # SHA-256 hex length

    def test_user_authentication(self, auth_manager):
        user = auth_manager.authenticate_user("admin", "admin123")
        assert user is not None
        assert user["username"] == "admin"
        assert user["role"] == "admin"

    def test_wrong_password(self, auth_manager):
        user = auth_manager.authenticate_user("admin", "wrongpassword")
        assert user is None

    def test_token_creation(self, auth_manager):
        token = auth_manager.create_access_token({"sub": "admin", "role": "admin"})
        assert token is not None
        assert isinstance(token, str)

    def test_token_decode(self, auth_manager):
        token = auth_manager.create_access_token({"sub": "admin", "role": "admin"})
        payload = auth_manager.decode_token(token)
        assert payload is not None
        assert payload["sub"] == "admin"
