from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def authenticate_user(db: Session, phone: str, password: str):
    """Authenticate user with phone and password"""
    result = db.execute(
        text("SELECT id, phone, name, password, is_admin, is_active FROM users WHERE phone = :phone"),
        {"phone": phone}
    )
    user = result.fetchone()

    if not user:
        return None

    if password != user[3]:  # Plain text password comparison
        return None

    if not user[5]:  # is_active
        return None

    return {
        "id": user[0],
        "phone": user[1],
        "name": user[2],
        "is_admin": user[4]
    }


def login_user(db: Session, phone: str, password: str):
    """Login user and return access token"""
    user = authenticate_user(db, phone, password)

    if not user:
        return None

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["phone"]},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
