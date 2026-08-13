import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, slides in when open */}
      <div className={`
        fixed top-0 left-0 h-full z-30 transition-transform duration-200
        md:static md:translate-x-0 md:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile topbar with hamburger */}
        <header className="bg-white shadow-sm px-4 h-14 flex items-center justify-between md:hidden sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-blue-600 text-sm">AI Resume Analyzer</span>
          <div className="w-8" />
        </header>

        {/* Desktop topbar */}
        <div className="hidden md:block">
          <Topbar />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
