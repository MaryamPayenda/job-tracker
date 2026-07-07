from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from models.job import Job
from routes.auth import get_current_user

router = APIRouter()

@router.get("/jobs")
def get_jobs(current_user: str = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs ORDER BY applied_at DESC")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    jobs = []
    for row in rows:
        jobs.append({
            "id": row[0],
            "company": row[1],
            "role": row[2],
            "status": row[3],
            "notes": row[4],
            "applied_at": str(row[5])
        })
    return jobs

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
    return {
        "id": row[0],
        "company": row[1],
        "role": row[2],
        "status": row[3],
        "notes": row[4],
        "applied_at": str(row[5])
    }

@router.post("/jobs")
def create_job(job: Job, current_user: str = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO jobs (company, role, status, notes) VALUES (%s, %s, %s, %s) RETURNING *",
        (job.company, job.role, job.status, job.notes)
    )
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return {
        "id": row[0],
        "company": row[1],
        "role": row[2],
        "status": row[3],
        "notes": row[4],
        "applied_at": str(row[5])
    }

@router.put("/jobs/{job_id}")
def update_job(job_id: int, job: Job, current_user: str = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE jobs SET company = %s, role = %s, status = %s, notes = %s WHERE id = %s RETURNING *",
        (job.company, job.role, job.status, job.notes, job_id)
    )
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "id": row[0],
        "company": row[1],
        "role": row[2],
        "status": row[3],
        "notes": row[4],
        "applied_at": str(row[5])
    }

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