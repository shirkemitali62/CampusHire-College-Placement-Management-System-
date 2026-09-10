import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, LayoutDashboard, UserCircle, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 premium-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

        <Link
          to={user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
          className="flex items-center gap-3"
        >
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <GraduationCap size={23} />
          </div>

          <div>
            <h1 className="font-bold text-slate-900 leading-none">
              CampusHire
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Placement Management
            </p>
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-3">

            <Link
              to={user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            {user.role === "student" && (
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <UserCircle size={18} />
                Profile
              </Link>
            )}

            <div className="hidden md:block text-right ml-2">
              <p className="text-sm font-semibold text-slate-800">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {user.role}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
