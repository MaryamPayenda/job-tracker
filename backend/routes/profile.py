from fastapi import APIRouter, Depends, status
from database import get_db
from models.profile import Profile  
from routes.auth import get_current_user
from psycopg2.extras import RealDictCursor

# Standard prefixing and automated documentation grouping
router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=dict)
def get_profile(current_user: str = Depends(get_current_user)):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """SELECT user_email, full_name, background, skills, location, phone, portfolio, linkedin, github 
                   FROM profiles WHERE user_email = %s""", 
                (current_user,)
            )
            row = cursor.fetchone()
            
            # If no profile exists yet, return a clean default dictionary to the frontend
            if row is None:
                return {
                    "user_email": current_user,
                    "full_name": "",
                    "background": "",
                    "skills": "",
                    "location": "",
                    "phone": "",
                    "portfolio": "",
                    "linkedin": "",
                    "github": "",
                }
            
            # Safely replace database NULLs with empty strings to keep React inputs happy
            return {key: (value if value is not None else "") for key, value in row.items()}
    finally:
        conn.close()


@router.put("", status_code=status.HTTP_200_OK)
def update_profile(profile: Profile, current_user: str = Depends(get_current_user)):
    # Convert Pydantic model directly to a clean dictionary
    profile_data = profile.model_dump()
    
    # Handle frontend defaults safely
    for key, val in profile_data.items():
        if val == "string" or val == "":
            profile_data[key] = None

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            # Check if profile exists using standard cursor
            cursor.execute("SELECT 1 FROM profiles WHERE user_email = %s", (current_user,))
            existing = cursor.fetchone()
            
            if existing:
                cursor.execute(
                    """UPDATE profiles SET 
                    full_name = %s, background = %s, skills = %s, location = %s,
                    phone = %s, portfolio = %s, linkedin = %s, github = %s
                    WHERE user_email = %s""",
                    (profile_data['full_name'], profile_data['background'], profile_data['skills'], 
                     profile_data['location'], profile_data['phone'], profile_data['portfolio'], 
                     profile_data['linkedin'], profile_data['github'], current_user)
                )
            else:
                cursor.execute(
                    """INSERT INTO profiles 
                    (user_email, full_name, background, skills, location, phone, portfolio, linkedin, github) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (current_user, profile_data['full_name'], profile_data['background'], profile_data['skills'],
                     profile_data['location'], profile_data['phone'], profile_data['portfolio'], 
                     profile_data['linkedin'], profile_data['github'])
                )
                
            conn.commit()
            return {"message": "Profile updated successfully"}
    finally:
        conn.close()