import uuid
from datetime import date, datetime, timedelta

from dateutil.relativedelta import relativedelta
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.config import MONTHLY_CONTRIBUTION, PENALTY_PER_DAY


def approve_loan_application(db: Session, loan_id: int):
    """Approve a loan application and create payment installments"""
    result = db.execute(
        text("SELECT id, member_id, amount, interest_rate, installments, status, start_date FROM loans WHERE id = :loan_id"),
        {"loan_id": loan_id}
    )
    loan = result.fetchone()

    if not loan:
        raise ValueError("Loan not found")

    if loan[5] != "pending":
        raise ValueError(f"Loan is already {loan[5]}")

    loan_amount = loan[2]
    interest_rate = loan[3]
    installments = loan[4]
    start_date = loan[6] if loan[6] else date.today()

    loan_calculation = calculate_loan(loan_amount, interest_rate, installments, start_date.strftime("%Y-%m-%d"))

    db.execute(
        text("UPDATE loans SET status = 'approved' WHERE id = :loan_id"),
        {"loan_id": loan_id}
    )

    for idx, installment in enumerate(loan_calculation["installment_breakdown"], 1):
        due_date_obj = datetime.strptime(installment['due_date'], "%Y-%m-%d").date()
        transaction_id = f"LOAN-{loan_id}-INST-{idx}-{uuid.uuid4().hex[:8]}"

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
                "member_id": int(loan[1]),
                "payment_type": "loan_installment",
                "total_loan_amount": float(loan_amount),
                "description": f"Loan #{loan_id} - Installment {idx}/{installments}",
                "payment_date": None,
                "due_date": due_date_obj,
                "transaction_id": transaction_id,
                "days_late": 0,
                "penalty_amount": 0.0,
                "total_pending_amount": float(installment['total_payment'])
            }
        )

    db.commit()

    result = db.execute(
        text("""
            SELECT id, member_id, amount, interest_rate, installments, status, start_date, end_date, description
            FROM loans WHERE id = :loan_id
        """),
        {"loan_id": loan_id}
    )
    updated_loan = result.fetchone()

    return {
        "id": updated_loan[0],
        "member_id": updated_loan[1],
        "amount": updated_loan[2],
        "interest_rate": updated_loan[3],
        "installments": updated_loan[4],
        "status": updated_loan[5],
        "start_date": updated_loan[6],
        "end_date": updated_loan[7],
        "description": updated_loan[8]
    }


def apply_for_loan(db: Session, user_id: int, loan_data):
    """Apply for a loan"""
    result = db.execute(
        text("""
            SELECT id, total_amount, pending_installments, total_penalty, pending_amount
            FROM loan_status
            WHERE member_id = :member_id
            ORDER BY application_date DESC
            LIMIT 1
        """),
        {"member_id": user_id}
    )
    active_loan = result.fetchone()

    if active_loan:
        loan_id, total_amount, pending_installments, total_penalty, pending_amount = active_loan

        paid_amount = total_amount - pending_amount
        completion_percentage = (paid_amount / total_amount * 100) if total_amount > 0 else 0

        if completion_percentage < 50:
            raise ValueError(
                f"Cannot apply for new loan. Previous loan is only {completion_percentage:.1f}% completed. "
                f"Must complete at least 50% before applying for a new loan."
            )

    start_date = date.today()
    end_date = start_date + timedelta(days=30 * loan_data.installments)

    result = db.execute(
        text("""
            INSERT INTO loans (member_id, amount, interest_rate, installments, status, start_date, end_date, description)
            VALUES (:member_id, :amount, :interest_rate, :installments, :status, :start_date, :end_date, :description)
            RETURNING id, member_id, amount, interest_rate, installments, status, start_date, end_date, description
        """),
        {
            "member_id": user_id,
            "amount": loan_data.amount,
            "interest_rate": loan_data.interest_rate,
            "installments": loan_data.installments,
            "status": "pending",
            "start_date": start_date,
            "end_date": end_date,
            "description": loan_data.description
        }
    )
    db.commit()

    loan = result.fetchone()
    return {
        "id": loan[0],
        "member_id": loan[1],
        "amount": loan[2],
        "interest_rate": loan[3],
        "installments": loan[4],
        "status": loan[5],
        "start_date": loan[6],
        "end_date": loan[7],
        "description": loan[8]
    }


def get_all_loans(db: Session):
    """Get all loans (admin only)"""
    result = db.execute(
        text("""
            SELECT id, member_id, amount, interest_rate, installments, status,
                   start_date, end_date, description
            FROM loans
            ORDER BY id DESC
        """)
    )
    loans = result.fetchall()

    return [
        {
            "id": loan[0],
            "member_id": loan[1],
            "amount": loan[2],
            "interest_rate": loan[3],
            "installments": loan[4],
            "status": loan[5],
            "start_date": loan[6],
            "end_date": loan[7],
            "description": loan[8]
        }
        for loan in loans
    ]


