# tests/integration/test_auth_flow.py

import pytest
import time

class TestAuthFlow:
    """Integration tests for authentication flow."""
    
    def test_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "testpassword"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == test_user.email
    
    def test_login_invalid_credentials(self, client, test_user):
        """Test login with invalid credentials."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]
    
    def test_token_refresh(self, client, test_user, auth_headers):
        """Test JWT token refresh."""
        response = client.post(
            "/api/v1/auth/refresh",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        # New token should be different from old one
        assert data["access_token"] != auth_headers["Authorization"].split(" ")[1]
    
    def test_protected_endpoint_without_auth(self, client):
        """Test accessing protected endpoint without authentication."""
        response = client.get("/api/v1/cases/")
        
        assert response.status_code == 403
    
    def test_protected_endpoint_with_invalid_token(self, client):
        """Test accessing protected endpoint with invalid token."""
        response = client.get(
            "/api/v1/cases/",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == 401