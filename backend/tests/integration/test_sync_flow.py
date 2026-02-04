# tests/integration/test_sync_flow.py

import pytest
from datetime import datetime

class TestSyncFlow:
    """Integration tests for case sync flow."""
    
    def test_complete_case_sync(self, client, test_user, auth_headers):
        """Test complete case sync flow."""
        # Step 1: Sync case metadata
        case_data = {
            "efiling_number": "EKHC/2026/WPC/00789",
            "case_number": "WP(C) 456/2026",
            "case_type": "WP(C)",
            "case_year": 2026,
            "party_role": "petitioner",
            "petitioner_name": "Alice Smith",
            "respondent_name": "State Government",
            "efiling_date": "2026-03-01",
            "status": "filed",
            "khc_id": test_user.khc_advocate_id,
            "pdf_links": []
        }
        
        response = client.post(
            "/api/v1/sync/cases",
            headers=auth_headers,
            json=case_data
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["action"] == "created"
        assert data["efiling_number"] == case_data["efiling_number"]
        
        case_id = data["case_id"]
        
        # Step 2: Verify case was created
        response = client.get(
            f"/api/v1/cases/{case_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        case_info = response.json()
        assert case_info["efiling_number"] == case_data["efiling_number"]
    
    def test_duplicate_case_sync_updates(self, client, test_user, test_case, auth_headers):
        """Test that syncing duplicate case updates existing record."""
        case_data = {
            "efiling_number": test_case.efiling_number,
            "case_number": test_case.case_number,
            "case_type": test_case.case_type,
            "case_year": test_case.case_year,
            "party_role": test_case.party_role,
            "petitioner_name": test_case.petitioner_name,
            "respondent_name": test_case.respondent_name,
            "efiling_date": test_case.efiling_date.isoformat(),
            "status": "registered",  # Changed status
            "next_hearing_date": "2026-04-01",  # New hearing date
            "khc_id": test_user.khc_advocate_id,
            "pdf_links": []
        }
        
        response = client.post(
            "/api/v1/sync/cases",
            headers=auth_headers,
            json=case_data
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["action"] == "updated"
    
    def test_document_sync(self, client, test_user, test_case, auth_headers):
        """Test document metadata sync."""
        doc_data = {
            "case_number": test_case.case_number,
            "khc_document_id": "DOC999",
            "category": "annexure",
            "title": "Test Annexure",
            "s3_key": f"KHC-TEST-001/{test_case.case_number}/annexure/test.pdf",
            "file_size": 1024000,
            "source_url": "https://efiling.highcourtofkerala.nic.in/docs/DOC999.pdf"
        }
        
        response = client.post(
            "/api/v1/sync/documents",
            headers=auth_headers,
            json=doc_data
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["action"] in ["created", "updated"]
        assert "document_id" in data
    
    def test_sync_status_check(self, client, test_user, test_case, auth_headers):
        """Test checking sync status."""
        response = client.get(
            f"/api/v1/sync/status/{test_case.case_number}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["case_number"] == test_case.case_number
        assert "document_status" in data