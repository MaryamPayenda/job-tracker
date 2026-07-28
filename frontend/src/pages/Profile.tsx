import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../api/jobs";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  full_name: string;
  background: string;
  skills: string;
  location: string;
  phone: string;
  portfolio: string;
  linkedin: string;
  github: string;
}

export default function Profile() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(token!),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileData>({
    values: {
      full_name: profile?.full_name || "",
      background: profile?.background || "",
      skills: profile?.skills || "",
      location: profile?.location || "",
      phone: profile?.phone || "",
      portfolio: profile?.portfolio || "",
      linkedin: profile?.linkedin || "",
      github: profile?.github || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileData) => updateProfile(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      navigate("/dashboard");
    },
  });

  if (isLoading)
    return <p className="text-center text-gray-400 mt-20">Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-gray-900">My Profile</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="border border-gray-200 hover:border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="border border-gray-200 hover:border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-2">Profile Information</h2>
          <p className="text-gray-400 text-sm mb-6">
            This info is used to generate personalized cover letters.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 px-1">Email</label>
              <input
                value={profile?.user_email || ""}
                disabled
                className="px-4 py-3 rounded-xl border border-gray-100 text-gray-400 text-sm bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 px-1">Full Name</label>
              <input
                {...register("full_name", {
                  required: "Full name is required",
                })}
                placeholder="e.g. Maryam Payenda"
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              />
              {errors.full_name && (
                <p className="text-red-400 text-xs px-1">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 px-1">Phone Number</label>
              <input
                {...register("phone")}
                placeholder="e.g. +49 155 67123576"
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 px-1">
                Portfolio URL
              </label>
              <input
                {...register("portfolio")}
                placeholder="e.g. maryampayenda.dev"
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 px-1">LinkedIn URL</label>
              <input
                {...register("linkedin")}
                placeholder="e.g. linkedin.com/in/maryam-payenda"
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 px-1">GitHub URL</label>
              <input
                {...register("github")}
                placeholder="e.g. github.com/MaryamPayenda"
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 px-1">Location</label>
              <input
                {...register("location")}
                placeholder="e.g. Oschatz, Germany (Nationwide / Remote)"
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 px-1">
                Professional Background
              </label>
              <textarea
                {...register("background")}
                placeholder="e.g. Fachinformatikerin für Anwendungsentwicklung with 3 years of experience in React and TypeScript..."
                rows={4}
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 px-1">Skills</label>
              <textarea
                {...register("skills")}
                placeholder="e.g. React, TypeScript, Next.js, Python, SQL, REST APIs, Docker, Git, Agile/Scrum"
                rows={3}
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 resize-none"
              />
            </div>

            {mutation.isError && (
              <p className="text-red-500 text-sm">Failed to save. Try again.</p>
            )}

            <button
              onClick={handleSubmit((data) => mutation.mutate(data))}
              disabled={mutation.isPending}
              className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {mutation.isPending ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
