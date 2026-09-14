import time
import uuid

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
from jose.exceptions import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.config import settings
from app.db import get_db
from app.models.business import Business, Membership

bearer_scheme = HTTPBearer()

# Supabase now signs auth tokens with asymmetric JWT Signing Keys rather than a
# shared HS256 secret, so we verify against its public JWKS endpoint instead of
# a static secret. See https://supabase.com/docs/guides/auth/signing-keys.
_ALLOWED_ALGORITHMS = {"ES256", "RS256"}
_JWKS_CACHE_TTL_SECONDS = 3600
_jwks_cache: dict[str, object] = {"keys": [], "fetched_at": 0.0}


async def _fetch_jwks() -> list[dict]:
    url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()["keys"]


async def _get_jwks(force_refresh: bool = False) -> list[dict]:
    now = time.monotonic()
    stale = now - _jwks_cache["fetched_at"] > _JWKS_CACHE_TTL_SECONDS  # type: ignore[operator]
    if force_refresh or not _jwks_cache["keys"] or stale:
        _jwks_cache["keys"] = await _fetch_jwks()
        _jwks_cache["fetched_at"] = now
    return _jwks_cache["keys"]  # type: ignore[return-value]


async def _find_jwk(kid: str) -> dict | None:
    for key in await _get_jwks():
        if key.get("kid") == kid:
            return key
    # Unknown kid could mean the signing key was just rotated — refresh once and retry.
    for key in await _get_jwks(force_refresh=True):
        if key.get("kid") == kid:
            return key
    return None


class CurrentUser:
    def __init__(self, auth_user_id: uuid.UUID):
        self.auth_user_id = auth_user_id


async def verify_supabase_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> CurrentUser:
    token = credentials.credentials

    try:
        header = jwt.get_unverified_header(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed token")

    alg = header.get("alg")
    kid = header.get("kid")
    if alg not in _ALLOWED_ALGORITHMS or not kid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unsupported token")

    jwk = await _find_jwk(kid)
    if jwk is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown signing key")

    try:
        payload = jwt.decode(token, jwk, algorithms=[alg], audience="authenticated")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing subject")

    return CurrentUser(auth_user_id=uuid.UUID(sub))


async def get_current_membership(
    user: CurrentUser = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_db),
) -> Membership:
    result = await db.execute(
        select(Membership)
        .options(joinedload(Membership.business))
        .where(Membership.auth_user_id == user.auth_user_id)
    )
    membership = result.scalars().first()

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No business is associated with this account",
        )

    return membership


async def get_current_business(
    membership: Membership = Depends(get_current_membership),
) -> Business:
    return membership.business
