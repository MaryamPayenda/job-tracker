from fastapi import APIRouter, HTTPException, Depends, status
from database import get_db
from models.job import Job  # This uses your exact Pydantic model
from routes.auth import get_current_user
from psycopg2.extras import RealDictCursor

# Using standard prefixing clean tags for auto-generated docs
router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("", response_model=list[dict])
def get_jobs(current_user: str = Depends(get_current_user)):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "SELECT * FROM jobs WHERE user_email = %s ORDER BY applied_at DESC", 
                (current_user,)
            )
            rows = cursor.fetchall()
            
            # Simple string conversion for dates so JSON serialization passes smoothly
            for row in rows:
                if row.get("applied_at"): row["applied_at"] = str(row["applied_at"])
                if row.get("applied_date"): row["applied_date"] = str(row["applied_date"])
                if row.get("interview_date"): row["interview_date"] = str(row["interview_date"])
            return rows
    finally:
        conn.close()

@router.get("/{job_id}", response_model=dict)
def get_job(job_id: int, current_user: str = Depends(get_current_user)):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "SELECT * FROM jobs WHERE id = %s AND user_email = %s", 
                (job_id, current_user)
            )
            row = cursor.fetchone()
            
            if not row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
                
            if row.get("applied_at"): row["applied_at"] = str(row["applied_at"])
            if row.get("applied_date"): row["applied_date"] = str(row["applied_date"])
            if row.get("interview_date"): row["interview_date"] = str(row["interview_date"])
            return row
    finally:
        conn.close()

@router.post("", status_code=status.HTTP_201_CREATED)
def create_job(job: Job, current_user: str = Depends(get_current_user)):
    # model_dump converts Pydantic object directly into a clean Python dictionary
    job_data = job.model_dump()
    
    # Replace frontend placeholder "string" defaults with clean database NULLs (None)
    for key, val in job_data.items():
        if val == "string" or val == "":
            job_data[key] = None

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """INSERT INTO jobs 
                (user_email, company, role, status, notes, applied_date, job_url, contact_name, contact_email, interview_date, salary, location, priority) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *""",
                (current_user, job_data['company'], job_data['role'], job_data['status'], job_data['notes'],
                 job_data['applied_date'], job_data['job_url'], job_data['contact_name'], job_data['contact_email'],
                 job_data['interview_date'], job_data['salary'], job_data['location'], job_data['priority'])
            )
            row = cursor.fetchone()
            conn.commit()
            
            if row.get("applied_at"): row["applied_at"] = str(row["applied_at"])
            if row.get("applied_date"): row["applied_date"] = str(row["applied_date"])
            if row.get("interview_date"): row["interview_date"] = str(row["interview_date"])
            return row
    finally:
        conn.close()

@router.put("/{job_id}", response_model=dict)
def update_job(job_id: int, job: Job, current_user: str = Depends(get_current_user)):
    job_data = job.model_dump()
    for key, val in job_data.items():
        if val == "string" or val == "":
            job_data[key] = None

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """UPDATE jobs SET 
                company = %s, role = %s, status = %s, notes = %s, applied_date = %s,
                job_url = %s, contact_name = %s, contact_email = %s, interview_date = %s,
                salary = %s, location = %s, priority = %s
                WHERE id = %s AND user_email = %s RETURNING *""",
                (job_data['company'], job_data['role'], job_data['status'], job_data['notes'],
                 job_data['applied_date'], job_data['job_url'], job_data['contact_name'], job_data['contact_email'],
                 job_data['interview_date'], job_data['salary'], job_data['location'], job_data['priority'], 
                 job_id, current_user)
            )
            row = cursor.fetchone()
            conn.commit()
            
            if not row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found or unauthorized")
                
            if row.get("applied_at"): row["applied_at"] = str(row["applied_at"])
            if row.get("applied_date"): row["applied_date"] = str(row["applied_date"])
            if row.get("interview_date"): row["interview_date"] = str(row["interview_date"])
            return row
    finally:
        conn.close()

@router.delete("/{job_id}")
def delete_job(job_id: int, current_user: str = Depends(get_current_user)):
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM jobs WHERE id = %s AND user_email = %s RETURNING id", (job_id, current_user))
            row = cursor.fetchone()
            conn.commit()
            
            if not row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found or unauthorized")
            return {"message": "Job deleted successfully"}
    finally:
        conn.close()