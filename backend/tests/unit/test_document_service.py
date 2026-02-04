# tests/unit/test_document_service.py

import pytest
from datetime import datetime

from app.services.document_service import DocumentService
from app.db.models import DocumentCategory

class TestDocumentService:
    """Unit tests for DocumentService."""
    
    def test_create_document(self, db_session, test_case):
        """Test creating a document."""
        doc_data = {
            "case_id": test_case.id,
            "khc_document_id": "DOC002",
            "category": "annexure",
            "title": "Annexure A",
            "s3_key": "KHC-TEST-001/WPC-123-2026/annexure/annexure-a.pdf",
            "s3_bucket": "test-bucket",
            "file_size": 512000
        }
        
        document = DocumentService.create_document(db_session, doc_data)
        
        assert document.id is not None
        assert document.title == "Annexure A"
        assert document.category == "annexure"
    
    def test_update_document(self, db_session, test_document):
        """Test updating document metadata."""
        update_data = {
            "title": "Updated Main Petition",
            "description": "Updated description"
        }
        
        updated_doc = DocumentService.update_document(db_session, test_document, update_data)
        
        assert updated_doc.title == "Updated Main Petition"
        assert updated_doc.description == "Updated description"
    
    def test_mark_document_uploaded(self, db_session, test_document):
        """Test marking document as uploaded."""
        s3_key = "KHC-TEST-001/WPC-123-2026/case_file/petition-v2.pdf"
        file_size = 2048000
        
        updated_doc = DocumentService.mark_document_uploaded(
            db_session,
            test_document.id,
            s3_key,
            file_size
        )
        
        assert updated_doc.upload_status == "completed"
        assert updated_doc.uploaded_at is not None
        assert updated_doc.s3_key == s3_key
        assert updated_doc.file_size == file_size
    
    def test_mark_document_failed(self, db_session, test_document):
        """Test marking document upload as failed."""
        error_message = "Network timeout"
        
        updated_doc = DocumentService.mark_document_failed(
            db_session,
            test_document.id,
            error_message
        )
        
        assert updated_doc.upload_status == "failed"
        assert updated_doc.upload_error == error_message
    
    def test_get_documents_by_case(self, db_session, test_case, test_document):
        """Test getting documents grouped by category."""
        grouped_docs = DocumentService.get_documents_by_case(db_session, test_case.id)
        
        assert "case_file" in grouped_docs
        assert len(grouped_docs["case_file"]) == 1
        assert grouped_docs["case_file"][0].id == test_document.id
    
    def test_get_storage_stats(self, db_session, test_user, test_case, test_document):
        """Test getting storage statistics."""
        stats = DocumentService.get_storage_stats(db_session, str(test_user.id))
        
        assert stats["total_documents"] >= 1
        assert stats["total_storage_bytes"] >= test_document.file_size
        assert "by_category" in stats