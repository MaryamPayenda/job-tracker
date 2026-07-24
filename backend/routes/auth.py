from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from database import get_db
from models.user import RegisterUser, LoginUser, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordSubmit
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordBearer
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Free SMTP Configurations from environment variables
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587)) if os.getenv("SMTP_PORT") else 587
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

def create_token(email: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def send_reset_email(to_email: str, token: str):
    # This URL targets your local React app endpoint
    reset_url = f"http://localhost:5173/reset-password?token={token}"
    
    # Fallback/Testing safety net: If you haven't set up SMTP credentials in .env yet,
    # it prints the token to your terminal so you can test your API immediately!
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"\n[LOCAL TEST] Password reset requested for: {to_email}")
        print(f"[LOCAL TEST] Click this link to test your React app: {reset_url}\n")
        return

    message = MIMEMultipart("alternative")
    message["Subject"] = "Reset Your Password"
    message["From"] = SMTP_USERNAME
    message["To"] = to_email

    html_content = f"""
    <p>Hello,</p>
    <p>You requested a password reset. Click the link below to set a new password. This link will expire in 15 minutes:</p>
    <p><a href="{reset_url}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 4px;">Reset Password</a></p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    """
    message.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_USERNAME, to_email, message.as_string())
    except Exception as e:
        print(f"SMTP Email Error: {e}")


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: RegisterUser):
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 FROM users WHERE email = %s", (user.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
            
            hashed = hash_password(user.password)
            cursor.execute(
                "INSERT INTO users (email, password) VALUES (%s, %s) RETURNING id, email",
                (user.email, hashed)
            )
            row = cursor.fetchone()
            
            cursor.execute("INSERT INTO profiles (user_email) VALUES (%s)", (user.email,))
            conn.commit()
            return {"id": row[0], "email": row[1]}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


@router.post("/login")
def login(user: LoginUser):
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, email, password FROM users WHERE email = %s", (user.email,))
            row = cursor.fetchone()
            
            if row is None or not verify_password(user.password, row[2]):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
                
            token = create_token(row[1])
            return {"access_token": token, "token_type": "bearer"}
    finally:
        conn.close()


@router.post("/change-password")
def change_password(data: ChangePasswordRequest, current_user: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login"))):
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT password FROM users WHERE email = %s", (current_user,))
            row = cursor.fetchone()
            
            if not row or not verify_password(data.old_password, row[0]):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password")
            
            hashed_new = hash_password(data.new_password)
            cursor.execute("UPDATE users SET password = %s WHERE email = %s", (hashed_new, current_user))
            conn.commit()
            return {"message": "Password updated successfully"}
    finally:
        conn.close()


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 FROM users WHERE email = %s", (data.email,))
            user_exists = cursor.fetchone()
            
            if not user_exists:
                return {"message": "If your email is registered, a reset link has been sent."}
            
            expire = datetime.now(timezone.utc) + timedelta(minutes=15)
            reset_token = jwt.encode(
                {"sub": data.email, "exp": expire, "purpose": "password_reset"}, 
                SECRET_KEY, 
                algorithm=ALGORITHM
            )
            
            background_tasks.add_task(send_reset_email, data.email, reset_token)
            return {"message": "If your email is registered, a reset link has been sent."}
    finally:
        conn.close()


@router.post("/reset-password")
def reset_password(data: ResetPasswordSubmit):
    try:
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != "password_reset":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token scope")
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The reset link is invalid or has expired")

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            hashed_new = hash_password(data.new_password)
            cursor.execute("UPDATE users SET password = %s WHERE email = %s", (hashed_new, email))
            conn.commit()
            return {"message": "Your password has been reset successfully."}
    finally:
        conn.close()

# Export this out cleanly for other route dependencies
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")