'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateColorFromUsername } from '../lib/avatarUtils';

interface Profile {
  user: {
    id: number;
    username: string;
  };
  bio?: string;
  image?: string;
}

interface User {
  id: number;
  username: string;
}

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

const Avatar = ({ username, image }: { username: string; image?: string }) => {
  if (image) {
    return (
      <img 
        src={image} 
        alt="Profile" 
        className="w-32 h-32 rounded-full border-4 border-violet-100 object-cover shadow-lg"
      />
    );
  }

  const bgColor = generateColorFromUsername(username);
  
  return (
    <div 
      className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white ${bgColor} border-4 border-violet-100 shadow-lg`}
    >
      {username[0].toUpperCase()}
    </div>
  );
};

export default function ProfileHeader({ username }: { username: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, userRes] = await Promise.all([
          fetch(`http://localhost:8000/social_network/profile/${username}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include'
          }),
          fetch('http://localhost:8000/social_network/auth/current_user/', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include'
          })
        ]);
        
        if (!profileRes.ok || !userRes.ok) throw new Error('Failed to load data');
        
        const [profileData, userData] = await Promise.all([
          profileRes.json(),
          userRes.json()
        ]);
        
        setProfile(profileData);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [username]);

  if (isLoading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;

  const isCurrentUser = currentUser?.username === username;

  const deleteProfile = async () => {
    if (confirm('Are you sure?')) {
      try {
        const response = await fetch('http://localhost:8000/social_network/api/profile/delete/', {
          method: 'DELETE',
          headers: {
            'X-CSRFToken': getCookie('csrftoken') || '',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        window.location.href = '/login';
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleFriendRequest = async () => {
    try {
      await fetch(
        `http://localhost:8000/social_network/friends/requests/send/${profile?.user.id}/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "X-CSRFToken":
              document.cookie.match(/csrftoken=([^;]+)/)?.[1] || "",
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <Avatar username={username} image={profile?.image} />
        {isCurrentUser && (
          <Link 
            href="/profile/update" 
            className="absolute bottom-0 right-0 bg-violet-600 text-white p-2 rounded-full shadow-md hover:bg-violet-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </Link>
        )}
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-bold text-violet-900 mb-2">{username}</h1>
        <p className="text-violet-600 max-w-xl mx-auto leading-relaxed">
          {profile?.bio || 'No bio yet...'}
        </p>
      </div>

      <div className="flex gap-4">
        {!isCurrentUser && (
          <button 
            onClick={handleFriendRequest}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Friend
          </button>
        )}
        
        {isCurrentUser && (
          <div className="flex gap-4">
            <Link 
              href="/profile/update"
              className="flex items-center gap-2 bg-violet-100 hover:bg-violet-200 text-violet-700 px-6 py-3 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Link>
            <button 
              onClick={deleteProfile}
              className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 px-6 py-3 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}