'use client';
import ProfileHeader from '../../../components/ProfileHeader';
import UserPosts from '../../../components/UserPosts';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useState, useEffect, use } from 'react';
import StatsCard from '../../../components/StatsCard';
import ErrorMessage from '../../../components/ErrorMessage';

interface ProfileData {
  id: number;
  username: string;
  avatar?: string;
  bio?: string;
  friends_count: number;
  posts_count: number;
  is_friend: boolean;
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/social_network/profile/${username}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        }
      );

      if (response.status === 404) {
        throw new Error('Profile not found');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
      }

      const data: ProfileData = await response.json();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-violet-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-violet-50 flex items-center justify-center">
        <ErrorMessage 
          message={error}
          onRetry={fetchProfile}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-violet-50 flex items-center justify-center">
        <ErrorMessage 
          message="Profile not found"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex items-center gap-8 mb-8">
          <div className="w-32 h-32 rounded-full border-2 border-gray-200 overflow-hidden">
            {profile?.avatar ? (
              <img 
                src={profile.avatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-4xl text-white">
                {profile?.username[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-2xl font-light">{profile?.username}</h1>
              {profile?.is_friend ? (
                <button className="px-4 py-1 bg-gray-100 rounded-md text-sm font-medium">
                  Friends
                </button>
              ) : (
                <button className="px-4 py-1 bg-blue-500 text-white rounded-md text-sm font-medium">
                  Follow
                </button>
              )}
            </div>

            <div className="flex gap-8 mb-4">
              <div className="text-center">
                <span className="font-semibold">{profile?.posts_count}</span>
                <span className="block text-gray-600 text-sm">posts</span>
              </div>
              <div className="text-center">
                <span className="font-semibold">{profile?.friends_count}</span>
                <span className="block text-gray-600 text-sm">followers</span>
              </div>
              <div className="text-center">
                <span className="font-semibold">0</span>
                <span className="block text-gray-600 text-sm">following</span>
              </div>
            </div>

            <p className="text-gray-800">{profile?.bio}</p>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: profile?.posts_count || 0 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}