from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
import uuid

from database import get_db, engine
from models import Base, User, Message, Recharge
from schemas import (
    UserCreate, UserResponse, Token, MessageCreate, MessageResponse,
    RechargeCreate, RechargeResponse, UserBalance
)
from auth import (
    authenticate_user, create_access_token, get_current_active_user,
    get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
)
from redis_client import (
    get_user_balance_from_cache, set_user_balance_in_cache,
    invalidate_user_balance_cache
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Plivo Mini Communication Platform", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        credits=100  # Starting credits
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Cache initial balance
    set_user_balance_in_cache(db_user.id, db_user.credits)
    
    return db_user

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.get("/balance", response_model=UserBalance)
def get_balance(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    # Try to get balance from cache first
    cached_balance = get_user_balance_from_cache(current_user.id)
    if cached_balance is not None:
        return {"credits": cached_balance}
    
    # If not in cache, get from database and cache it
    db.refresh(current_user)
    set_user_balance_in_cache(current_user.id, current_user.credits)
    return {"credits": current_user.credits}

@app.post("/send-message", response_model=MessageResponse)
def send_message(
    message: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if recipient exists
    recipient = db.query(User).filter(User.username == message.recipient_username).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Check if user has sufficient credits
    cached_balance = get_user_balance_from_cache(current_user.id)
    if cached_balance is not None:
        current_credits = cached_balance
    else:
        db.refresh(current_user)
        current_credits = current_user.credits
    
    if current_credits < 1:
        raise HTTPException(status_code=400, detail="Insufficient credits")
    
    # Create message
    db_message = Message(
        sender_id=current_user.id,
        recipient_id=recipient.id,
        content=message.content,
        status="sent"
    )
    db.add(db_message)
    
    # Deduct credit
    current_user.credits -= 1
    db.add(current_user)
    db.commit()
    db.refresh(db_message)
    
    # Update cache
    set_user_balance_in_cache(current_user.id, current_user.credits)
    
    # Prepare response
    response_data = {
        "id": db_message.id,
        "sender_id": db_message.sender_id,
        "recipient_id": db_message.recipient_id,
        "content": db_message.content,
        "status": db_message.status,
        "created_at": db_message.created_at,
        "sender_username": current_user.username,
        "recipient_username": recipient.username
    }
    
    return response_data

@app.get("/messages", response_model=list[MessageResponse])
def get_messages(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        (Message.sender_id == current_user.id) | (Message.recipient_id == current_user.id)
    ).order_by(Message.created_at.desc()).limit(50).all()
    
    response_messages = []
    for msg in messages:
        sender = db.query(User).filter(User.id == msg.sender_id).first()
        recipient = db.query(User).filter(User.id == msg.recipient_id).first()
        
        response_messages.append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "recipient_id": msg.recipient_id,
            "content": msg.content,
            "status": msg.status,
            "created_at": msg.created_at,
            "sender_username": sender.username,
            "recipient_username": recipient.username
        })
    
    return response_messages

@app.post("/recharge", response_model=RechargeResponse)
def recharge_credits(
    recharge: RechargeCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if recharge.amount <= 0:
        raise HTTPException(status_code=400, detail="Recharge amount must be positive")
    
    # Create recharge transaction
    transaction_id = str(uuid.uuid4())
    db_recharge = Recharge(
        user_id=current_user.id,
        amount=recharge.amount,
        transaction_id=transaction_id,
        status="completed"
    )
    db.add(db_recharge)
    
    # Add credits to user
    current_user.credits += recharge.amount
    db.add(current_user)
    db.commit()
    db.refresh(db_recharge)
    
    # Update cache
    set_user_balance_in_cache(current_user.id, current_user.credits)
    
    return db_recharge

@app.get("/recharge-history", response_model=list[RechargeResponse])
def get_recharge_history(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    recharges = db.query(Recharge).filter(
        Recharge.user_id == current_user.id
    ).order_by(Recharge.created_at.desc()).limit(20).all()
    
    return recharges

@app.get("/")
def root():
    return {"message": "Plivo Mini Communication Platform API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
