from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.database import get_db
from app.api.schemas import Token
from app.api.services.auth_service import login_user

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """User login endpoint - use phone as username"""
    result = login_user(db, form_data.username, form_data.password)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return result

