const BASE_URL = "http://localhost:8000"

export interface JobData {
  company: string
  role: string
  status: string
  notes: string
  applied_date: string
  job_url: string
  contact_name: string
  contact_email: string
  interview_date: string
  salary: string
  location: string
  priority: string
}

export async function getJobs(token: string) {
  const response = await fetch(`${BASE_URL}/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error("Failed to fetch jobs")
  return response.json()
}

export async function createJob(token: string, job: JobData) {
  const response = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(job),
  })
  if (!response.ok) throw new Error("Failed to create job")
  return response.json()
}

export async function deleteJob(token: string, id: number) {
  const response = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error("Failed to delete job")
  return response.json()
}

export async function updateJob(token: string, id: number, job: JobData) {
  const response = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(job),
  })
  if (!response.ok) throw new Error("Failed to update job")
  return response.json()
}