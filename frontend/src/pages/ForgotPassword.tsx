import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/auth";

type FormInput = { email: string };

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormInput>();

  const resetMutation = useMutation({
    mutationFn: (data: FormInput) => requestPasswordReset(data.email),
  });

  const onSubmit = (data: FormInput) => {
    resetMutation.mutate(data);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p className="text-gray-400 text-sm mb-8">
          Enter your email address and we'll send you a password reset link.
        </p>

        {resetMutation.isSuccess ? (
          <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl text-sm mb-6">
            If an account exists with that email, a password reset link has been sent!
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
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
              {resetMutation.isPending ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-blue-600 hover:underline font-medium">
            &larr; Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}