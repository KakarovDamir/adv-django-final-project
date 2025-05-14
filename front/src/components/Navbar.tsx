/* eslint-disable */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../lib/AuthContext";

export default function Navbar({ username }: { username: string }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full top-0 z-50">
      <div className="backdrop-blur-lg bg-white/80 border-b border-indigo-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo with enhanced styling */}
            <Link href="/home" className="flex items-center gap-2 group">
              <div className="flex items-center">
                <span className="font-poppins text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Cartoonix
                </span>
                <div className="h-2 w-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full ml-1 animate-pulse"></div>
              </div>
            </Link>

            {/* Main menu with improved visual hierarchy - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href={`/profile/${username}`}
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  pathname.startsWith("/profile")
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Profile</span>
                </div>
              </Link>
              <Link
                href="/friends"
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  pathname === "/friends"
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span>Friends</span>
                </div>
              </Link>
              <Link
                href="/generate-video"
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  pathname === "/generate-video"
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <span>Create Video</span>
                </div>
              </Link>
            </div>

            {/* User profile and logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-1.5 rounded-full">
                <div className="h-7 w-7 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-indigo-700 font-medium">
                  {username}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-700 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full group"
              >
                <span className="hidden sm:inline text-sm font-medium">
                  Logout
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>

              {/* Mobile menu button */}
              <button
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      mobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-b border-indigo-100 py-3 px-4">
          <div className="flex flex-col space-y-2">
            <Link
              href={`/profile/${username}`}
              className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                pathname.startsWith("/profile")
                  ? "bg-indigo-100 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Profile</span>
              </div>
            </Link>
            <Link
              href="/friends"
              className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                pathname === "/friends"
                  ? "bg-indigo-100 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>Friends</span>
              </div>
            </Link>
            <Link
              href="/generate-video"
              className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                pathname === "/generate-video"
                  ? "bg-indigo-100 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <span>Create Video</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
