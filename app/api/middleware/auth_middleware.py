from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.config import SECRET_KEY, ALGORITHM
from app.api.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current authenticated user from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone: str = payload.get("sub")
        if phone is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = db.execute(
        text("SELECT id, phone, name, is_admin, is_active FROM users WHERE phone = :phone"),
        {"phone": phone}
    )
    user = result.fetchone()

    if user is None:
        raise credentials_exception

    if not user[4]:  # is_active
        raise HTTPException(status_code=400, detail="Inactive user")

    return {
        "id": user[0],
        "phone": user[1],
        "name": user[2],
        "is_admin": user[3],
        "is_active": user[4]
    }

def get_admin_user(current_user: dict = Depends(get_current_user)):
    """Verify current user is an admin"""
    if not current_user["is_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Admin access required."
        )
    return current_user
