import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { loginUser, registerUser } from "../api/auth"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email || !password) return
    setLoading(true)
    setError("")
    try {
      if (isRegister) {
        await registerUser(email, password)
        const data = await loginUser(email, password)
        login(data.access_token)
      } else {
        const data = await loginUser(email, password)
        login(data.access_token)
      }
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          {isRegister ? "Sign up to start tracking your jobs" : "Sign in to your job tracker"}
        </p>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
          </button>

          <p className="text-center text-gray-400 text-sm">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-600 hover:underline font-medium"
            >
              {isRegister ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}