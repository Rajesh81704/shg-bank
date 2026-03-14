from datetime import date

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.schemas import UserCreate


# ---- Row-to-dict helpers ----

def _row_to_user(row) -> dict:
    return {
        "id": row[0],
        "phone": row[1],
        "name": row[2],
        "is_admin": row[3],
        "join_date": row[4],
        "is_active": row[5],
    }


def _row_to_payment(row) -> dict:
    return {
        "id": row[0],
        "member_id": row[1],
        "payment_type": row[2],
        "total_loan_amount": row[3],
        "description": row[4],
        "payment_date": row[5],
        "due_date": row[6],
        "transaction_id": row[7],
        "days_late": row[8],
        "penalty_amount": row[9],
        "total_pending_amount": row[10],
    }


def _row_to_loan(row) -> dict:
    return {
        "id": row[0],
        "member_id": row[1],
        "amount": row[2],
        "interest_rate": row[3],
        "installments": row[4],
        "status": row[5],
        "start_date": row[6],
        "end_date": row[7],
        "description": row[8],
    }


def _get_payment_history(db: Session, user_id: int) -> list[dict]:
    result = db.execute(
        text("""
            SELECT id, member_id, payment_type, total_loan_amount, description,
                   payment_date, due_date, transaction_id, days_late,
                   penalty_amount, total_pending_amount
            FROM payments
            WHERE member_id = :user_id
            ORDER BY payment_date DESC
        """),
        {"user_id": user_id}
    )
    return [_row_to_payment(row) for row in result.fetchall()]


def _get_loan_history(db: Session, user_id: int) -> list[dict]:
    result = db.execute(
        text("""
            SELECT id, member_id, amount, interest_rate, installments,
                   status, start_date, end_date, description
            FROM loans
            WHERE member_id = :user_id
            ORDER BY start_date DESC
        """),
        {"user_id": user_id}
    )
    return [_row_to_loan(row) for row in result.fetchall()]


# ---- Service functions ----

def create_user_account(db: Session, user_data: UserCreate) -> dict:
    """Create a new user account"""
    result = db.execute(
        text("SELECT id FROM users WHERE phone = :phone"),
        {"phone": user_data.phone}
    )
    if result.fetchone():
        raise ValueError("Phone number already registered")

    result = db.execute(
        text("""
            INSERT INTO users (phone, name, password, is_admin, join_date, is_active)
            VALUES (:phone, :name, :password, :is_admin, :join_date, :is_active)
            RETURNING id, phone, name, is_admin, join_date, is_active
        """),
        {
            "phone": user_data.phone,
            "name": user_data.name,
            "password": user_data.password,
            "is_admin": False,
            "join_date": date.today(),
            "is_active": True
        }
    )
    db.commit()
    return _row_to_user(result.fetchone())


def create_emergency_admin(db: Session, user_data: UserCreate):
    """Create emergency admin user without authentication"""
    result = db.execute(
        text("SELECT id FROM users WHERE phone = :phone"),
        {"phone": user_data.phone}
    )
    if result.fetchone():
        raise ValueError("Phone number already registered")

    result = db.execute(
        text("""
            INSERT INTO users (id, phone, name, password, is_admin, join_date, is_active)
            VALUES (DEFAULT, :phone, :name, :password, :is_admin, :join_date, :is_active)
            RETURNING id, phone, name, is_admin, join_date, is_active
        """),
        {
            "phone": user_data.phone.strip(),
            "name": user_data.name,
            "password": user_data.password,
            "is_admin": True,
            "join_date": date.today(),
            "is_active": True
        }
    )
    db.commit()
    return _row_to_user(result.fetchone())


def reset_member_password(db: Session, phone: str, new_password: str):
    """Reset a member's password (admin only)"""
    result = db.execute(
        text("SELECT id, name FROM users WHERE phone = :phone"),
        {"phone": phone}
    )
    user = result.fetchone()

    if not user:
        raise ValueError("User not found")

    db.execute(
        text("UPDATE users SET password = :password WHERE phone = :phone"),
        {"password": new_password, "phone": phone}
    )
    db.commit()

    return {
        "message": "Password reset successfully",
        "user_id": user[0],
        "name": user[1],
        "phone": phone
    }


