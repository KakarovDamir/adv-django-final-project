/* eslint-disable */
"use client";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { csrfFetch } from "../lib/csrf";
import PostItem from "./PostItem";

export default function PostList() {
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const res = await csrfFetch(
        `http://138.68.87.67:8000/social_network/posts/?page=${page}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Check data structure
      const receivedPosts = data.results ? data.results : data;
      const hasMore = data.next ? data.next !== null : false;

      setPosts((prev) => [...prev, ...receivedPosts]);
      setHasMore(hasMore);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading posts:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {posts.map((post) => (
        <PostItem post={post} key={post.id} />
      ))}

      <div ref={ref} className="py-5 text-center">
        {loading && (
          <div className="flex justify-center items-center p-4">
            <svg
              className="animate-spin h-5 w-5 text-blue-400"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <p className="text-gray-500 text-sm py-4">You've reached the end</p>
        )}
      </div>
    </div>
  );
}
