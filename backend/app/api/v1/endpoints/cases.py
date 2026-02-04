"""
Case management endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, extract
from typing import List, Optional
from datetime import datetime, timedelta
from uuid import UUID

from app.db.database import get_db
from app.db.models import Case, User, Document, AIAnalysis, CaseHistory
from app.db.schemas import (
    CaseResponse,
    CaseCreate,
    CaseUpdate,
    CaseDetailResponse,
    DocumentResponse,
    CaseHistoryResponse,
    AIAnalysisResponse
)
from app.api.deps import get_current_user

router = APIRouter()

# ============================================================================
# List & Filter Endpoints
# ============================================================================

@router.get("/", response_model=List[CaseResponse])
def get_cases(
    status: Optional[str] = Query(None, description="Filter by status"),
    case_type: Optional[str] = Query(None, description="Filter by case type"),
    case_year: Optional[int] = Query(None, description="Filter by year"),
    search: Optional[str] = Query(None, description="Search query"),
    sort: str = Query("updated_at", description="Sort field"),
    order: str = Query("desc", description="Sort order (asc/desc)"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all cases for the authenticated user with filters
    """
    # Build base query
    query = db.query(Case).filter(
        Case.advocate_id == current_user.id,
        Case.is_visible == True
    )
    
    # Apply filters
    if status and status != "all":
        query = query.filter(Case.status == status)
    
    if case_type:
        query = query.filter(Case.case_type == case_type)
    
    if case_year:
        query = query.filter(Case.case_year == case_year)
    
    # Search
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Case.case_number.ilike(search_term),
                Case.efiling_number.ilike(search_term),
                Case.petitioner_name.ilike(search_term),
                Case.respondent_name.ilike(search_term)
            )
        )
    
    # Sorting
    sort_column = getattr(Case, sort, Case.updated_at)
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    # Pagination
    skip = (page - 1) * per_page
    cases = query.offset(skip).limit(per_page).all()
    
    return cases


@router.get("/search")
def search_cases(
    q: str = Query(..., min_length=2, description="Search query"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Full-text search cases by case number, party names
    """
    search_term = f"%{q}%"
    
    cases = db.query(Case).filter(
        Case.advocate_id == current_user.id,
        Case.is_visible == True,
        or_(
            Case.case_number.ilike(search_term),
            Case.efiling_number.ilike(search_term),
            Case.petitioner_name.ilike(search_term),
            Case.respondent_name.ilike(search_term)
        )
    ).limit(50).all()
    
    return {"cases": cases}


# ============================================================================
# Single Case Endpoints
# ============================================================================

@router.get("/{case_id}", response_model=CaseDetailResponse)
def get_case(
    case_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get case details with documents, history, and AI analysis
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Verify ownership
    if case.advocate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this case"
        )
    
    # Get related data
    documents = db.query(Document).filter(
        Document.case_id == case_id
    ).all()
    
    history = db.query(CaseHistory).filter(
        CaseHistory.case_id == case_id
    ).order_by(CaseHistory.event_date.desc()).all()
    
    ai_analysis = db.query(AIAnalysis).filter(
        AIAnalysis.case_id == case_id
    ).first()
    
    # Build response
    case_dict = {
        **case.__dict__,
        "documents": documents,
        "history": history,
        "ai_analysis": ai_analysis
    }
    
    return case_dict


@router.patch("/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: UUID,
    update_data: CaseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update case details
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    if case.advocate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this case"
        )
    
    # Update fields
    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(case, field, value)
    
    case.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(case)
    
    return case


@router.delete("/{case_id}")
def delete_case(
    case_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Soft delete a case (sets is_visible=False)
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    if case.advocate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this case"
        )
    
    # Soft delete
    case.is_visible = False
    case.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "message": "Case deleted successfully",
        "case_id": str(case_id)
    }


# ============================================================================
# Upcoming Hearings
# ============================================================================

@router.get("/upcoming-hearings")
def get_upcoming_hearings(
    days: int = Query(7, ge=1, le=90, description="Days to look ahead"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get cases with upcoming hearings in next N days
    """
    now = datetime.now()
    future = now + timedelta(days=days)
    
    cases = db.query(Case).filter(
        Case.advocate_id == current_user.id,
        Case.is_visible == True,
        Case.next_hearing_date.isnot(None),
        Case.next_hearing_date.between(now, future)
    ).order_by(Case.next_hearing_date.asc()).all()
    
    return cases


# ============================================================================
# Statistics
# ============================================================================

@router.get("/stats")
def get_case_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get case statistics (for dashboard)
    """
    # Total cases
    total_cases = db.query(Case).filter(
        Case.advocate_id == current_user.id,
        Case.is_visible == True
    ).count()
    
    # By status
    pending_cases = db.query(Case).filter(
        Case.advocate_id == current_user.id,
        Case.status == 'pending',
        Case.is_visible == True
    ).count()
    
    disposed_cases = db.query(Case).filter(
        Case.advocate_id == current_user.id,
        Case.status == 'disposed',
        Case.is_visible == True
    ).count()
    
    # Upcoming hearings (7 days)
    now = datetime.now()
    upcoming = db.query(Case).filter(
        Case.advocate_id == current_user.id,
        Case.next_hearing_date.between(now, now + timedelta(days=7))
    ).count()
    
    # Cases by status
    cases_by_status = db.query(
        Case.status,
        func.count(Case.id)
    ).filter(
        Case.advocate_id == current_user.id,
        Case.is_visible == True
    ).group_by(Case.status).all()
    
    # Cases by type
    cases_by_type = db.query(
        Case.case_type,
        func.count(Case.id)
    ).filter(
        Case.advocate_id == current_user.id,
        Case.is_visible == True
    ).group_by(Case.case_type).all()
    
    # Monthly trend (last 6 months)
    six_months_ago = now - timedelta(days=180)
    monthly = db.query(
        extract('year', Case.created_at).label('year'),
        extract('month', Case.created_at).label('month'),
        func.count(Case.id).label('count')
    ).filter(
        Case.advocate_id == current_user.id,
        Case.created_at >= six_months_ago
    ).group_by('year', 'month').order_by('year', 'month').all()
    
    monthly_trend = []
    for year, month, count in monthly:
        month_name = datetime(int(year), int(month), 1).strftime('%b')
        monthly_trend.append({"month": month_name, "count": count})
    
    return {
        "total_cases": total_cases,
        "pending_cases": pending_cases,
        "disposed_cases": disposed_cases,
        "upcoming_hearings": upcoming,
        "cases_by_status": {s: c for s, c in cases_by_status},
        "cases_by_type": {t: c for t, c in cases_by_type},
        "monthly_trend": monthly_trend
    }