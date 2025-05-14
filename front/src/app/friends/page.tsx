"use client";
import { useState } from "react";
import FriendList from "../../components/FriendList";
import FriendRequests from "../../components/FriendRequests";

export default function FriendsPage() {
  const [requestsCount, setRequestsCount] = useState(0);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header section */}
        <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 shadow-xl">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]"></div>
          <div className="relative p-8 sm:p-10">
            <div className="max-w-xl">
              <h1 className="text-3xl font-bold text-white mb-2 font-poppins">
                Friends
              </h1>
              <p className="text-indigo-100 mb-6">
                Connect with friends and manage your network
              </p>
            </div>
          </div>
          <div className="absolute top-12 right-10 w-32 h-32 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-indigo-300 opacity-20 blur-3xl"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Friends Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 card-hover">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-indigo-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 font-poppins">
                Search Friends
              </h2>
            </div>
            <FriendList />
          </div>

          {/* Friend Requests Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 card-hover">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-violet-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 font-poppins">
                  Pending Requests
                </h2>
              </div>
              {requestsCount > 0 && (
                <span className="badge badge-primary px-3 py-1 shadow-sm">
                  {requestsCount} new
                </span>
              )}
            </div>
            <FriendRequests onUpdate={setRequestsCount} />
          </div>
        </div>
      </div>
    </div>
  );
}
