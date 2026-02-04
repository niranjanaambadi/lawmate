"""
Subscription & billing business logic
"""
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict
import uuid

from app.db.models import User, Case, Document


def get_subscription(db: Session, user_id: str):
    """
    Get user's subscription (mock for now - connect to payment gateway later)
    """
    # Mock subscription for free tier
    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "plan": "free",
        "status": "active",
        "billing_cycle": "monthly",
        "amount": 0,
        "currency": "INR",
        "start_date": datetime.now().isoformat(),
        "end_date": (datetime.now() + timedelta(days=365)).isoformat(),
        "auto_renew": True,
        "payment_method": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }


def get_all_plans() -> List[Dict]:
    """
    Return available subscription plans
    """
    return [
        {
            "id": "free",
            "name": "Free",
            "description": "Perfect for getting started",
            "price_monthly": 0,
            "price_annually": 0,
            "features": {
                "max_cases": 50,
                "max_documents": 500,
                "ai_analyses_per_month": 10,
                "storage_gb": 5,
                "priority_support": False,
                "api_access": False,
                "custom_branding": False,
                "multi_user": False,
                "advanced_reports": False
            },
            "popular": False
        },
        {
            "id": "professional",
            "name": "Professional",
            "description": "For busy advocates managing many cases",
            "price_monthly": 999,
            "price_annually": 9990,
            "features": {
                "max_cases": "unlimited",
                "max_documents": "unlimited",
                "ai_analyses_per_month": 100,
                "storage_gb": 100,
                "priority_support": True,
                "api_access": True,
                "custom_branding": False,
                "multi_user": False,
                "advanced_reports": True
            },
            "popular": True
        },
        {
            "id": "enterprise",
            "name": "Enterprise",
            "description": "For law firms with multiple advocates",
            "price_monthly": 4999,
            "price_annually": 49990,
            "features": {
                "max_cases": "unlimited",
                "max_documents": "unlimited",
                "ai_analyses_per_month": "unlimited",
                "storage_gb": "unlimited",
                "priority_support": True,
                "api_access": True,
                "custom_branding": True,
                "multi_user": True,
                "advanced_reports": True
            },
            "popular": False
        }
    ]


def get_usage_stats(db: Session, user_id: str):
    """
    Calculate current usage statistics
    """
    now = datetime.now()
    period_start = datetime(now.year, now.month, 1)  # First day of month
    
    # Count cases
    cases_count = db.query(Case).filter(
        Case.advocate_id == user_id,
        Case.is_visible == True
    ).count()
    
    # Count documents
    documents_count = db.query(Document).join(Case).filter(
        Case.advocate_id == user_id
    ).count()
    
    # Calculate storage (mock - sum file_size from documents)
    storage_query = db.query(Document).join(Case).filter(
        Case.advocate_id == user_id
    ).all()
    
    storage_bytes = sum(doc.file_size for doc in storage_query)
    storage_gb = storage_bytes / (1024 ** 3)  # Convert to GB
    
    # AI analyses this month (mock - would query ai_analyses table)
    ai_analyses_used = 5  # Mock value
    
    return {
        "cases_count": cases_count,
        "documents_count": documents_count,
        "storage_used_gb": round(storage_gb, 2),
        "ai_analyses_used": ai_analyses_used,
        "period_start": period_start.isoformat(),
        "period_end": now.isoformat()
    }


def get_invoices(db: Session, user_id: str):
    """
    Get billing history (mock - connect to payment gateway later)
    """
    return [
        {
            "id": str(uuid.uuid4()),
            "subscription_id": str(uuid.uuid4()),
            "amount": 999,
            "currency": "INR",
            "status": "paid",
            "invoice_date": (datetime.now() - timedelta(days=30)).isoformat(),
            "due_date": (datetime.now() - timedelta(days=30)).isoformat(),
            "paid_date": (datetime.now() - timedelta(days=30)).isoformat(),
            "payment_method": "upi",
            "invoice_url": None
        }
    ]


def upgrade_plan(db: Session, user_id: str, plan: str, billing_cycle: str):
    """
    Initiate plan upgrade (return mock checkout URL)
    In production, integrate with Razorpay/Stripe
    """
    # Mock checkout URL
    checkout_url = f"https://checkout.lawmate.in/{plan}?user={user_id}&cycle={billing_cycle}"
    return checkout_url


def cancel_subscription(db: Session, user_id: str, reason: str = None):
    """
    Cancel subscription
    """
    # In production, update subscription status in database
    pass


def update_payment_method(db: Session, user_id: str, payment_method: str):
    """
    Update payment method
    """
    # In production, update in payment gateway
    pass


def toggle_auto_renew(db: Session, user_id: str, auto_renew: bool):
    """
    Enable/disable auto-renewal
    """
    # In production, update subscription settings
    pass