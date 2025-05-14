/* eslint-disable */
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    try {
      const res = await fetch(
        "http://138.68.87.67:8000/social_network/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken":
              document.cookie.match(/csrftoken=([^;]+)/)?.[1] || "",
          },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/home");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-violet-600">Cartoonix</h1>
            <p className="mt-2 text-gray-600 text-sm">
              Welcome back! Log in to your account
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm text-gray-600 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all text-gray-800"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm text-gray-600"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-violet-600 hover:text-violet-800"
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all text-gray-800"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 px-4 rounded-md font-medium transition-all flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Don't have an account?</span>{" "}
            <Link href="/register" className="text-violet-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - image/illustration */}
      <div className="hidden lg:block lg:w-1/2 bg-violet-600 fixed right-0 top-0 bottom-0">
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="max-w-lg text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Create and share amazing cartoon videos
            </h2>
            <p className="text-white/80 mb-8">
              Join our community of creators and bring your imagination to life
              with AI-powered tools
            </p>

            {/* Decorative elements */}
            <div className="relative h-64 w-full">
              <div className="absolute top-0 left-0 h-20 w-20 bg-purple-300 rounded-full opacity-30"></div>
              <div className="absolute bottom-0 right-0 h-16 w-16 bg-purple-300 rounded-full opacity-30"></div>
              <div className="absolute top-1/3 right-1/4 h-12 w-12 bg-white rounded-full opacity-20"></div>
              <div className="absolute -bottom-6 left-1/3 h-24 w-24 bg-purple-400 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
