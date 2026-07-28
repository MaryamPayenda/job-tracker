import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser, type AuthPayload } from "../api/auth";
import Logo from "../components/Logo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AuthPayload>();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(data.access_token);
      navigate("/dashboard");
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (_, variables) => {
      loginMutation.mutate({
        email: variables.email,
        password: variables.password,
      });
    },
  });

  const onSubmit = (data: AuthPayload) => {
    if (isRegister) {
      registerMutation.mutate(data);
    } else {
      loginMutation.mutate({
        email: data.email,
        password: data.password,
      });
    }
  };

  const toggleAuthMode = () => {
    setIsRegister((prev) => !prev);
    reset();
    loginMutation.reset();
    registerMutation.reset();
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;
  const apiError =
    loginMutation.error?.message || registerMutation.error?.message;

  return (
    <main className="min-h-screen bg-gray-50 flex">
      {/* Left side — branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-b from-blue-600 to-indigo-700 p-12 text-white">
        <Logo size={36} showText={true} />

        <div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Your job search,
            <br />
            finally organized.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-10">
            Track every application, generate AI-powered cover letters and land
            your next role faster.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { icon: "📋", text: "Track all your applications in one place" },
              { icon: "🤖", text: "Generate cover letters in seconds with AI" },
              { icon: "📄", text: "Download professional PDFs instantly" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <p className="text-blue-100 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-200 text-sm">© 2026 Trackly</p>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo size={40} showText={true} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            {isRegister
              ? "Start tracking your job search today"
              : "Sign in to your Trackly account"}
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            {isRegister && (
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  {...register("confirm_password", {
                    required: isRegister
                      ? "Please confirm your password"
                      : false,
                    validate: (val) =>
                      !isRegister ||
                      val === watch("password") ||
                      "Passwords do not match",
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                />
                {errors.confirm_password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>
            )}

            {/* Forgot password */}
            {!isRegister && (
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            {/* API error */}
            {apiError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl">
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm mt-2"
            >
              {isLoading
                ? "Please wait..."
                : isRegister
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-blue-600 hover:underline font-medium"
            >
              {isRegister ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