def get_all_users(db: Session) -> list[dict]:
    """Get all users"""
    result = db.execute(
        text("""
            SELECT id, phone, name, is_admin, join_date, is_active
            FROM users
            ORDER BY id
        """)
    )
    return [_row_to_user(row) for row in result.fetchall()]


def get_user_by_phone_with_payment_and_loan_history(db: Session, phone: str):
    """Get user by phone number or name with their payment details and loan history"""
    user_result = db.execute(
        text("""
            SELECT id, phone, name, is_admin, join_date, is_active
            FROM users
            WHERE phone = :exact_phone
            OR phone ILIKE :search
            OR name ILIKE :search
            LIMIT 1
        """),
        {"exact_phone": phone, "search": f"%{phone}%"}
    )
    user = user_result.fetchone()

    if not user:
        raise ValueError("User not found")

    user_dict = _row_to_user(user)
    user_dict["payment_history"] = _get_payment_history(db, user[0])
    user_dict["loan_history"] = _get_loan_history(db, user[0])
    return user_dict


def get_user_details_by_id(db: Session, user_id: int):
    """Get user by ID with their payment details and loan history"""
    user_result = db.execute(
        text("""
            SELECT id, phone, name, is_admin, join_date, is_active
            FROM users
            WHERE id = :user_id
        """),
        {"user_id": user_id}
    )
    user = user_result.fetchone()

    if not user:
        raise ValueError("User not found")

    user_dict = _row_to_user(user)
    user_dict["payment_history"] = _get_payment_history(db, user_id)
    user_dict["loan_history"] = _get_loan_history(db, user_id)
    return user_dict


def get_dashboard_stats(db: Session) -> dict:
    """Get dashboard statistics for admin view"""
    result = db.execute(
        text("""
            SELECT
                COUNT(*) as total_members,
                COUNT(*) FILTER (WHERE is_active = true) as active_members
            FROM users
        """)
    )
    members = result.fetchone()

    result = db.execute(
        text("""
            SELECT
                COUNT(*) FILTER (WHERE status = 'approved') as approved_loans,
                COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0) as total_loan_amount,
                COUNT(*) FILTER (WHERE status = 'pending') as pending_loans
            FROM loans
        """)
    )
    loans = result.fetchone()

    result = db.execute(
        text("""
            SELECT
                COUNT(*) as total_contributions,
                COALESCE(SUM(total_loan_amount), 0) as total_contribution_amount
            FROM payments
            WHERE payment_type = 'monthly_contribution' AND payment_date IS NOT NULL
        """)
    )
    contributions = result.fetchone()

    return {
        "total_members": members[0],
        "active_members": members[1],
        "approved_loans": loans[0],
        "total_loan_amount": round(float(loans[1]), 2),
        "pending_loans": loans[2],
        "total_contributions": contributions[0],
        "total_contribution_amount": round(float(contributions[1]), 2),
    }


