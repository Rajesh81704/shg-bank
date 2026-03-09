from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.database import get_db
from app.api.schemas import ApplyLoan, LoanResponse
from app.api.services.loan_service import apply_for_loan, calculate_loan
from app.api.middleware.auth_middleware import get_current_user
from datetime import date

router = APIRouter()

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "username": current_user["phone"],
        "role": "admin" if current_user["is_admin"] else "user",
        "is_active": current_user["is_active"],
        "name": current_user["name"]
    }

@router.post("/apply-loan", response_model=LoanResponse)
async def apply_loan(
    loan_response: ApplyLoan,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Apply for a loan (authenticated users)"""
    try:
        result = apply_for_loan(db, current_user["id"], loan_response)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))




@router.get("/loan_calculator")
async def loan_calculator(
    amount: float,
    interest_rate: float = 2.0,
    installments: int = 6,
    start_date: str = date.today().strftime("%Y-%m-%d")
):
    """Calculate loan details with reducing balance interest method"""
    try:
        result = calculate_loan(amount, interest_rate, installments, start_date)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/pay_monthly_contribution")
async def pay_monthly_contribution(
    payment_transaction_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Pay monthly contribution of ₹1000 with payment transaction ID"""
    from app.api.services.loan_service import process_monthly_contribution
    try:
        result = process_monthly_contribution(db, current_user["id"], payment_transaction_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
