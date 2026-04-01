from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# 菜单相关
class MenuItemBase(BaseModel):
    name: str
    category: str = "Mains"
    price: float
    desc: str = ""
    image: str = ""
    tags: List[str] = []
    sales: int = 0

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemResponse(MenuItemBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# 用户相关
class UserBase(BaseModel):
    phone: str
    nickname: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    phone: str
    password: str

class Token(BaseModel):
    token: str
    user: UserResponse

# 订单相关
class OrderItemBase(BaseModel):
    name: str
    price: float
    quantity: int

class OrderItemCreate(OrderItemBase):
    menu_item_id: Optional[int] = None

class OrderItemResponse(OrderItemBase):
    id: int
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    order_no: str
    total_price: float
    status: str = "pending"
    restaurant: str = "Maison Lumière"
    rating: int = 0
    review: str = ""

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

class OrderResponse(OrderBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []
    
    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str

class OrderReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = ""

# 推荐相关
class RecommendationRequest(BaseModel):
    query: str

class RecommendationItem(BaseModel):
    item: MenuItemResponse
    reason: str

class RecommendationResponse(BaseModel):
    suggestions: List[RecommendationItem]
