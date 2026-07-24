const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface JobData {
  company: string;
  role: string;
  status: string;
  notes: string;
  applied_date: string;
  job_url: string;
  contact_name: string;
  contact_email: string;
  interview_date: string;
  salary: string;
  location: string;
  priority: string;
}

export async function getJobs(token: string) {
  const response = await fetch(`${BASE_URL}/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch jobs");
  return response.json();
}

export async function createJob(token: string, job: JobData) {
  const response = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(job),
  });
  if (!response.ok) throw new Error("Failed to create job");
  return response.json();
}

export async function deleteJob(token: string, id: number) {
  const response = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to delete job");
  return response.json();
}

export async function updateJob(token: string, id: number, job: JobData) {
  const response = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(job),
  });
  if (!response.ok) throw new Error("Failed to update job");
  return response.json();
}

export async function generateCoverLetter(
  token: string,
  data: {
    company: string;
    role: string;
    job_description: string;
    language: string;
  },
) {
  const response = await fetch(`${BASE_URL}/ai/cover-letter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to generate cover letter");
  return response.json();
}

export async function getProfile(token: string) {
  const response = await fetch(`${BASE_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

export async function updateProfile(
  token: string,
  profile: {
    full_name: string;
    background: string;
    skills: string;
    location: string;  
    phone: string;
    portfolio: string;
    linkedin: string;
    github: string;
  },
) {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error("Failed to update profile");
  return response.json();
}
