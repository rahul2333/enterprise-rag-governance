from pydantic import BaseModel, EmailStr

from app.models.enums import UserRole


class UserListItem(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    department: str | None
    access_group: str | None
    is_active: bool

    model_config = {"from_attributes": True}


class UserRoleUpdate(BaseModel):
    role: UserRole
