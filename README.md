# Trackly — Full Stack AI App

A job application tracker with AI-powered cover letter generation in English and German.

## Live

- **App:** [job-tracker-beige-ten.vercel.app](https://job-tracker-beige-ten.vercel.app)

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form

**Backend:** Python, FastAPI, PostgreSQL, JWT, Groq AI (Llama 3.3)

**Infrastructure:** Vercel + Render + Supabase

## Features

- JWT Authentication
- Add, edit, delete and track job applications
- Search and filter by status
- AI cover letter generator (EN/DE) with PDF download
- User profile for personalized cover letters

## Getting Started

```bash
# Backend
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```
