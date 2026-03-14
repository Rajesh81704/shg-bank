from pydantic import BaseModel
from datetime import date
from typing import Optional

class UserCreate(BaseModel):
    phone: str
    name: str
    password: str
    join_date: Optional[date] = None

class UserResponse(BaseModel):
    id: int
    phone: str
    name: str
    is_admin: bool
    join_date: date
    is_active: bool
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    phone: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class PaymentResponse(BaseModel):
    id: int
    member_id: int
    payment_type: str
    total_loan_amount: float
    description: Optional[str]
    payment_date: Optional[date]
    due_date: Optional[date]
    transaction_id: str
    days_late: int
    penalty_amount: float
    total_pending_amount: float

    class Config:
        from_attributes = True

class UserWithPayments(BaseModel):
    id: int
    phone: str
    name: str
    is_admin: bool
    join_date: date
    is_active: bool
    payments: list[PaymentResponse]

    class Config:
        from_attributes = True


class PasswordReset(BaseModel):
    phone: str
    new_password: str


class ApplyLoan(BaseModel):
    amount: float
    interest_rate: float = 2.0
    installments: int
    description: Optional[str] = None

class ApproveLoan(BaseModel):
    id: int
    member_id: int
    is_approved: bool=True

class LoanResponse(BaseModel):
    id: int
    member_id: int
    amount: float
    interest_rate: float
    installments: int
    status: str
    start_date: date
    end_date: Optional[date]
    description: Optional[str]
    member_name: Optional[str] = None
    member_phone: Optional[str] = None

class UserResponseWithPaymentAndLoanHistory(BaseModel):
    id: int
    phone: str
    name: str
    is_admin: bool
    join_date: date
    is_active: bool
    payment_history: list[PaymentResponse]
    loan_history: list[LoanResponse]

    class Config:
        from_attributes = True
