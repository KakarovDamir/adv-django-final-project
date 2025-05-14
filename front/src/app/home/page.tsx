"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import PostList from "../../components/PostList";

export default function HomePage() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUsername(parsedUser.username);
    }
  }, []);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Hero section */}
        <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 shadow-xl">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]"></div>
          <div className="relative p-8 sm:p-10">
            <div className="max-w-xl">
              <h1 className="text-3xl font-bold text-white mb-4 font-poppins">
                Welcome back, {username}!
              </h1>
              <p className="text-indigo-100 mb-6">
                Share your thoughts, connect with friends, and create amazing
                cartoon videos.
              </p>
              <Link
                href="/posts/create"
                className="inline-flex items-center gap-2 bg-white hover:bg-indigo-50 text-indigo-600 font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Create New Post
              </Link>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-300 rounded-full opacity-30 blur-2xl"></div>
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-violet-300 rounded-full opacity-30 blur-2xl"></div>
        </div>

        {/* Post feed section */}
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-indigo-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              Latest Posts
            </h2>
            <div className="flex gap-2">
              <Link
                href="/friends"
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Find Friends</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <PostList />
        </div>
      </div>
    </div>
  );
}
