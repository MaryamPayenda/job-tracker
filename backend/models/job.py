from pydantic import BaseModel
from typing import Optional

class Job(BaseModel):
    company: str
    role: str
    status: str
    notes: Optional[str] = None