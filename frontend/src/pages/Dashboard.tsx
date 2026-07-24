import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getJobs, deleteJob } from "../api/jobs";
import { useNavigate } from "react-router-dom";
import AddJobForm from "../components/AddJobForm";
import JobCard from "../components/JobCard";

const STATUSES = ["All", "Applied", "Interview", "Offer", "Rejected"];

export default function Dashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const {
    data: jobs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => getJobs(token!),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteJob(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const filteredJobs = jobs
    ?.filter((job: any) =>
      activeFilter === "All" ? true : job.status === activeFilter,
    )
    .filter((job: any) =>
      search === ""
        ? true
        : job.company.toLowerCase().includes(search.toLowerCase()) ||
          job.role.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-gray-900">Job Tracker</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            {showForm ? "Cancel" : "+ Add Job"}
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="border border-gray-200 hover:border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="border border-gray-200 hover:border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Add Job Form */}
        {showForm && (
          <div className="mb-8">
            <AddJobForm onSuccess={() => setShowForm(false)} />
          </div>
        )}

        {/* Stats */}
        {jobs && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {["Applied", "Interview", "Offer", "Rejected"].map((status) => (
              <div
                key={status}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center cursor-pointer hover:border-blue-200 transition-colors"
                onClick={() => setActiveFilter(status)}
              >
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.filter((j: any) => j.status === status).length}
                </p>
                <p className="text-gray-400 text-xs mt-1">{status}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Search by company or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white mb-4 shadow-sm"
        />

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === status
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {status}
              {jobs && status !== "All" && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({jobs.filter((j: any) => j.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Jobs List */}
        {isLoading && (
          <p className="text-center text-gray-400 py-20">Loading jobs...</p>
        )}

        {error && (
          <p className="text-center text-red-500 py-20">Failed to load jobs</p>
        )}

        {filteredJobs && filteredJobs.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No jobs found</p>
            <p className="text-gray-300 text-sm mt-2">
              {search
                ? "Try a different search term"
                : "Click '+ Add Job' to get started"}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {filteredJobs &&
            filteredJobs.map((job: any) => (
              <JobCard
                key={job.id}
                job={job}
                onDelete={() => deleteMutation.mutate(job.id)}
              />
            ))}
        </div>
      </div>
    </main>
  );
}
