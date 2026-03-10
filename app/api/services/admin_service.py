from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import date

from app.api.schemas import UserCreate

def create_user_account(db: Session, user_data: UserCreate) -> dict:
    """Create a new user account"""
    # Check if phone already exists
    result = db.execute(
        text("SELECT id FROM users WHERE phone = :phone"),
        {"phone": user_data.phone}
    )
    if result.fetchone():
        raise ValueError("Phone number already registered")

    # Insert new user with plain text password
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

    user = result.fetchone()
    return {
        "id": user[0],
        "phone": user[1],
        "name": user[2],
        "is_admin": user[3],
        "join_date": user[4],
        "is_active": user[5]
    }


def get_all_user(db: Session):
    """Get all users with their payment details"""
    result = db.execute(
        text("""
            SELECT 
                u.id, u.phone, u.name, u.is_admin, u.join_date, u.is_active
                from users u
        """)
    )
    rows = result.fetchall()

    users_dict = {}
    for row in rows:
        user_id = row[0]
        if user_id not in users_dict:
            users_dict[user_id] = {
                "id": row[0],
                "phone": row[1],
                "name": row[2],
                "is_admin": row[3],
                "join_date": row[4],
                "is_active": row[5],
            }
    return list(users_dict.values())


def create_emergency_admin(db: Session, user_data):
    """Create emergency admin user without authentication"""
    # Check if phone already exists
    result = db.execute(
        text("SELECT id FROM users WHERE phone = :phone"),
        {"phone": user_data.phone}
    )
    if result.fetchone():
        raise ValueError("Phone number already registered")

    # Get next id from sequence
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

    user = result.fetchone()
    return {
        "id": user[0],
        "phone": user[1],
        "name": user[2],
        "is_admin": user[3],
        "join_date": user[4],
        "is_active": user[5]
    }


def reset_member_password(db: Session, phone: str, new_password: str):
    """Reset a member's password (admin only)"""
    # Check if user exists
    result = db.execute(
        text("SELECT id, name FROM users WHERE phone = :phone"),
        {"phone": phone}
    )
    user = result.fetchone()
    
    if not user:
        raise ValueError("User not found")
    
    # Update password
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


def get_all_user_with_payment_and_loan_history(db: Session):
    """Get all users with their payment details and loan history"""
    # Get all users
    users_result = db.execute(
        text("""
            SELECT id, phone, name, is_admin, join_date, is_active
            FROM users
            ORDER BY id
        """)
    )
    users = users_result.fetchall()
    
    users_list = []
    
    for user in users:
        user_id = user[0]
        
        # Get payment history for this user
        payments_result = db.execute(
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
        payments = payments_result.fetchall()
        
        # Get loan history for this user
        loans_result = db.execute(
            text("""
                SELECT id, member_id, amount, interest_rate, installments,
                       status, start_date, end_date, description
                FROM loans
                WHERE member_id = :user_id
                ORDER BY start_date DESC
            """),
            {"user_id": user_id}
        )
        loans = loans_result.fetchall()
        
        # Build payment history list
        payment_history = []
        for payment in payments:
            payment_history.append({
                "id": payment[0],
                "member_id": payment[1],
                "payment_type": payment[2],
                "total_loan_amount": payment[3],
                "description": payment[4],
                "payment_date": payment[5],
                "due_date": payment[6],
                "transaction_id": payment[7],
                "days_late": payment[8],
                "penalty_amount": payment[9],
                "total_pending_amount": payment[10]
            })
        
        # Build loan history list
        loan_history = []
        for loan in loans:
            loan_history.append({
                "id": loan[0],
                "member_id": loan[1],
                "amount": loan[2],
                "interest_rate": loan[3],
                "installments": loan[4],
                "status": loan[5],
                "start_date": loan[6],
                "end_date": loan[7],
                "description": loan[8]
            })
        
        # Build user object with payment and loan history
        users_list.append({
            "id": user[0],
            "phone": user[1],
            "name": user[2],
            "is_admin": user[3],
            "join_date": user[4],
            "is_active": user[5],
            "payment_history": payment_history,
            "loan_history": loan_history
        })
    
    return users_list


def get_user_by_phone_with_payment_and_loan_history(db: Session, phone: str):
    """Get user by phone number with their payment details and loan history"""
    # Get user by phone
    user_result = db.execute(
        text("""
            SELECT id, phone, name, is_admin, join_date, is_active
            FROM users
            WHERE phone = :phone
        """),
        {"phone": phone}
    )
    user = user_result.fetchone()
    
    if not user:
        raise ValueError("User not found")
    
    user_id = user[0]
    
    # Get payment history for this user
    payments_result = db.execute(
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
    payments = payments_result.fetchall()
    
    # Get loan history for this user
    loans_result = db.execute(
        text("""
            SELECT id, member_id, amount, interest_rate, installments,
                   status, start_date, end_date, description
            FROM loans
            WHERE member_id = :user_id
            ORDER BY start_date DESC
        """),
        {"user_id": user_id}
    )
    loans = loans_result.fetchall()
    
    # Build payment history list
    payment_history = []
    for payment in payments:
        payment_history.append({
            "id": payment[0],
            "member_id": payment[1],
            "payment_type": payment[2],
            "total_loan_amount": payment[3],
            "description": payment[4],
            "payment_date": payment[5],
            "due_date": payment[6],
            "transaction_id": payment[7],
            "days_late": payment[8],
            "penalty_amount": payment[9],
            "total_pending_amount": payment[10]
        })
    
    # Build loan history list
    loan_history = []
    for loan in loans:
        loan_history.append({
            "id": loan[0],
            "member_id": loan[1],
            "amount": loan[2],
            "interest_rate": loan[3],
            "installments": loan[4],
            "status": loan[5],
            "start_date": loan[6],
            "end_date": loan[7],
            "description": loan[8]
        })
    
    # Build user object with payment and loan history
    return {
        "id": user[0],
        "phone": user[1],
        "name": user[2],
        "is_admin": user[3],
        "join_date": user[4],
        "is_active": user[5],
        "payment_history": payment_history,
        "loan_history": loan_history
    }


def get_financial_summary(db: Session):
    """Get complete financial summary of the SHG"""
    
    # Total monthly contributions collected
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
    
    # Total loan installments collected
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
    
    # Total loans disbursed
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
    
    # Pending loan installments
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
    
    # Member-wise penalty details
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
    
    # Calculate totals
    total_collection = contributions[0] + emi_collections[0]
    total_penalties = contributions[1] + emi_collections[1]
    total_disbursed = loans_disbursed[0]
    
    # Available amount = Total collections + Total penalties - Total disbursed
    available_amount = total_collection + total_penalties - total_disbursed
    
    # Member penalty list
    penalty_members = []
    for member in member_penalties:
        penalty_members.append({
            "member_id": member[0],
            "name": member[1],
            "phone": member[2],
            "total_penalty": member[3]
        })
    
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
