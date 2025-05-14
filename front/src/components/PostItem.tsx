"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import CommentForm from "./CommentForm";
import LikeButton from "./LikeButton";

interface CommentType {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    avatar?: string;
  };
}

export default function PostItem({ post }: { post: any }) {
  const [comments, setComments] = useState<CommentType[]>(post.comments || []);
  const [likes, setLikes] = useState(post.total_likes);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [commentError, setCommentError] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      setCurrentUser(user ? JSON.parse(user).username : null);
    }
  }, []);

  const handleCommentSubmit = async (content: string) => {
    if (content.trim().length < 3) {
      setCommentError("Комментарий должен содержать минимум 3 символа");
      return;
    }

    try {
      const response = await fetch(
        `http://138.68.87.67:8000/social_network/posts/${post.id}/comments/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken":
              document.cookie.match(/csrftoken=([^;]+)/)?.[1] || "",
          },
          body: JSON.stringify({ content }),
          credentials: "include",
        }
      );

      const newComment = await response.json();
      setComments((prev: CommentType[]) => [...prev, newComment]);
      setCommentError("");
    } catch (error) {
      setCommentError("Ошибка при отправке комментария");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    }).format(date);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white  text-gray-800 border border-gray-200 rounded-2xl overflow-hidden hover:bg-gray-50 transition-colors duration-200 mb-4 shadow-sm"
    >
      <div className="p-4">
        {/* Header with avatar and username */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start">
            <div>
              <div className="flex items-center">
                <Link
                  href={`/profile/${post.author?.username}`}
                  className="font-bold text-gray-800 hover:text-indigo-600 hover:underline"
                >
                  {post.author?.username || "Anonymous"}
                </Link>
                <span className="mx-1 text-gray-400">·</span>
                <Link
                  href={`/posts/${post.id}`}
                  className="text-gray-500 hover:underline text-sm"
                >
                  {post.created_at
                    ? `${formatDate(post.created_at)}`
                    : "2h ago"}
                </Link>
              </div>

              {/* Post content */}
              <div className="mt-2">
                <p className="text-gray-800 whitespace-pre-line mb-3">
                  {post.content}
                </p>

                {post.title && (
                  <div className="mt-2">
                    <p className="text-gray-800 whitespace-pre-line mb-3">
                      {post.title}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Post image */}
        {post.image && (
          <div className="my-3">
            <img
              src={post.image}
              alt="Post"
              className="w-full rounded-2xl border border-gray-200 max-h-96 object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between mt-3 pt-2 border-t border-gray-200">
          <button
            onClick={toggleComments}
            className="flex items-center text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              ></path>
            </svg>
            <span className="text-sm">{comments.length || 0}</span>
          </button>

          <div className="flex items-center">
            <LikeButton
              postId={post.id}
              initialLikes={likes || 0}
              isLiked={isLiked}
              onLikeUpdate={(newLikes: number, liked: boolean) => {
                setLikes(newLikes);
                setIsLiked(liked);
              }}
            />
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <CommentForm
              postId={post.id}
              onSubmit={handleCommentSubmit}
              error={commentError}
            />

            {comments.length > 0 && (
              <div className="mt-3 space-y-3">
                {comments.map((comment: CommentType) => (
                  <div
                    key={comment.id}
                    className="flex space-x-3 pl-2 border-l border-gray-200"
                  >
                    <Link
                      href={`/profile/${comment.author.username}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={
                          comment.author.avatar ||
                          "https://via.placeholder.com/32"
                        }
                        alt={`${comment.author.username}'s avatar`}
                        className="w-8 h-8 rounded-full border border-gray-200"
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="inline-flex items-center">
                        <Link
                          href={`/profile/${comment.author.username}`}
                          className="font-medium text-gray-800 hover:text-indigo-600 hover:underline"
                        >
                          {comment.author.username}
                        </Link>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
