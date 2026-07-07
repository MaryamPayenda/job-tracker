from fastapi import APIRouter, HTTPException
from database import get_db
from models.user import RegisterUser, LoginUser
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends
from jose import JWTError
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

def create_token(email: str):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/auth/register")
def register(user: RegisterUser):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
    existing = cursor.fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(user.password)
    cursor.execute(
        "INSERT INTO users (email, password) VALUES (%s, %s) RETURNING id, email",
        (user.email, hashed)
    )
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return {"id": row[0], "email": row[1]}

@router.post("/auth/login")
def login(user: LoginUser):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, password FROM users WHERE email = %s", (user.email,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if row is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(user.password, row[2]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(row[1])
    return {"access_token": token, "token_type": "bearer"}
    

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")