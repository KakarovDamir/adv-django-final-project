/* eslint-disable */
"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LikeButton({
  postId,
  initialLikes,
  isLiked: initialIsLiked,
  onLikeUpdate,
}: {
  postId: number;
  initialLikes: number;
  isLiked: boolean;
  onLikeUpdate: (newLikes: number, liked: boolean) => void;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialIsLiked);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync with props
  useEffect(() => {
    setLikes(initialLikes);
    setLiked(initialIsLiked);
  }, [initialLikes, initialIsLiked]);

  const handleLike = async () => {
    const newLikedState = !liked;
    const newLikes = newLikedState ? likes + 1 : likes - 1;

    // Optimistic update
    setLiked(newLikedState);
    setLikes(newLikes);
    setIsAnimating(true);

    try {
      const response = await fetch(
        `http://138.68.87.67:8000/social_network/posts/${postId}/like/`,
        {
          method: "POST",
          headers: {
            "X-CSRFToken":
              document.cookie.match(/csrftoken=([^;]+)/)?.[1] || "",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Like failed");
      }
      onLikeUpdate(newLikes, newLikedState);
    } catch (err) {
      // Rollback on error
      setLiked(!newLikedState);
      setLikes(likes);
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <motion.button
      onClick={handleLike}
      whileTap={{ scale: 0.9 }}
      className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.5, 1] } : {}}
        transition={{ duration: 0.3 }}
        className="mr-1"
      >
        {liked ? (
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="rgb(249, 24, 128)"
            stroke="none"
          >
            <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z" />
          </svg>
        )}
      </motion.div>
      <span className={`text-sm ${liked ? "text-red-500" : ""}`}>{likes}</span>
    </motion.button>
  );
}
