import { NavLink } from "react-router-dom";
import { LayoutDashboard, Upload, History, User, TrendingUp } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const links = [
  { to: "/dashboard", label: "Dashboard",      icon: LayoutDashboard },
  { to: "/upload",    label: "Upload Resume",   icon: Upload          },
  { to: "/insights",  label: "Career Insights", icon: TrendingUp      },
  { to: "/history",   label: "History",         icon: History         },
  { to: "/profile",   label: "Profile",         icon: User            },
];

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out");
  };

  return (
    <aside className="w-64 bg-blue-700 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-blue-600">
        <h2 className="text-xl font-bold">AI Resume Analyzer</h2>
        <p className="text-blue-200 text-xs mt-1">Powered by AI + ATS Engine</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${
                isActive
                  ? "bg-white text-blue-700"
                  : "hover:bg-blue-600 text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-600">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition text-sm font-medium text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
