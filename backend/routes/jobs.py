from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from models.job import Job
from routes.auth import get_current_user

def empty_to_none(value):
    if value == "" or value == "string":
        return None
    return value

router = APIRouter()

def format_job(row):
    return {
        "id": row[0],
        "company": row[1],
        "role": row[2],
        "status": row[3],
        "notes": row[4],
        "applied_at": str(row[5]),
        "applied_date": str(row[6]) if row[6] else None,
        "job_url": row[7],
        "contact_name": row[8],
        "contact_email": row[9],
        "interview_date": str(row[10]) if row[10] else None,
        "salary": row[11],
        "location": row[12],
        "priority": row[13],
    }

@router.get("/jobs")
def get_jobs(current_user: str = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs ORDER BY applied_at DESC")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [format_job(row) for row in rows]

@router.get("/jobs/{job_id}")
def get_job(job_id: int, current_user: str = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE id = %s", (job_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return format_job(row)

@router.post("/jobs")
def create_job(job: Job, current_user: str = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO jobs 
        (company, role, status, notes, applied_date, job_url, contact_name, contact_email, interview_date, salary, location, priority) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *""",
        (job.company, job.role, job.status, empty_to_none(job.notes),
         empty_to_none(job.applied_date), empty_to_none(job.job_url),
         empty_to_none(job.contact_name), empty_to_none(job.contact_email),
         empty_to_none(job.interview_date), empty_to_none(job.salary),
         empty_to_none(job.location), empty_to_none(job.priority))
    )
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return format_job(row)

@router.put("/jobs/{job_id}")
def update_job(job_id: int, job: Job, current_user: str = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE jobs SET 
        company = %s, role = %s, status = %s, notes = %s, applied_date = %s,
        job_url = %s, contact_name = %s, contact_email = %s, interview_date = %s,
        salary = %s, location = %s, priority = %s
        WHERE id = %s RETURNING *""",
        (job.company, job.role, job.status, empty_to_none(job.notes),
         empty_to_none(job.applied_date), empty_to_none(job.job_url),
         empty_to_none(job.contact_name), empty_to_none(job.contact_email),
         empty_to_none(job.interview_date), empty_to_none(job.salary),
         empty_to_none(job.location), empty_to_none(job.priority), job_id)
    )
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return format_job(row)

@router.delete("/jobs/{job_id}")
def delete_job(job_id: int, current_user: str = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM jobs WHERE id = %s RETURNING id", (job_id,))
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted"}