def calculate_loan(amount: float, interest_rate: float, installments: int, start_date: str = None):
    """Calculate loan details with reducing balance interest method"""
    if amount <= 0:
        raise ValueError("Loan amount must be greater than 0")
    if installments <= 0:
        raise ValueError("Installments must be greater than 0")
    if interest_rate < 0:
        raise ValueError("Interest rate cannot be negative")

    if start_date:
        try:
            loan_start = datetime.strptime(start_date, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Invalid date format. Use YYYY-MM-DD")
    else:
        loan_start = datetime.now().date()

    if loan_start.day <= 10:
        first_due_date = loan_start.replace(day=10)
    else:
        first_due_date = (loan_start + relativedelta(months=1)).replace(day=10)

    monthly_interest_rate = interest_rate / 100
    principal_per_month = amount / installments

    total_interest = 0
    remaining_balance = amount
    installment_details = []
    current_due_date = first_due_date

    for month in range(1, installments + 1):
        interest_for_month = remaining_balance * monthly_interest_rate
        total_interest += interest_for_month
        monthly_payment = principal_per_month + interest_for_month

        installment_details.append({
            "month": month,
            "due_date": current_due_date.strftime("%Y-%m-%d"),
            "principal": round(principal_per_month, 2),
            "interest": round(interest_for_month, 2),
            "total_payment": round(monthly_payment, 2),
            "remaining_balance": round(remaining_balance - principal_per_month, 2)
        })

        remaining_balance -= principal_per_month
        current_due_date = (current_due_date + relativedelta(months=1)).replace(day=10)

    total_amount = amount + total_interest
    all_due_dates = [installment["due_date"] for installment in installment_details]

    return {
        "principal_amount": amount,
        "interest_rate": interest_rate,
        "installments": installments,
        "loan_start_date": loan_start.strftime("%Y-%m-%d"),
        "first_due_date": first_due_date.strftime("%Y-%m-%d"),
        "last_due_date": all_due_dates[-1] if all_due_dates else None,
        "all_due_dates": all_due_dates,
        "total_interest": round(total_interest, 2),
        "total_amount": round(total_amount, 2),
        "installment_breakdown": installment_details
    }


def process_monthly_contribution(db: Session, member_id: int, payment_transaction_id: str):
    """Process monthly contribution payment of ₹1000"""
    today = date.today()
    current_month = today.replace(day=1)
    due_date = current_month.replace(day=10)

    result = db.execute(
        text("""
            SELECT id FROM payments
            WHERE member_id = :member_id
            AND payment_type = 'monthly_contribution'
            AND due_date = :due_date
            AND payment_date IS NOT NULL
        """),
        {"member_id": member_id, "due_date": due_date}
    )
    existing_payment = result.fetchone()

    if existing_payment:
        raise ValueError(f"Monthly contribution for {due_date.strftime('%B %Y')} already paid")

    days_late = 0
    penalty_amount = 0.0

    if today > due_date:
        penalty_start_date = due_date.replace(day=12)
        if today >= penalty_start_date:
            days_late = (today - due_date).days
            penalty_amount = days_late * PENALTY_PER_DAY

    total_amount = MONTHLY_CONTRIBUTION + penalty_amount
    transaction_id = f"MC-{member_id}-{today.strftime('%Y%m')}-{payment_transaction_id}"

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
            "payment_type": "monthly_contribution",
            "total_loan_amount": MONTHLY_CONTRIBUTION,
            "description": f"Monthly contribution for {due_date.strftime('%B %Y')}",
            "payment_date": today,
            "due_date": due_date,
            "transaction_id": transaction_id,
            "days_late": days_late,
            "penalty_amount": penalty_amount,
            "total_pending_amount": 0
        }
    )

    db.commit()

    return {
        "message": "Monthly contribution paid successfully",
        "contribution_amount": MONTHLY_CONTRIBUTION,
        "penalty_amount": penalty_amount,
        "days_late": days_late,
        "total_paid": total_amount,
        "payment_date": today.strftime("%Y-%m-%d"),
        "due_date": due_date.strftime("%Y-%m-%d"),
        "transaction_id": transaction_id
    }


