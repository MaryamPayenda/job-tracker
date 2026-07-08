import { useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../context/AuthContext"
import { updateJob, type JobData } from "../api/jobs"

interface Job {
  id: number
  company: string
  role: string
  status: string
  notes: string | null
  applied_at: string
  applied_date: string | null
  job_url: string | null
  contact_name: string | null
  contact_email: string | null
  interview_date: string | null
  salary: string | null
  location: string | null
  priority: string | null
}

interface JobCardProps {
  job: Job
  onDelete: () => void
}

const statusColors: Record<string, string> = {
  Applied: "bg-blue-50 text-blue-600",
  Interview: "bg-yellow-50 text-yellow-600",
  Offer: "bg-green-50 text-green-600",
  Rejected: "bg-red-50 text-red-600",
}

const priorityColors: Record<string, string> = {
  High: "bg-red-50 text-red-500",
  Medium: "bg-orange-50 text-orange-500",
  Low: "bg-gray-50 text-gray-500",
}

export default function JobCard({ job, onDelete }: JobCardProps) {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<JobData>({
    defaultValues: {
      company: job.company,
      role: job.role,
      status: job.status,
      notes: job.notes || "",
      applied_date: job.applied_date || "",
      job_url: job.job_url || "",
      contact_name: job.contact_name || "",
      contact_email: job.contact_email || "",
      interview_date: job.interview_date || "",
      salary: job.salary || "",
      location: job.location || "",
      priority: job.priority || "Medium",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: JobData) => updateJob(token!, job.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      setIsEditing(false)
    },
  })

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Edit Job</h3>
        <div className="grid sm:grid-cols-2 gap-4">

          <div className="flex flex-col gap-1">
            <input
              {...register("company", { required: "Company is required" })}
              placeholder="Company *"
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
            />
            {errors.company && <p className="text-red-400 text-xs px-1">{errors.company.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <input
              {...register("role", { required: "Role is required" })}
              placeholder="Role *"
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
            />
            {errors.role && <p className="text-red-400 text-xs px-1">{errors.role.message}</p>}
          </div>

          <select
            {...register("status")}
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
          >
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>

          <select
            {...register("priority")}
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <input
            {...register("location")}
            placeholder="Location"
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
          />

          <input
            {...register("salary")}
            placeholder="Salary"
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 px-1">Application Date</label>
            <input
              {...register("applied_date")}
              type="date"
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 px-1">Interview Date</label>
            <input
              {...register("interview_date")}
              type="date"
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
            />
          </div>

          <input
            {...register("contact_name")}
            placeholder="Contact Name"
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
          />

          <input
            {...register("contact_email")}
            placeholder="Contact Email"
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
          />

          <input
            {...register("job_url")}
            placeholder="Job URL"
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 sm:col-span-2"
          />

          <textarea
            {...register("notes")}
            placeholder="Notes"
            rows={3}
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 resize-none sm:col-span-2"
          />

          <div className="sm:col-span-2 flex gap-3">
            <button
              onClick={handleSubmit((data) => mutation.mutate(data))}
              disabled={mutation.isPending}
              className="flex-1 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start justify-between gap-4">
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-gray-900">{job.company}</h3>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[job.status] || "bg-gray-50 text-gray-600"}`}>
            {job.status}
          </span>
          {job.priority && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${priorityColors[job.priority] || "bg-gray-50 text-gray-500"}`}>
              {job.priority}
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm font-medium">{job.role}</p>

        <div className="flex flex-wrap gap-4 mt-1">
          {job.location && <p className="text-gray-400 text-xs">📍 {job.location}</p>}
          {job.salary && <p className="text-gray-400 text-xs">💰 {job.salary}</p>}
          {job.applied_date && <p className="text-gray-400 text-xs">📅 Applied: {job.applied_date}</p>}
          {job.interview_date && <p className="text-gray-400 text-xs">🗓 Interview: {job.interview_date}</p>}
        </div>

        {(job.contact_name || job.contact_email) && (
          <div className="flex gap-3 flex-wrap mt-1">
            {job.contact_name && <p className="text-gray-400 text-xs">👤 {job.contact_name}</p>}
            {job.contact_email && (
              <a href={`mailto:${job.contact_email}`} className="text-blue-400 hover:underline text-xs">
                ✉️ {job.contact_email}
              </a>
            )}
          </div>
        )}

        {job.job_url && (
          <a href={job.job_url} target="_blank" className="text-blue-500 hover:underline text-xs mt-1">
            View Job Posting →
          </a>
        )}

        {job.notes && <p className="text-gray-400 text-xs mt-1">{job.notes}</p>}
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-blue-500 transition-colors text-sm">
          ✏️
        </button>
        <button onClick={onDelete} className="text-gray-300 hover:text-red-500 transition-colors text-sm">
          ✕
        </button>
      </div>
    </div>
  )
}