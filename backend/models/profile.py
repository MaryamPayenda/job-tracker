from pydantic import BaseModel
from typing import Optional

class Profile(BaseModel):
    full_name: Optional[str] = None
    background: Optional[str] = None
    skills: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    portfolio: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None