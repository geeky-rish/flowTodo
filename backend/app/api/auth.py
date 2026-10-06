from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import create_access_token, get_current_user
from app.database.connection import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthService, DuplicateUserError, serialize_user
from app.services.category_service import CategoryService


router = APIRouter(prefix="/auth", tags=["auth"])
CurrentUser = Annotated[dict, Depends(get_current_user)]


def get_auth_service() -> AuthService:
    return AuthService(get_db())


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, svc: AuthService = Depends(get_auth_service)):
    try:
        user = await svc.create_user(data)
    except DuplicateUserError as exc:
        raise HTTPException(status_code=409, detail="Username or email is already registered") from exc
    await CategoryService(get_db()).seed_defaults(str(user["_id"]))
    public_user = serialize_user(user)
    return {
        "access_token": create_access_token(str(user["_id"])),
        "token_type": "bearer",
        "user": public_user,
    }


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, svc: AuthService = Depends(get_auth_service)):
    user = await svc.authenticate(data.identifier, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username/email or password")
    return {
        "access_token": create_access_token(str(user["_id"])),
        "token_type": "bearer",
        "user": serialize_user(user),
    }


@router.get("/me", response_model=UserResponse)
async def me(current_user: CurrentUser):
    return serialize_user(current_user)
