# tests/integration/test_identity_handshake.py

import pytest

class TestIdentityHandshake:
    """Integration tests for identity verification."""
    
    def test_identity_verification_success(self, client, test_user, auth_headers):
        """Test successful identity verification."""
        response = client.post(
            "/api/v1/identity/verify",
            headers=auth_headers,
            json={
                "scraped_khc_id": test_user.khc_advocate_id,
                "scraped_name": test_user.khc_advocate_name
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["verified"] == True
        assert "sync_token" in data
        assert data["user"]["khc_advocate_id"] == test_user.khc_advocate_id
    
    def test_identity_verification_mismatch(self, client, test_user, auth_headers):
        """Test identity mismatch detection."""
        response = client.post(
            "/api/v1/identity/verify",
            headers=auth_headers,
            json={
                "scraped_khc_id": "KHC/DIFFERENT/999",
                "scraped_name": "Different Advocate"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["verified"] == False
        assert data["error"] == "IDENTITY_MISMATCH"
        assert "expected_khc_id" in data
    
    def test_identity_verification_without_auth(self, client):
        """Test identity verification without authentication."""
        response = client.post(
            "/api/v1/identity/verify",
            json={
                "scraped_khc_id": "KHC/TEST/001",
                "scraped_name": "Test Advocate"
            }
        )
        
        assert response.status_code == 403  # Forbidden