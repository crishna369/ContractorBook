from fastapi import APIRouter, Depends

from app.auth import get_current_membership
from app.models.business import Membership
from app.schemas.me import Me

router = APIRouter(tags=["me"])


@router.get("/me", response_model=Me)
async def read_me(membership: Membership = Depends(get_current_membership)) -> Me:
    return Me(
        business_id=membership.business_id,
        business_name=membership.business.name,
        auth_user_id=membership.auth_user_id,
        role=membership.role,
    )
