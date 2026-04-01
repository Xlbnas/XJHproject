from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import random
from datetime import datetime

from .database import init_db, get_db, User, MenuItem, Order, OrderItem
from .auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, init_admin
)
from .schemas import (
    MenuItemCreate, MenuItemResponse,
    UserCreate, UserResponse, UserLogin, Token,
    OrderCreate, OrderResponse, OrderStatusUpdate, OrderReviewCreate,
    RecommendationRequest, RecommendationResponse, RecommendationItem
)

app = FastAPI(title="Smart Order System API")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化数据库
@app.on_event("startup")
async def startup_event():
    init_db()
    db = next(get_db())
    init_admin(db)
    init_default_menu(db)

# 初始化默认菜单数据
def init_default_menu(db: Session):
    count = db.query(MenuItem).count()
    if count == 0:
        default_items = [
            MenuItem(name="Kung Pao Chicken", category="Mains", price=38, 
                    desc="Classic Sichuan dish — tender chicken with crunchy peanuts",
                    image="https://images.unsplash.com/photo-1604908176997-1251884b08a5?auto=format&fit=crop&w=800&q=80",
                    tags="Spicy,Sichuan,Chicken,Hearty", sales=186),
            MenuItem(name="Mapo Tofu", category="Mains", price=32,
                    desc="Soft tofu in spicy Sichuan sauce with minced meat",
                    image="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
                    tags="Spicy,Sichuan,Tofu,Vegetarian", sales=152),
            MenuItem(name="Sweet and Sour Pork", category="Mains", price=36,
                    desc="Crispy pork with tangy sweet and sour sauce",
                    image="https://images.unsplash.com/photo-1564936829992-9f38b51f0564?auto=format&fit=crop&w=800&q=80",
                    tags="Sweet,Sour,Pork,Crispy", sales=128),
            MenuItem(name="Fried Rice", category="Rice & Noodles", price=28,
                    desc="Classic fried rice with eggs, vegetables and shrimp",
                    image="https://images.unsplash.com/photo-1529042410759-bff31c812dba?auto=format&fit=crop&w=800&q=80",
                    tags="Rice,Seafood,Classic,Hearty", sales=145),
            MenuItem(name="Green Tea", category="Drinks", price=8,
                    desc="Traditional Chinese green tea",
                    image="https://images.unsplash.com/photo-1559056199-58995227520e?auto=format&fit=crop&w=800&q=80",
                    tags="Drink,Tea,Traditional,Healthy", sales=192),
        ]
        for item in default_items:
            db.add(item)
        db.commit()
        print("Default menu items created")

# 根路由
@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Smart Order System Backend (Python/FastAPI)",
        "version": "2.0.0"
    }

@app.get("/health")
def health():
    return {"status": "ok"}

# ==================== 认证路由 ====================

