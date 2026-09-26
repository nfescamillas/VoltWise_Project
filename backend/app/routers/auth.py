from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from ..auth import TOKEN_TTL_SECONDS, create_access_token, get_current_user
from ..models import RegisterRequest, TokenRequest, TokenResponse, UserPublic
from ..store import store

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest) -> UserPublic:
    try:
        user = store.add_user(request.username, request.password)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists") from None
    return UserPublic(username=user.username)


@router.post("/token", response_model=TokenResponse)
def issue_token(request: TokenRequest) -> TokenResponse:
    user = store.authenticate(request.username, request.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenResponse(
        access_token=create_access_token(user.username),
        expires_in=TOKEN_TTL_SECONDS,
    )


@router.get("/me", response_model=UserPublic)
def current_user(user: Annotated[UserPublic, Depends(get_current_user)]) -> UserPublic:
    return user

