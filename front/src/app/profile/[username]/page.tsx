/* eslint-disable */
"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import ErrorMessage from "../../../components/ErrorMessage";
import LoadingSpinner from "../../../components/LoadingSpinner";
import UserPosts from "../../../components/UserPosts";

interface ProfileData {
  id: number;
  username: string;
  avatar?: string;
  bio?: string;
  friends_count: number;
  posts_count: number;
  friendship_status: "friends" | "request_sent" | "none";
  is_friend: boolean;
}

interface User {
  username: string;
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `http://138.68.87.67:8000/social_network/profile/${username}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        }
      );

      if (response.status === 404) {
        throw new Error("Profile not found");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data: ProfileData = await response.json();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
      // Get current user from localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setCurrentUser({
            username: parsedUser.username,
          });
        } catch (err) {
          console.error("Error parsing user data:", err);
        }
      }
    };

    loadData();
  }, [username]);

  const handleFollow = async () => {
    try {
      let url: string;
      let method: "POST" | "DELETE" = "POST";

      if (profile?.friendship_status === "friends") {
        url = `http://138.68.87.67:8000/social_network/friends/remove/${profile.id}/`;
      } else if (profile?.friendship_status === "request_sent") {
        url = `http://138.68.87.67:8000/social_network/friends/requests/cancel/${profile.id}/`;
        method = "DELETE";
      } else {
        url = `http://138.68.87.67:8000/social_network/friends/requests/send/${profile?.id}/`;
      }

      const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || "";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
      });

      if (response.ok) {
        // Update status after successful request
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                is_friend: !prev.is_friend,
                friends_count: prev.is_friend
                  ? prev.friends_count - 1
                  : prev.friends_count + 1,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error updating friend status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message={error} onRetry={fetchProfile} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage
          message="Profile not found"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Header Background - simplified for better compatibility */}
        <div className="relative rounded-2xl overflow-hidden mb-24 bg-gradient-to-r from-indigo-600 to-violet-600 shadow-xl">
          {/* Background pattern - using simpler approach */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
          <div className="h-40 md:h-44"></div>

          {/* Top right action button */}
          <div className="absolute top-4 right-4">
            {currentUser && currentUser.username === username && (
              <Link
                href="/profile/update"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors flex items-center gap-2 shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Profile
              </Link>
            )}
          </div>

          {/* Add decorative elements */}
          <div
            className="absolute top-12 right-10 w-32 h-32 rounded-full bg-white opacity-10"
            style={{ filter: "blur(40px)" }}
          ></div>
          <div
            className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-indigo-300 opacity-20"
            style={{ filter: "blur(40px)" }}
          ></div>
        </div>

        {/* Centered Avatar */}
        <div className="relative flex justify-center -mt-32 mb-6">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center text-4xl text-white">
                {profile?.username[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Profile Info with card style */}
        <div className="py-6 px-4 md:px-8 bg-white rounded-2xl shadow-sm border border-indigo-100 mb-10 relative z-10">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
              {profile?.username}
            </h1>

            {currentUser && currentUser.username !== username && (
              <div className="flex gap-2">
              <button
                onClick={handleFollow}
                className={`mt-3 px-6 py-2 rounded-xl text-sm font-medium transition-colors ${
                  profile?.is_friend
                    ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                } shadow-sm flex items-center gap-2`}
              >
                {profile?.is_friend ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Friends
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    Follow
                  </>
                )}
              </button>
              <button
                    onClick={() => {
                      const sortedUsers = [currentUser.username, profile.username].sort();
                      window.location.href = `/chat/${sortedUsers.join('-')}`;
                    }}
                    className="px-4 py-1 text-black rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Message
                  </button>
                  <button
                    onClick={() => {
                      const sortedUsers = [currentUser.username, profile.username].sort();
                      window.location.href = `/video/${sortedUsers.join('-')}`;
                    }}
                    className="px-4 py-1 text-black rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Video Call
                  </button>
              </div>
            )}
          </div>

          {/* Stats with custom card style - simplified styling */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="bg-indigo-50 rounded-xl px-5 py-3 flex flex-col items-center shadow-sm">
              <span className="font-semibold text-indigo-700 text-lg">
                {profile?.posts_count}
              </span>
              <span className="text-indigo-600 text-sm">posts</span>
            </div>
            <div className="bg-violet-50 rounded-xl px-5 py-3 flex flex-col items-center shadow-sm">
              <span className="font-semibold text-violet-700 text-lg">
                {profile?.friends_count}
              </span>
              <span className="text-violet-600 text-sm">friends</span>
            </div>
          </div>

          {/* Bio with clean styling */}
          {profile?.bio && (
            <div className="border-t border-gray-100 pt-6 mt-6">
              <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3 font-medium text-center">
                Bio
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed text-center">
                {profile.bio}
              </p>
            </div>
          )}
        </div>

        {/* Posts Section with card style */}
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-indigo-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Posts</h2>
          </div>
          <UserPosts username={username} />
        </div>
      </div>
    </div>
  );
}
