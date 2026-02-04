# tests/unit/test_case_service.py

import pytest
from datetime import datetime, timedelta

from app.services.case_service import CaseService
from app.db.models import CaseStatus, CaseEventType

class TestCaseService:
    """Unit tests for CaseService."""
    
    def test_create_case(self, db_session, test_user):
        """Test creating a new case."""
        case_data = {
            "advocate_id": test_user.id,
            "efiling_number": "EKHC/2026/WPC/00456",
            "case_type": "WP(C)",
            "case_year": 2026,
            "party_role": "petitioner",
            "petitioner_name": "Jane Doe",
            "respondent_name": "Union of India",
            "efiling_date": datetime(2026, 2, 1),
            "status": "filed"
        }
        
        case = CaseService.create_case(db_session, case_data)
        
        assert case.id is not None
        assert case.efiling_number == "EKHC/2026/WPC/00456"
        assert case.advocate_id == test_user.id
        assert case.is_visible == True
    
    def test_update_case(self, db_session, test_case):
        """Test updating case data."""
        update_data = {
            "case_number": "WP(C) 123/2026",
            "status": "registered",
            "next_hearing_date": datetime(2026, 3, 15)
        }
        
        updated_case = CaseService.update_case(db_session, test_case, update_data)
        
        assert updated_case.case_number == "WP(C) 123/2026"
        assert updated_case.status == "registered"
        assert updated_case.next_hearing_date == datetime(2026, 3, 15)
    
    def test_get_cases_with_filters(self, db_session, test_user, test_case):
        """Test getting cases with filters."""
        filters = {
            "advocate_id": test_user.id,
            "status": "pending",
            "case_type": "WP(C)"
        }
        
        cases = CaseService.get_cases(db_session, filters)
        
        assert len(cases) == 1
        assert cases[0].case_number == test_case.case_number
    
    def test_get_upcoming_hearings(self, db_session, test_user, test_case):
        """Test getting upcoming hearings."""
        # Set next hearing to 5 days from now
        test_case.next_hearing_date = datetime.utcnow() + timedelta(days=5)
        db_session.commit()
        
        cases = CaseService.get_upcoming_hearings(db_session, str(test_user.id), days=7)
        
        assert len(cases) == 1
        assert cases[0].id == test_case.id
    
    def test_count_cases(self, db_session, test_user):
        """Test counting cases."""
        filters = {
            "advocate_id": test_user.id,
            "is_visible": True
        }
        
        count = CaseService.count_cases(db_session, filters)
        
        assert count >= 1
    
    def test_add_case_event(self, db_session, test_case):
        """Test adding case history event."""
        event = CaseService.add_case_event(
            db_session,
            test_case.id,
            CaseEventType.HEARING,
            "Case heard. Adjourned to next date.",
            event_date=datetime(2026, 2, 15),
            judge_name="Justice A.K. Jayasankaran Nambiar"
        )
        
        assert event.id is not None
        assert event.case_id == test_case.id
        assert event.event_type == CaseEventType.HEARING
        assert event.judge_name == "Justice A.K. Jayasankaran Nambiar"
    
    def test_search_by_party_name(self, db_session, test_user, test_case):
        """Test searching cases by party name."""
        cases = CaseService.search_by_party_name(db_session, str(test_user.id), "State of Kerala")
        
        assert len(cases) == 1
        assert cases[0].respondent_name == "State of Kerala"