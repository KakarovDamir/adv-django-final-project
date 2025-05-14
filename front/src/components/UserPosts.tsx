/* eslint-disable */
'use client';
import { useEffect, useState } from 'react';
import PostItem from './PostItem';
import { csrfFetch } from '../lib/csrf';
import LoadingSpinner from './LoadingSpinner';

export default function UserPosts({ username }: { username: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = async () => {
    try {
      console.log('Fetching posts for username:', username);
      
      const res = await csrfFetch(`http://138.68.87.67:8000/social_network/users/${encodeURIComponent(username)}/posts/`);
      
      console.log('Posts API response:', res.status);
      
      if (!res.ok) {
        const error = await res.json();
        console.error('API Error:', error);
        throw new Error(error.message || 'Failed to load posts');
      }
      
      const data = await res.json();
      console.log('Received posts:', data);
      setPosts(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [username]);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-violet-900">Recent Posts</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Error loading posts: {error}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {posts.map(post => (
            <PostItem 
              key={post.id} 
              post={post} 
            />  
          ))}
        </div>
      ) : (
        <div className="bg-violet-50 text-violet-700 p-6 rounded-lg text-center">
          No posts yet
        </div>
      )}
    </div>
  );
}