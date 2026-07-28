import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  showAuth?: boolean;
  onAddJob?: () => void;
}

export default function Navbar({ showAuth = false, onAddJob }: NavbarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <Logo size={28} showText={true} />

      {showAuth && (
        <div className="flex gap-3">
          {onAddJob && (
            <button
              onClick={onAddJob}
              className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              + Add Job
            </button>
          )}
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
      )}

      {!showAuth && (
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors px-4 py-2"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/login")}
            className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
}
