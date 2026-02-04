"""
Subscription & billing management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.db.models import User
from app.db import schemas
from app.services import subscription_service

router = APIRouter()


@router.get("/current", response_model=schemas.SubscriptionOut)
def get_current_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's current subscription"""
    subscription = subscription_service.get_subscription(db, current_user.id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return subscription


@router.get("/plans", response_model=List[schemas.PlanDetails])
def get_available_plans():
    """Get all available subscription plans"""
    return subscription_service.get_all_plans()


@router.get("/usage", response_model=schemas.UsageStats)
def get_usage_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current billing period usage statistics"""
    return subscription_service.get_usage_stats(db, current_user.id)


@router.get("/invoices", response_model=List[schemas.InvoiceOut])
def get_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get billing history"""
    return subscription_service.get_invoices(db, current_user.id)


@router.post("/upgrade")
def upgrade_plan(
    plan: str,
    billing_cycle: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate plan upgrade (returns checkout URL)"""
    checkout_url = subscription_service.upgrade_plan(
        db, current_user.id, plan, billing_cycle
    )
    return {"checkout_url": checkout_url}


@router.post("/cancel")
def cancel_subscription(
    reason: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel subscription"""
    subscription_service.cancel_subscription(db, current_user.id, reason)
    return {"message": "Subscription cancelled successfully"}


@router.patch("/payment-method")
def update_payment_method(
    payment_method: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update payment method"""
    subscription_service.update_payment_method(db, current_user.id, payment_method)
    return {"message": "Payment method updated"}


@router.patch("/auto-renew")
def toggle_auto_renew(
    auto_renew: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enable/disable auto-renewal"""
    subscription_service.toggle_auto_renew(db, current_user.id, auto_renew)
    return {"message": f"Auto-renewal {'enabled' if auto_renew else 'disabled'}"}