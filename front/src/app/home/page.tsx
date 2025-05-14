'use client'
import Link from "next/link";
import PostList from "../../components/PostList";
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUsername(parsedUser.username);
    }
  }, []);
  return (
    <div className="min-h-screen bg-violet-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-violet-900">Welcome, {username}!</h2>
          <Link 
            href="/posts/create" 
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Create New Post
          </Link>
        </div>
        
        <h3 className="text-xl font-semibold text-violet-800 mb-6">Post List</h3>
        <PostList />
      </div>
    </div>
  );
}