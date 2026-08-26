import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const titles = {
  "/dashboard": "Dashboard",
  "/upload": "Upload Resume",
  "/UploadResume": "Upload Resume",
  "/history": "History",
  "/profile": "Profile",
};

function Topbar() {
  const { user } = useAuth();
  const location = useLocation();
  const name = user?.name || "User";
  const initial = name.charAt(0).toUpperCase();

  const title =
    titles[location.pathname] ||
    (location.pathname.startsWith("/analysis") ? "Analysis" : "Dashboard");

  return (
    <header className="bg-white shadow-sm px-6 h-16 flex justify-between items-center sticky top-0 z-10">
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 hidden sm:block">
          Welcome, <span className="font-semibold text-gray-800">{name}</span>
        </span>
        <Link
          to="/profile"
          className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm hover:bg-blue-700 transition"
        >
          {initial}
        </Link>
      </div>
    </header>
  );
}

export default Topbar;
