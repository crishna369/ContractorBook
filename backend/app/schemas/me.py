import uuid

from pydantic import BaseModel


class Me(BaseModel):
    business_id: uuid.UUID
    business_name: str
    auth_user_id: uuid.UUID
    role: str
