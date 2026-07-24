from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.jobs import router as jobs_router
from routes.auth import router as auth_router
from routes.ai import router as ai_router
from routes.profile import router as profile_router
import os

app = FastAPI()

# Get origins from environment variable OR set sensible defaults
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://job-tracker-beige-ten.vercel.app",
]

# If you set FRONTEND_URL in Render, include it dynamically:
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in origins:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Or set allow_origins=["*"] during testing
    allow_credentials=True,
    allow_methods=["*"],    # Allows POST, GET, OPTIONS, PUT, DELETE
    allow_headers=["*"],
)

app.include_router(jobs_router)
app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(profile_router)

@app.get("/")
def root():
    return {"message": "Job Tracker API is running"}