def get_financial_summary(db: Session):
    """Get complete financial summary of the SHG"""

    result = db.execute(
        text("""
            SELECT
                COALESCE(SUM(total_loan_amount), 0) as total_contributions,
                COALESCE(SUM(penalty_amount), 0) as contribution_penalties,
                COUNT(*) as total_contribution_payments
            FROM payments
            WHERE payment_type = 'monthly_contribution' AND payment_date IS NOT NULL
        """)
    )
    contributions = result.fetchone()

    result = db.execute(
        text("""
            SELECT
                COALESCE(SUM(total_loan_amount), 0) as total_emi_collected,
                COALESCE(SUM(penalty_amount), 0) as emi_penalties,
                COUNT(*) as total_emi_payments
            FROM payments
            WHERE payment_type = 'loan_installment' AND payment_date IS NOT NULL
        """)
    )
    emi_collections = result.fetchone()

    result = db.execute(
        text("""
            SELECT
                COALESCE(SUM(amount), 0) as total_disbursed,
                COUNT(*) as total_loans
            FROM loans
            WHERE status = 'approved'
        """)
    )
    loans_disbursed = result.fetchone()

    result = db.execute(
        text("""
            SELECT
                COALESCE(SUM(total_pending_amount), 0) as pending_emi_amount,
                COUNT(*) as pending_emi_count
            FROM payments
            WHERE payment_type = 'loan_installment' AND payment_date IS NULL
        """)
    )
    pending_emis = result.fetchone()

    result = db.execute(
        text("""
            SELECT
                u.id,
                u.name,
                u.phone,
                COALESCE(SUM(p.penalty_amount), 0) as total_penalty
            FROM users u
            LEFT JOIN payments p ON u.id = p.member_id
            WHERE p.penalty_amount > 0
            GROUP BY u.id, u.name, u.phone
            ORDER BY total_penalty DESC
        """)
    )
    member_penalties = result.fetchall()

    total_collection = contributions[0] + emi_collections[0]
    total_penalties = contributions[1] + emi_collections[1]
    total_disbursed = loans_disbursed[0]
    available_amount = total_collection + total_penalties - total_disbursed

    penalty_members = [
        {
            "member_id": member[0],
            "name": member[1],
            "phone": member[2],
            "total_penalty": member[3]
        }
        for member in member_penalties
    ]

    return {
        "summary": {
            "total_collection": round(total_collection, 2),
            "total_contributions": round(contributions[0], 2),
            "total_emi_collected": round(emi_collections[0], 2),
            "total_penalties": round(total_penalties, 2),
            "contribution_penalties": round(contributions[1], 2),
            "emi_penalties": round(emi_collections[1], 2),
            "total_loans_disbursed": round(total_disbursed, 2),
            "pending_emi_amount": round(pending_emis[0], 2),
            "available_amount": round(available_amount, 2)
        },
        "statistics": {
            "total_contribution_payments": contributions[2],
            "total_emi_payments": emi_collections[2],
            "total_loans_approved": loans_disbursed[1],
            "pending_emi_count": pending_emis[1],
            "members_with_penalties": len(penalty_members)
        },
        "members_with_penalties": penalty_members
    }


def toggle_emi_payment_status(db: Session, payment_id: int):
    """Toggle EMI payment status between paid and pending (admin only)"""
    from datetime import date as date_today
    
    # Check if payment exists and is a loan installment
    result = db.execute(
        text("""
            SELECT id, payment_type, member_id, description, payment_date, due_date, total_pending_amount
            FROM payments
            WHERE id = :payment_id
        """),
        {"payment_id": payment_id}
    )
    payment = result.fetchone()
    
    if not payment:
        raise ValueError("Payment not found")
    
    if payment[1] != "loan_installment":
        raise ValueError("This is not a loan installment payment")
    
    payment_date = payment[4]
    due_date = payment[5]
    pending_amount = payment[6]
    
    if payment_date is None:
        # Currently pending -> Mark as paid
        db.execute(
            text("""
                UPDATE payments 
                SET payment_date = :payment_date,
                    days_late = 0,
                    penalty_amount = 0.0,
                    total_pending_amount = 0
                WHERE id = :payment_id
            """),
            {
                "payment_date": due_date if due_date else date_today.today(),
                "payment_id": payment_id
            }
        )
        db.commit()
        
        return {
            "message": "EMI payment marked as paid successfully",
            "payment_id": payment_id,
            "member_id": payment[2],
            "description": payment[3],
            "new_status": "paid",
            "payment_date": (due_date if due_date else date_today.today()).strftime("%Y-%m-%d")
        }
    else:
        # Currently paid -> Mark as pending
        # Get original pending amount from the installment calculation
        result = db.execute(
            text("""
                SELECT total_loan_amount FROM payments WHERE id = :payment_id
            """),
            {"payment_id": payment_id}
        )
        
        db.execute(
            text("""
                UPDATE payments 
                SET payment_date = NULL,
                    days_late = 0,
                    penalty_amount = 0.0
                WHERE id = :payment_id
            """),
            {"payment_id": payment_id}
        )
        db.commit()
        
        return {
            "message": "EMI payment marked as pending successfully",
            "payment_id": payment_id,
            "member_id": payment[2],
            "description": payment[3],
            "new_status": "pending",
            "previous_payment_date": payment_date.strftime("%Y-%m-%d")
        }


