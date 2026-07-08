import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { createJob, type JobData } from "../api/jobs";

interface AddJobFormProps {
  onSuccess: () => void;
}

export default function AddJobForm({ onSuccess }: AddJobFormProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JobData>({
    defaultValues: {
      status: "Applied",
      priority: "Medium",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: JobData) => createJob(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      reset();
      onSuccess();
    },
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-bold text-gray-900 mb-6">Add New Job</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <input
            {...register("company", { required: "Company is required" })}
            placeholder="Company *"
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
          />
          {errors.company && (
            <p className="text-red-400 text-xs px-1">
              {errors.company.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <input
            {...register("role", { required: "Role is required" })}
            placeholder="Role *"
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
          />
          {errors.role && (
            <p className="text-red-400 text-xs px-1">{errors.role.message}</p>
          )}
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
          placeholder="Location (e.g. Berlin / Remote)"
          className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
        />

        <input
          {...register("salary")}
          placeholder="Salary (e.g. 60.000€)"
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
          placeholder="Notes (optional)"
          rows={3}
          className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 resize-none sm:col-span-2"
        />

        {mutation.isError && (
          <p className="text-red-500 text-sm sm:col-span-2">
            Failed to add job. Try again.
          </p>
        )}

        <button
          onClick={handleSubmit((data) => mutation.mutate(data))}
          disabled={mutation.isPending}
          className="sm:col-span-2 w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {mutation.isPending ? "Adding..." : "Add Job"}
        </button>
      </div>
    </div>
  );
}
