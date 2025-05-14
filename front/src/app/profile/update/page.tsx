"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ProtectedRoute from "../../../components/ProtectedRoute";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  bio?: string;
  avatar?: File;
}

export default function UpdateProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    email: "",
    bio: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/social_network/profile/update/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to load profile");

        const data = await response.json();
        setProfile({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          bio: data.bio,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("first_name", profile.first_name);
    formData.append("last_name", profile.last_name);
    formData.append("email", profile.email);
    if (profile.bio) formData.append("bio", profile.bio);
    if (profile.avatar) formData.append("avatar", profile.avatar);

    try {
      const response = await fetch(
        "http://localhost:8000/social_network/profile/update/",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Update failed");
      }

      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  if (isLoading)
    return (
      <ProtectedRoute>
        <LoadingSpinner />
      </ProtectedRoute>
    );

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              value={profile.first_name}
              onChange={(e) =>
                setProfile({ ...profile, first_name: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              value={profile.last_name}
              onChange={(e) =>
                setProfile({ ...profile, last_name: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full p-2 border rounded-md h-32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setProfile({ ...profile, avatar: e.target.files[0] });
                }
              }}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 text-white py-2 px-4 rounded-md hover:bg-violet-700 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
