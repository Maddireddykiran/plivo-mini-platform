from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    credits: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class MessageCreate(BaseModel):
    recipient_username: str
    content: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    recipient_id: int
    content: str
    status: str
    created_at: datetime
    sender_username: str
    recipient_username: str
    
    class Config:
        from_attributes = True

class RechargeCreate(BaseModel):
    amount: int

class RechargeResponse(BaseModel):
    id: int
    user_id: int
    amount: int
    transaction_id: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserBalance(BaseModel):
    credits: int
