"use client";
import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  avatar?: string;
  bio?: string;
  is_friend: boolean;
}

interface FriendListResponse {
  users: User[];
}

export default function FriendList() {
  const [friends, setFriends] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadFriends() {
      const res = await fetch(
        `http://138.68.87.67:8000/social_network/friends/?search=${searchQuery}`,
        {
          credentials: "include",
          headers: {
            "X-CSRFToken":
              document.cookie.match(/csrftoken=([^;]+)/)?.[1] || "",
          },
        }
      );
      const data: FriendListResponse = await res.json();
      setFriends(data.users);
    }
    loadFriends();
  }, [searchQuery]);

  const handleRemoveFriend = async (friendId: number) => {
    try {
      await fetch(
        `http://138.68.87.67:8000/social_network/friends/remove/${friendId}/`,
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
      setFriends(friends.filter((friend) => friend.id !== friendId));
    } catch (error) {
      console.error("Failed to remove friend:", error);
    }
  };

  const handleAddFriend = async (userId: number) => {
    try {
      await fetch(
        `http://138.68.87.67:8000/social_network/friends/requests/send/${userId}/`,
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
      setFriends(
        friends.map((friend) =>
          friend.id === userId ? { ...friend, is_friend: true } : friend
        )
      );
    } catch (error) {
      console.error("Failed to add friend:", error);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search friends..."
        className="w-full px-4 py-2 rounded-lg border border-violet-200 focus:ring-2 focus:ring-violet-500 mb-4"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="space-y-2">
        {friends.length === 0 ? (
          <div className="text-center text-violet-600 py-4">
            No friends found
          </div>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.id}
              className="flex justify-between items-center p-3 bg-violet-50 rounded-lg border border-violet-100 hover:bg-violet-100 transition-colors"
            >
              <a
                href={`/profile/${friend.username}`}
                className="text-violet-700 font-medium"
              >
                {friend.username}
              </a>
              {friend.is_friend ? (
                <button
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="text-red-600 hover:text-red-700 px-3 py-1 rounded-md transition-colors"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => handleAddFriend(friend.id)}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded-md transition-colors"
                >
                  Add Friend
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
