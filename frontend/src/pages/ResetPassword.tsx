import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../api/auth";

type FormInputs = {
  new_password: string;
  confirm_password: string;
};

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormInputs>();

  const resetMutation = useMutation({
    mutationFn: (newPassword: string) =>
      resetPassword({ token: token || "", new_password: newPassword }),
    onSuccess: () => {
      setTimeout(() => navigate("/login"), 3000);
    },
  });

  const onSubmit = (data: FormInputs) => {
    resetMutation.mutate(data.new_password);
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-gray-100 shadow-sm">
          <p className="text-red-500 font-medium">Invalid or missing token.</p>
          <Link
            to="/login"
            className="text-blue-600 underline text-sm mt-4 inline-block"
          >
            Return to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Set New Password
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Please enter your new password below.
        </p>

        {resetMutation.isSuccess ? (
          <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl text-sm">
            Password updated successfully! Redirecting you to login...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div>
              <input
                type="password"
                placeholder="New Password"
                {...register("new_password", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              />
              {errors.new_password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.new_password.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm New Password"
                {...register("confirm_password", {
                  required: "Please confirm your password",
                  validate: (val) =>
                    val === watch("new_password") || "Passwords do not match",
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              />
              {errors.confirm_password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            {resetMutation.isError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl">
                {resetMutation.error.message}
              </div>
            )}

            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {resetMutation.isPending ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