@app.post("/api/auth/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 检查用户是否已存在
    existing = db.query(User).filter(User.phone == user.phone).first()
    if existing:
        raise HTTPException(status_code=409, detail="Phone already registered")
    
    # 创建新用户
    hashed_password = get_password_hash(user.password)
    new_user = User(
        phone=user.phone,
        password_hash=hashed_password,
        nickname=user.nickname,
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 生成 token
    token = create_access_token({"id": new_user.id, "phone": new_user.phone})
    
    return {
        "token": token,
        "user": UserResponse.from_orm(new_user)
    }

@app.post("/api/auth/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == credentials.phone).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"id": user.id, "phone": user.phone})
    
    return {
        "token": token,
        "user": UserResponse.from_orm(user)
    }

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)

# ==================== 菜单路由 ====================

@app.get("/api/menu", response_model=List[MenuItemResponse])
def get_menu(db: Session = Depends(get_db)):
    items = db.query(MenuItem).all()
    return [MenuItemResponse(
        id=item.id,
        name=item.name,
        category=item.category,
        price=item.price,
        desc=item.desc,
        image=item.image,
        tags=item.tags.split(",") if item.tags else [],
        sales=item.sales,
        created_at=item.created_at
    ) for item in items]

@app.post("/api/menu", response_model=MenuItemResponse)
def create_menu_item(item: MenuItemCreate, db: Session = Depends(get_db)):
    db_item = MenuItem(
        name=item.name,
        category=item.category,
        price=item.price,
        desc=item.desc,
        image=item.image,
        tags=",".join(item.tags),
        sales=item.sales
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return MenuItemResponse(
        id=db_item.id,
        name=db_item.name,
        category=db_item.category,
        price=db_item.price,
        desc=db_item.desc,
        image=db_item.image,
        tags=db_item.tags.split(",") if db_item.tags else [],
        sales=db_item.sales,
        created_at=db_item.created_at
    )

@app.put("/api/menu/{item_id}", response_model=MenuItemResponse)
def update_menu_item(item_id: int, item: MenuItemCreate, db: Session = Depends(get_db)):
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    db_item.name = item.name
    db_item.category = item.category
    db_item.price = item.price
    db_item.desc = item.desc
    db_item.image = item.image
    db_item.tags = ",".join(item.tags)
    
    db.commit()
    db.refresh(db_item)
    
    return MenuItemResponse(
        id=db_item.id,
        name=db_item.name,
        category=db_item.category,
        price=db_item.price,
        desc=db_item.desc,
        image=db_item.image,
        tags=db_item.tags.split(",") if db_item.tags else [],
        sales=db_item.sales,
        created_at=db_item.created_at
    )

@app.delete("/api/menu/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    db.delete(db_item)
    db.commit()
    
    return {"message": "Menu item deleted successfully"}

# ==================== 订单路由 ====================

def generate_order_no():
    d = datetime.now()
    date = f"{d.year}{d.month:02d}{d.day:02d}"
    r = random.randint(1000, 9999)
    return f"ORD{date}{r}"

@app.post("/api/orders", response_model=OrderResponse)
def create_order(order: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total = sum(item.price * item.quantity for item in order.items)
    order_no = generate_order_no()
    
    db_order = Order(
        order_no=order_no,
        user_id=current_user.id,
        total_price=total,
        status="pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # 添加订单项
    for item in order.items:
        db_item = OrderItem(
            order_id=db_order.id,
            menu_item_id=item.menu_item_id,
            name=item.name,
            price=item.price,
            quantity=item.quantity
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    
    return OrderResponse(
        id=db_order.id,
        order_no=db_order.order_no,
        user_id=db_order.user_id,
        total_price=db_order.total_price,
        status=db_order.status,
        restaurant=db_order.restaurant,
        rating=db_order.rating,
        review=db_order.review,
        created_at=db_order.created_at,
        items=[OrderItemResponse.from_orm(item) for item in db_order.items]
    )

@app.get("/api/orders", response_model=List[OrderResponse])
def get_orders(status: str = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Order).filter(Order.user_id == current_user.id)
    if status:
        query = query.filter(Order.status == status)
    query = query.order_by(Order.created_at.desc())
    orders = query.all()
    
    return [OrderResponse(
        id=order.id,
        order_no=order.order_no,
        user_id=order.user_id,
        total_price=order.total_price,
        status=order.status,
        restaurant=order.restaurant,
        rating=order.rating,
        review=order.review,
        created_at=order.created_at,
        items=[OrderItemResponse.from_orm(item) for item in order.items]
    ) for order in orders]

@app.patch("/api/orders/{order_no}/status")
def update_order_status(order_no: str, update: OrderStatusUpdate, 
                       current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    allowed = ['pending', 'preparing', 'delivering', 'completed']
    if update.status not in allowed:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    order = db.query(Order).filter(Order.order_no == order_no, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = update.status
    db.commit()
    
    return {"order_no": order_no, "status": update.status}

@app.post("/api/orders/{order_no}/review")
def create_review(order_no: str, review: OrderReviewCreate,
                 current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Invalid rating")
    
    order = db.query(Order).filter(Order.order_no == order_no, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.rating = review.rating
    order.review = review.comment
    db.commit()
    
    return {"order_no": order_no, "rating": review.rating}

# ==================== 推荐路由 ====================

@app.get("/api/recommendations/recommend")
def get_recommendations(query: str, db: Session = Depends(get_db)):
    # 简单的推荐逻辑：根据查询关键词匹配菜品名称、描述或标签
    query_lower = query.lower()
    items = db.query(MenuItem).all()
    
    suggestions = []
    for item in items:
        match_score = 0
        reason = ""
        
        if query_lower in item.name.lower():
            match_score += 3
            reason = "Name match"
        elif query_lower in item.desc.lower():
            match_score += 2
            reason = "Description match"
        elif any(query_lower in tag.lower() for tag in (item.tags.split(",") if item.tags else [])):
            match_score += 2
            reason = "Tag match"
        
        if match_score > 0:
            suggestions.append((match_score, item, reason))
    
    # 按匹配分数排序，取前6个
    suggestions.sort(key=lambda x: x[0], reverse=True)
    suggestions = suggestions[:6]
    
    return RecommendationResponse(suggestions=[
        RecommendationItem(
            item=MenuItemResponse(
                id=item.id,
                name=item.name,
                category=item.category,
                price=item.price,
                desc=item.desc,
                image=item.image,
                tags=item.tags.split(",") if item.tags else [],
                sales=item.sales,
                created_at=item.created_at
            ),
            reason=reason
        )
        for _, item, reason in suggestions
    ])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=964)