def pay_loan_installment(db: Session, member_id: int, installment_id: int, payment_transaction_id: str):
    """Pay a loan installment"""
    result = db.execute(
        text("""
            SELECT id, member_id, total_pending_amount, due_date, payment_date, payment_type
            FROM payments
            WHERE id = :installment_id AND member_id = :member_id
        """),
        {"installment_id": installment_id, "member_id": member_id}
    )
    installment = result.fetchone()

    if not installment:
        raise ValueError("Installment not found or does not belong to you")

    if installment[4] is not None:
        raise ValueError("Installment already paid")

    if installment[5] != "loan_installment":
        raise ValueError("This is not a loan installment")

    today = date.today()
    due_date = installment[3]

    days_late = 0
    penalty_amount = 0.0

    if today > due_date:
        penalty_start_date = due_date + timedelta(days=1)
        if today >= penalty_start_date:
            days_late = (today - due_date).days
            penalty_amount = days_late * PENALTY_PER_DAY

    db.execute(
        text("""
            UPDATE payments
            SET payment_date = :payment_date,
                days_late = :days_late,
                penalty_amount = :penalty_amount,
                total_pending_amount = 0,
                transaction_id = :transaction_id
            WHERE id = :installment_id
        """),
        {
            "payment_date": today,
            "days_late": days_late,
            "penalty_amount": penalty_amount,
            "transaction_id": f"EMI-{installment_id}-{payment_transaction_id}",
            "installment_id": installment_id
        }
    )

    db.commit()

    return {
        "message": "Loan installment paid successfully",
        "installment_id": installment_id,
        "amount_paid": installment[2],
        "penalty_amount": penalty_amount,
        "days_late": days_late,
        "total_paid": installment[2] + penalty_amount,
        "payment_date": today.strftime("%Y-%m-%d"),
        "due_date": due_date.strftime("%Y-%m-%d"),
        "transaction_id": f"EMI-{installment_id}-{payment_transaction_id}"
    }


def get_all_installments(db: Session, member_id: int):
    """Get all loan installments (pending and paid) for a member"""
    result = db.execute(
        text("""
            SELECT id, member_id, payment_type, total_loan_amount, description,
                   payment_date, due_date, transaction_id, days_late,
                   penalty_amount, total_pending_amount
            FROM payments
            WHERE member_id = :member_id AND payment_type = 'loan_installment'
            ORDER BY due_date ASC
        """),
        {"member_id": member_id}
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

        if inst[5]:
            paid.append(installment_data)
        else:
            pending.append(installment_data)

    return {
        "total_installments": len(installments),
        "pending_count": len(pending),
        "paid_count": len(paid),
        "pending_installments": pending,
        "paid_installments": paid
    }


def get_member_earnings(db: Session, member_id: int):
    """Calculate member's share of earnings from interest and penalties"""
    result = db.execute(
        text("""
            SELECT COUNT(*) FROM users WHERE is_active = true AND is_admin = false
        """)
    )
    total_members = result.fetchone()[0]

    if total_members == 0:
        raise ValueError("No active members found")

    result = db.execute(
        text("""
            SELECT id, amount, interest_rate, installments
            FROM loans
            WHERE status = 'approved'
        """)
    )
    loans = result.fetchall()

    total_interest_earned = 0

    for loan in loans:
        loan_id, amount, interest_rate, installments = loan

        result = db.execute(
            text("""
                SELECT COUNT(*)
                FROM payments
                WHERE payment_type = 'loan_installment'
                AND description LIKE :pattern
                AND payment_date IS NOT NULL
            """),
            {"pattern": f"Loan #{loan_id} -%"}
        )
        paid_count = result.fetchone()[0]

        if paid_count > 0:
            monthly_interest_rate = interest_rate / 100
            principal_per_month = amount / installments
            remaining_balance = amount

            for month in range(1, paid_count + 1):
                interest_for_month = remaining_balance * monthly_interest_rate
                total_interest_earned += interest_for_month
                remaining_balance -= principal_per_month

    result = db.execute(
        text("""
            SELECT COALESCE(SUM(penalty_amount), 0) as total_penalties
            FROM payments
            WHERE payment_date IS NOT NULL AND penalty_amount > 0
        """)
    )
    total_penalties = result.fetchone()[0]

    interest_per_member = total_interest_earned / total_members if total_members > 0 else 0
    penalty_per_member = total_penalties / total_members if total_members > 0 else 0
    total_earning_per_member = interest_per_member + penalty_per_member

    result = db.execute(
        text("""
            SELECT COALESCE(SUM(penalty_amount), 0) as my_penalties
            FROM payments
            WHERE member_id = :member_id AND payment_date IS NOT NULL
        """),
        {"member_id": member_id}
    )
    member_penalty_paid = result.fetchone()[0]

    return {
        "member_id": member_id,
        "total_active_members": total_members,
        "earnings": {
            "interest_share": round(interest_per_member, 2),
            "penalty_share": round(penalty_per_member, 2),
            "total_earning": round(total_earning_per_member, 2)
        },
        "group_totals": {
            "total_interest_earned": round(total_interest_earned, 2),
            "total_penalties_collected": round(total_penalties, 2),
            "grand_total": round(total_interest_earned + total_penalties, 2)
        },
        "member_contribution": {
            "penalty_paid_by_me": round(member_penalty_paid, 2)
        }
    }