def delete_loan(db: Session, loan_id: int):
    """Delete a loan and all its associated payments (admin only)"""
    # Check if loan exists
    result = db.execute(
        text("""
            SELECT id, member_id, amount, status
            FROM loans
            WHERE id = :loan_id
        """),
        {"loan_id": loan_id}
    )
    loan = result.fetchone()
    
    if not loan:
        raise ValueError("Loan not found")
    
    # Delete all associated payments
    db.execute(
        text("""
            DELETE FROM payments 
            WHERE payment_type = 'loan_installment' 
            AND description LIKE :pattern
        """),
        {"pattern": f"Loan #{loan_id} -%"}
    )
    
    # Delete the loan
    db.execute(
        text("DELETE FROM loans WHERE id = :loan_id"),
        {"loan_id": loan_id}
    )
    db.commit()
    
    return {
        "message": "Loan and all associated payments deleted successfully",
        "loan_id": loan_id,
        "member_id": loan[1],
        "amount": loan[2],
        "status": loan[3]
    }


def create_loan_for_member(db: Session, phone: str, amount: float, interest_rate: float, 
                           installments: int, start_date: str, description: str = None):
    """Create and approve a loan for a member with custom start date (admin only)"""
    from datetime import datetime, timedelta
    from dateutil.relativedelta import relativedelta
    import uuid
    
    # Check if member exists by phone
    result = db.execute(
        text("SELECT id, name, phone FROM users WHERE phone = :phone"),
        {"phone": phone}
    )
    member = result.fetchone()
    
    if not member:
        raise ValueError("Member not found with this phone number")
    
    member_id = member[0]
    
    # Parse start date
    try:
        loan_start = datetime.strptime(start_date, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError("Invalid date format. Use YYYY-MM-DD")
    
    # Calculate end date
    end_date = loan_start + relativedelta(months=installments)
    
    # Create loan
    result = db.execute(
        text("""
            INSERT INTO loans (member_id, amount, interest_rate, installments, status, 
                             start_date, end_date, description)
            VALUES (:member_id, :amount, :interest_rate, :installments, :status,
                   :start_date, :end_date, :description)
            RETURNING id, member_id, amount, interest_rate, installments, status, 
                     start_date, end_date, description
        """),
        {
            "member_id": member_id,
            "amount": amount,
            "interest_rate": interest_rate,
            "installments": installments,
            "status": "approved",
            "start_date": loan_start,
            "end_date": end_date,
            "description": description
        }
    )
    loan = result.fetchone()
    loan_id = loan[0]
    
    # Calculate loan installments using reducing balance
    from app.api.services.loan_service import calculate_loan
    loan_calculation = calculate_loan(amount, interest_rate, installments, start_date)
    
    today = datetime.now().date()
    paid_count = 0
    pending_count = 0
    
    # Create all installment payments
    for idx, installment in enumerate(loan_calculation["installment_breakdown"], 1):
        transaction_id = f"LOAN-{loan_id}-INST-{idx}-{uuid.uuid4().hex[:8]}"
        due_date_obj = datetime.strptime(installment['due_date'], "%Y-%m-%d").date()
        
        # Check if due date is before today
        if due_date_obj < today:
            # Mark as paid
            payment_date = due_date_obj
            total_pending = 0
            paid_count += 1
        else:
            # Keep as pending
            payment_date = None
            total_pending = installment['total_payment']
            pending_count += 1
        
        db.execute(
            text("""
                INSERT INTO payments 
                (member_id, payment_type, total_loan_amount, description, payment_date,
                 due_date, transaction_id, days_late, penalty_amount, total_pending_amount)
                VALUES 
                (:member_id, :payment_type, :total_loan_amount, :description, :payment_date,
                 :due_date, :transaction_id, :days_late, :penalty_amount, :total_pending_amount)
            """),
            {
                "member_id": member_id,
                "payment_type": "loan_installment",
                "total_loan_amount": amount,
                "description": f"Loan #{loan_id} - Installment {idx}/{installments}",
                "payment_date": payment_date,
                "due_date": due_date_obj,
                "transaction_id": transaction_id,
                "days_late": 0,
                "penalty_amount": 0.0,
                "total_pending_amount": total_pending
            }
        )
    
    db.commit()
    
    return {
        "message": "Loan created and approved successfully",
        "loan": {
            "id": loan[0],
            "member_id": loan[1],
            "member_name": member[1],
            "member_phone": member[2],
            "amount": loan[2],
            "interest_rate": loan[3],
            "installments": loan[4],
            "status": loan[5],
            "start_date": loan[6].strftime("%Y-%m-%d"),
            "end_date": loan[7].strftime("%Y-%m-%d") if loan[7] else None,
            "description": loan[8]
        },
        "installments_summary": {
            "total": installments,
            "paid": paid_count,
            "pending": pending_count
        }
    }


def get_member_installments_by_phone(db: Session, phone: str):
    """Get all loan installments grouped by loan for a member by phone or name (admin only)"""
    # Get member by phone or name
    result = db.execute(
        text("""
            SELECT id, name, phone 
            FROM users 
            WHERE phone = :exact_phone
            OR phone ILIKE :search 
            OR name ILIKE :search
            LIMIT 1
        """),
        {"exact_phone": phone, "search": f"%{phone}%"}
    )
    member = result.fetchone()
    
    if not member:
        raise ValueError("Member not found with this phone number")
    
    member_id = member[0]
    
    # Get all loans for this member
    result = db.execute(
        text("""
            SELECT id, member_id, amount, interest_rate, installments, 
                   status, start_date, end_date, description
            FROM loans
            WHERE member_id = :member_id
            ORDER BY start_date DESC
        """),
        {"member_id": member_id}
    )
    loans = result.fetchall()
    
    loans_with_installments = []
    total_pending = 0
    total_paid = 0
    
    for loan in loans:
        loan_id = loan[0]
        
        # Get installments for this loan
        result = db.execute(
            text("""
                SELECT id, member_id, payment_type, total_loan_amount, description,
                       payment_date, due_date, transaction_id, days_late, 
                       penalty_amount, total_pending_amount
                FROM payments
                WHERE member_id = :member_id 
                AND payment_type = 'loan_installment'
                AND description LIKE :pattern
                ORDER BY due_date ASC
            """),
            {"member_id": member_id, "pattern": f"Loan #{loan_id} -%"}
        )
        installments = result.fetchall()
        
        pending = []
        paid = []
        
        for inst in installments:
            installment_data = {
                "id": inst[0],
                "member_id": inst[1],
                "payment_type": inst[2],
                "total_loan_amount": inst[3],
                "description": inst[4],
                "payment_date": inst[5].strftime("%Y-%m-%d") if inst[5] else None,
                "due_date": inst[6].strftime("%Y-%m-%d") if inst[6] else None,
                "transaction_id": inst[7],
                "days_late": inst[8],
                "penalty_amount": inst[9],
                "total_pending_amount": inst[10],
                "status": "paid" if inst[5] else "pending"
            }
            
            if inst[5]:  # payment_date is not null
                paid.append(installment_data)
                total_paid += 1
            else:
                pending.append(installment_data)
                total_pending += 1
        
        loans_with_installments.append({
            "loan_id": loan[0],
            "purpose": loan[8],
            "loan_details": {
                "amount": loan[2],
                "interest_rate": loan[3],
                "total_installments": loan[4],
                "status": loan[5],
                "start_date": loan[6].strftime("%Y-%m-%d") if loan[6] else None,
                "end_date": loan[7].strftime("%Y-%m-%d") if loan[7] else None
            },
            "installments": {
                "total": len(installments),
                "pending_count": len(pending),
                "paid_count": len(paid),
                "pending": pending,
                "paid": paid
            }
        })
    
    return {
        "member": {
            "id": member[0],
            "name": member[1],
            "phone": member[2]
        },
        "summary": {
            "total_loans": len(loans),
            "total_installments": total_pending + total_paid,
            "total_pending": total_pending,
            "total_paid": total_paid
        },
        "loans": loans_with_installments
    }


def get_payments_by_month(db: Session, month_year: str):
    """
    Get all payments for a specific month-year with member details
    Format: YYYY-MM (e.g., 2026-03 for March 2026)
    Returns: List of payments with member name, phone, amount, payment type
    """
    from datetime import datetime
    
    # Validate and parse month_year
    try:
        year, month = month_year.split('-')
        year = int(year)
        month = int(month)
        if month < 1 or month > 12:
            raise ValueError("Month must be between 1 and 12")
    except (ValueError, AttributeError):
        raise ValueError("Invalid month_year format. Use YYYY-MM (e.g., 2026-03)")
    
    # Query all payments for the given month where payment_date is not null
    query = text("""
        SELECT 
            p.id,
            p.member_id,
            u.name as member_name,
            u.phone as member_phone,
            p.payment_type,
            p.total_loan_amount,
            p.total_pending_amount,
            p.payment_date,
            p.due_date,
            p.transaction_id,
            p.days_late,
            p.penalty_amount,
            p.description
        FROM payments p
        JOIN users u ON p.member_id = u.id
        WHERE p.payment_date IS NOT NULL
        AND EXTRACT(YEAR FROM p.payment_date) = :year
        AND EXTRACT(MONTH FROM p.payment_date) = :month
        ORDER BY p.payment_date DESC, u.name ASC
    """)
    
    result = db.execute(query, {"year": year, "month": month})
    rows = result.fetchall()
    
    payments = []
    total_contribution = 0
    total_loan_emi = 0
    total_penalties = 0
    
    for row in rows:
        amount = row[5] if row[5] else row[6]  # total_loan_amount or total_pending_amount
        penalty = row[11] if row[11] else 0
        
        payment = {
            "id": row[0],
            "member_id": row[1],
            "member_name": row[2],
            "member_phone": row[3],
            "payment_type": row[4],
            "amount": float(amount) if amount else 0,
            "payment_date": row[7].strftime("%Y-%m-%d") if row[7] else None,
            "due_date": row[8].strftime("%Y-%m-%d") if row[8] else None,
            "transaction_id": row[9],
            "days_late": row[10] if row[10] else 0,
            "penalty_amount": float(penalty),
            "description": row[12]
        }
        
        payments.append(payment)
        
        # Calculate totals
        if row[4] == 'monthly_contribution':
            total_contribution += float(amount) if amount else 0
        elif row[4] == 'loan_installment':
            total_loan_emi += float(amount) if amount else 0
        
        total_penalties += float(penalty)
    
    return {
        "month_year": month_year,
        "total_payments": len(payments),
        "summary": {
            "total_contribution": round(total_contribution, 2),
            "total_loan_emi": round(total_loan_emi, 2),
            "total_penalties": round(total_penalties, 2),
            "grand_total": round(total_contribution + total_loan_emi + total_penalties, 2)
        },
        "payments": payments
    }


def update_user_details(db: Session, user_id: int, name: str = None, phone: str = None, 
                       password: str = None, is_active: bool = None):
    """
    Update user details (admin only)
    Only provided fields will be updated
    """
    # Check if user exists
    result = db.execute(
        text("SELECT id, name, phone, is_active FROM users WHERE id = :user_id"),
        {"user_id": user_id}
    )
    user = result.fetchone()
    
    if not user:
        raise ValueError("User not found")
    
    # Build update query dynamically based on provided fields
    update_fields = []
    params = {"user_id": user_id}
    
    if name is not None:
        update_fields.append("name = :name")
        params["name"] = name
    
    if phone is not None:
        # Check if phone already exists for another user
        result = db.execute(
            text("SELECT id FROM users WHERE phone = :phone AND id != :user_id"),
            {"phone": phone, "user_id": user_id}
        )
        if result.fetchone():
            raise ValueError("Phone number already exists for another user")
        update_fields.append("phone = :phone")
        params["phone"] = phone
    
    if password is not None:
        update_fields.append("password = :password")
        params["password"] = password
    
    if is_active is not None:
        update_fields.append("is_active = :is_active")
        params["is_active"] = is_active
    
    if not update_fields:
        raise ValueError("No fields to update")
    
    # Execute update
    update_query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = :user_id"
    db.execute(text(update_query), params)
    db.commit()
    
    # Get updated user
    result = db.execute(
        text("SELECT id, phone, name, is_admin, join_date, is_active FROM users WHERE id = :user_id"),
        {"user_id": user_id}
    )
    updated_user = result.fetchone()
    
    return {
        "message": "User updated successfully",
        "user": {
            "id": updated_user[0],
            "phone": updated_user[1],
            "name": updated_user[2],
            "is_admin": updated_user[3],
            "join_date": updated_user[4].strftime("%Y-%m-%d") if updated_user[4] else None,
            "is_active": updated_user[5]
        }
    }
