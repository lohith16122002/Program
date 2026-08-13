import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          AI Resume Analyzer
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="hover:text-blue-600">Features</a>
          <a href="#how-it-works" className="hover:text-blue-600">How It Works</a>
          <a href="#about" className="hover:text-blue-600">About</a>

          <Link
            to="/login"
            className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Register
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t">

          <Link
            to="/"
            className="block px-6 py-3 hover:bg-gray-100"
          >
            Home
          </Link>

          <a
            href="#features"
            className="block px-6 py-3 hover:bg-gray-100"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="block px-6 py-3 hover:bg-gray-100"
          >
            How It Works
          </a>

          <Link
            to="/login"
            className="block px-6 py-3 hover:bg-gray-100"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="block px-6 py-3 hover:bg-gray-100"
          >
            Register
          </Link>

        </div>
      )}
    </nav>
  );
}

export default Navbar;