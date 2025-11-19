import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../Store/authStore";

const Navbar = () => {
  const { user, logoutUser } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 lg:px-8 z-50">
      <div className="mx-auto max-w-5xl flex items-center justify-between h-14 md:h-16">
        <Link to="/" className="text-xl md:text-2xl font-bold text-blue-700">
          Quiz Versus
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="font-medium hover:translate-y-[-2px] transition duration-300 ease-in-out hover:text-blue-700"
          >
            Home
          </Link>

          <Link
            to="/about"
            className="font-medium hover:translate-y-[-2px] transition duration-300 ease-in-out hover:text-blue-700"
          >
            About
          </Link>

          {user ? (
            <>
              <Link
                to="/play"
                className="font-medium hover:translate-y-[-2px] transition duration-300 ease-in-out hover:text-blue-700"
              >
                Play
              </Link>
              <Link
                to="/profile"
                className="font-medium hover:translate-y-[-2px] transition duration-300 ease-in-out hover:text-blue-700"
              >
                Profile
              </Link>
              <button
                onClick={logoutUser}
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-md transition duration-300 ease-in-out hover:from-blue-800 hover:to-blue-700 font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-md transition duration-300 ease-in-out hover:from-blue-800 hover:to-blue-700 font-semibold"
            >
              Login / Signup
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 py-4 bg-white/95 backdrop-blur-md">
          <div className="flex flex-col gap-4">
            <Link
              to="/"
              className="font-medium px-4 py-2 hover:bg-gray-100 rounded-md transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              to="/about"
              className="font-medium px-4 py-2 hover:bg-gray-100 rounded-md transition"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>

            {user ? (
              <>
                <Link
                  to="/play"
                  className="font-medium px-4 py-2 hover:bg-gray-100 rounded-md transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Play
                </Link>
                <Link
                  to="/profile"
                  className="font-medium px-4 py-2 hover:bg-gray-100 rounded-md transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logoutUser();
                    setIsMenuOpen(false);
                  }}
                  className="mx-4 px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-md font-semibold transition hover:from-blue-800 hover:to-blue-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="mx-4 px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-md font-semibold transition hover:from-blue-800 hover:to-blue-700 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Login / Signup
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
