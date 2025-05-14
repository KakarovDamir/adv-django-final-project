"use client";
import { useEffect, useState } from "react";

interface FriendRequest {
  id: number;
  from_user: {
    username: string;
    avatar?: string;
  };
  to_user: {
    username: string;
    avatar?: string;
  };
  created_at: string;
}

interface FriendRequestsResponse {
  received: FriendRequest[];
  sent: FriendRequest[];
}

interface FriendRequestsProps {
  onUpdate: (count: number) => void;
}

export default function FriendRequests({ onUpdate }: FriendRequestsProps) {
  const [requests, setRequests] = useState<FriendRequestsResponse>({
    received: [],
    sent: [],
  });

  useEffect(() => {
    fetch("http://localhost:8000/social_network/friends/requests/", {
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('token')}`
      },
    })
      .then((res) => res.json())
      .then(data => {
        setRequests(data);
        onUpdate(data.received.length);
      });
  }, [onUpdate]);

  const handleRequest = async (id: number, action: "accept" | "reject") => {
    await fetch(
      `http://localhost:8000/social_network/friends/requests/${action}/${id}/`,
      {
        method: "POST",
        headers: {
          "X-CSRFToken": document.cookie.match(/csrftoken=([^;]+)/)?.[1] || "",
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    setRequests((prev) => ({
      ...prev,
      received: prev.received.filter((req) => req.id !== id),
    }));
  };

  if (requests.received.length === 0) {
    return (
      <div className="text-center text-violet-600 py-4">
        No pending friend requests
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests.received.map((request) => (
        <div
          key={request.id}
          className="flex justify-between items-center p-3 bg-violet-50 rounded-lg border border-violet-100 hover:bg-violet-100 transition-colors"
        >
          <span className="text-violet-700">{request.from_user.username}</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleRequest(request.id, "accept")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => handleRequest(request.id, "reject")}
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
