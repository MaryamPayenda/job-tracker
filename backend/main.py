from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.jobs import router as jobs_router
from routes.auth import router as auth_router
from routes.ai import router as ai_router
from routes.profile import router as profile_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_router)
app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(profile_router)

@app.get("/")
def root():
    return {"message": "Job Tracker API is running"}