from sqlalchemy.orm import Session
from sqlalchemy import text
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional
import os

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def is_admin(db: Session, phone: str, password: str):
    result=authenticate_user(db, phone, password)
    return result and result.get("is_admin")

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
