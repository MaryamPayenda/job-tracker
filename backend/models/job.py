from pydantic import BaseModel
from typing import Optional

class Job(BaseModel):
    company: str
    role: str
    status: str
    notes: Optional[str] = None
    applied_date: Optional[str] = None
    job_url: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    interview_date: Optional[str] = None
    salary: Optional[str] = None
    location: Optional[str] = None
    priority: Optional[str] = "Medium"