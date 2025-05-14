'use client';
import { useEffect, useState } from 'react';

export default function FriendRequests() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/social_network/friend_requests/')
      .then(res => res.json())
      .then(setRequests);
  }, []);

  const handleRequest = async (id: number, action: 'accept' | 'reject') => {
    await fetch(`http://localhost:8000/social_network/${action}_friend_request/${id}/`, {
      method: 'POST',
      headers: { 'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '' },
      credentials: 'include'
    });
    setRequests(requests.filter(req => req.id !== id));
  };

  return (
    <div className="space-y-2">
      {requests.map(request => (
        <div 
          key={request.id}
          className="flex justify-between items-center p-3 bg-violet-50 rounded-lg border border-violet-100 hover:bg-violet-100 transition-colors"
        >
          <span className="text-violet-700">{request.from_user.username}</span>
          <div className="flex gap-2">
            <button 
              onClick={() => handleRequest(request.id, 'accept')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md transition-colors"
            >
              Accept
            </button>
            <button 
              onClick={() => handleRequest(request.id, 'reject')}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}