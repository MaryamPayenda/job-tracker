import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

function App() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={token ? <Dashboard /> : <Navigate to="/login" />}
      />
    </Routes>
  )
}

export default App