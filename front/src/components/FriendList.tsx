'use client';
import { useEffect, useState } from 'react';

export default function FriendList() {
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadFriends() {
      const res = await fetch(`http://localhost:8000/social_network/friends?search=${searchQuery}`);
      const data = await res.json();
      setFriends(data);
    }
    loadFriends();
  }, [searchQuery]);

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
        {friends.map((friend: any) => (
          <div 
            key={friend.id}
            className="flex justify-between items-center p-3 bg-violet-50 rounded-lg border border-violet-100 hover:bg-violet-100 transition-colors"
          >
            <span className="text-violet-700 font-medium">{friend.username}</span>
            <button className="text-red-600 hover:text-red-700 px-3 py-1 rounded-md transition-colors">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}