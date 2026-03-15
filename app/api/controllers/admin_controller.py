"""Admin controller for handling admin-related endpoints"""
from datetime import date

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
    get_all_users,
    get_user_by_phone_with_payment_and_loan_history,
    get_dashboard_stats,
    get_financial_summary,
    get_payments_by_month,
    update_user_details,
    delete_member,
    admin_pay_contribution,
    delete_contribution as delete_contribution_service,
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


@router.get("/all-users", response_model=list[UserResponse])
async def get_all_users_list(
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """Get all users (admin only)"""
    return get_all_users(db)


@router.get("/dashboard-stats")
async def get_dashboard_stats_endpoint(
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """Get dashboard statistics (admin only)"""
    return get_dashboard_stats(db)


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


@router.put("/toggle-emi-status/{payment_id}")
async def toggle_emi_status(
    payment_id: int,
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """Toggle EMI payment status between paid and pending (admin only)"""
    from app.api.services.admin_service import toggle_emi_payment_status
    try:
        result = toggle_emi_payment_status(db, payment_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.delete("/delete-loan/{loan_id}")
async def delete_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """Delete a loan and all its associated payments (admin only)"""
    from app.api.services.admin_service import delete_loan as delete_loan_service
    try:
        result = delete_loan_service(db, loan_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.post("/create-loan-for-member")
async def create_loan_for_member(
    phone: str,
    amount: float,
    interest_rate: float = 2.0,
    installments: int = 6,
    start_date: str = None,
    description: str = None,
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """Create and approve a loan for a member by phone with custom start date (admin only)"""
    from app.api.services.admin_service import create_loan_for_member as create_loan
    from datetime import date
    
    if not start_date:
        start_date = date.today().strftime("%Y-%m-%d")
    
    try:
        result = create_loan(db, phone, amount, interest_rate, installments, start_date, description)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/member-installments/{phone}")
async def get_member_installments(
    phone: str,
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """Get all EMI installments (pending and paid) for a member by phone (admin only)"""
    from app.api.services.admin_service import get_member_installments_by_phone
    try:
        result = get_member_installments_by_phone(db, phone)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e

@router.get("/member-earnings/{phone}")
async def get_admin_member_earnings(
    phone: str,
    month_year: str = None,
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """
    Get earnings for a specific member by phone or name
    Optional month_year parameter (YYYY-MM) to filter by specific month
    """
    from app.api.services.loan_service import get_member_earnings
    from sqlalchemy import text
    user = db.execute(
        text("""
            SELECT id FROM users 
            WHERE phone = :exact_phone
            OR phone ILIKE :search
            OR name ILIKE :search
            LIMIT 1
        """), 
        {"exact_phone": phone, "search": f"%{phone}%"}
    ).fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    result = get_member_earnings(db, user.id, month_year)
    return result

@router.get("/payments-by-month/{month_year}")
async def get_payments_by_month_endpoint(
    month_year: str,
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """
    Get all payments for a specific month-year with member details
    Format: YYYY-MM (e.g., 2026-03 for March 2026)
    """
    try:
        result = get_payments_by_month(db, month_year)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.put("/update-user/{user_id}")
async def update_user(
    user_id: int,
    name: str = None,
    phone: str = None,
    password: str = None,
    is_active: bool = None,
    join_date: date = None,
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """
    Update user details (admin only)
    All parameters are optional - only provided fields will be updated
    """
    try:
        result = update_user_details(db, user_id, name, phone, password, is_active, join_date)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.delete("/delete-member/{user_id}")
async def delete_member_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """Delete a member and all their loans and payments (admin only)"""
    try:
        result = delete_member(db, user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.post("/pay-contribution/{phone}")
async def pay_contribution_for_member(
    phone: str,
    month_year: str,
    transaction_id: str = None,
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """
    Record monthly contribution payment on behalf of a member (admin only)
    - phone: member phone or name
    - month_year: month to record contribution for, format YYYY-MM (e.g. 2026-03)
    - transaction_id: optional custom transaction ID (auto-generated if not provided)
    """
    try:
        result = admin_pay_contribution(db, phone, month_year, transaction_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e




@router.delete("/delete-contribution/{payment_id}")
async def delete_contribution(
    payment_id: int,
    db: Session = Depends(get_db),
    _current_admin: dict = Depends(get_admin_user)
):
    """Delete a monthly contribution payment by its ID (admin only)"""
    try:
        result = delete_contribution_service(db, payment_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
