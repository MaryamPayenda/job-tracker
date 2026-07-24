from fastapi import APIRouter, Depends
from pydantic import BaseModel
from groq import Groq
from routes.auth import get_current_user
from database import get_db
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class CoverLetterRequest(BaseModel):
    company: str
    role: str
    job_description: str
    language: str = "English"

@router.post("/ai/cover-letter")
def generate_cover_letter(request: CoverLetterRequest, current_user: str = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM profiles WHERE user_email = %s", (current_user,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    full_name = row[2] if row and row[2] else current_user
    background = row[3] if row and row[3] else "Software Engineer"
    skills = row[4] if row and row[4] else "React, TypeScript, Python"
    location = row[5] if row and row[5] else "Germany"

    prompt = f"""
    Write a professional cover letter in {request.language} for the following job application:

    Applicant: {full_name}
    Role applying for: {request.role}
    Company: {request.company}
    Background: {background}
    Skills: {skills}
    Location: {location}

    Job Description:
    {request.job_description}

    Write a professional, personalized cover letter in {request.language}.
    Keep it concise — maximum 4 paragraphs.
    Do not use placeholders — write the full letter ready to send.
    {"Write the entire letter in German." if request.language == "German" else "Write the entire letter in English."}
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )

    cover_letter = response.choices[0].message.content
    return {"cover_letter": cover_letter}