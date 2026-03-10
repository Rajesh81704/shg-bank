"""Admin controller for handling admin-related endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.database import get_db
from app.api.schemas import (
    UserCreate,
    UserResponse,
    PasswordReset,
    LoanResponse,
    UserResponseWithPaymentAndLoanHistory
)
from app.api.services.admin_service import (
    create_user_account,
    create_emergency_admin,
    reset_member_password,
    get_user_by_phone_with_payment_and_loan_history,
    get_financial_summary
)
from app.api.services.loan_service import approve_loan_application, get_all_loans
from app.api.middleware.auth_middleware import get_admin_user

router = APIRouter()

@router.post("/create-user", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """Create a new user (admin only)"""
    try:
        new_user = create_user_account(db, user)
        return new_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/emergency-admin", response_model=UserResponse)
async def create_emergency_admin_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    """Emergency route to create first admin (no auth required)"""
    try:
        new_admin = create_emergency_admin(db, user)
        return new_admin
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """Reset a member's password (admin only)"""
    try:
        result = reset_member_password(db, reset_data.phone, reset_data.new_password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.post("/approve-loan/{loan_id}", response_model=LoanResponse)
async def approve_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """Approve a loan application (admin only)"""
    try:
        result = approve_loan_application(db, loan_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/all-loans", response_model=list[LoanResponse])
async def get_all_loans_list(
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """Get all loans (admin only)"""
    loans = get_all_loans(db)
    return loans


@router.get("/user_details/{phone}", response_model=UserResponseWithPaymentAndLoanHistory)
async def get_user_details_by_phone(
    phone: str,
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """Get user by phone number with their payment details and loan history (admin only)"""
    try:
        user = get_user_by_phone_with_payment_and_loan_history(db, phone)
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.get("/financial_summary")
async def get_financial_summary_endpoint(
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """Get financial summary: collections, disbursements, available amount, penalties"""
    result = get_financial_summary(db)
    return result
