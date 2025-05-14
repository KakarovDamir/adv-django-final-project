'use client';

import { useState, useEffect } from "react";
import LikeButton from "./LikeButton";
import CommentForm from "./CommentForm";
import { motion } from 'framer-motion';
import Link from 'next/link';

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
  const [commentError, setCommentError] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      setCurrentUser(user ? JSON.parse(user).username : null);
    }
  }, []);

  const handleCommentSubmit = async (content: string) => {
    if (content.trim().length < 3) {
      setCommentError('Комментарий должен содержать минимум 3 символа');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/social_network/posts/${post.id}/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '',
        },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });

      const newComment = await response.json();
      setComments((prev: CommentType[]) => [...prev, newComment]);
      setCommentError('');
    } catch (error) {
      setCommentError('Ошибка при отправке комментария');
    }
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-violet-50"
    >
      <div className="p-6 space-y-4">
        {post.image && (
          <img 
            src={post.image} 
            alt="Post" 
            className="w-full h-64 object-cover rounded-lg border border-violet-100 mb-4"
            loading="lazy"
          />
        )}

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {post.author?.avatar && (
              <img
                src={post.author.avatar}
                alt={`${post.author.username}'s avatar`}
                className="w-10 h-10 rounded-full object-cover border-2 border-violet-200"
              />
            )}
            <div>
              <h3 className="font-semibold text-violet-800">{post.author?.username || 'Anonymous'}</h3>
              <p className="text-sm text-violet-500">{new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          
          {currentUser === post.author?.username && (
            <Link 
              href={`/posts/${post.id}/edit`}
              className="text-violet-600 hover:text-violet-700 transition-colors"
              title="Редактировать пост"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </Link>
          )}
        </div>

        <div className="space-y-3">
          {post.title && (
            <h3 className="text-xl font-bold text-violet-900">{post.title}</h3>
          )}
          <p className="text-violet-700 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>

        <div className="pt-4 border-t border-violet-50">
          <h4 className="text-violet-800 font-medium mb-3">Комментарии</h4>
          <ul className="space-y-3 overflow-y-auto max-h-64 pr-2 scrollbar scrollbar-thumb-violet-200 scrollbar-track-violet-50 scrollbar-thin">
            {comments.map((comment: CommentType) => (
              <li 
                key={comment.id}
                className="p-3 bg-violet-50 rounded-lg border border-violet-100"
              >
                <p className="text-violet-700">{comment.content}</p>
                <p className="text-violet-500 text-sm mt-1">— {comment.author.username}</p>
              </li>
            ))}
          </ul>

          <CommentForm 
            postId={post.id} 
            onSubmit={handleCommentSubmit} 
            error={commentError}
          />
        </div>

        <div className="flex items-center gap-2 mt-4">
          <LikeButton 
            postId={post.id}
            initialLikes={likes}
            isLiked={isLiked}
            onLikeUpdate={(newLikes: number, liked: boolean) => {
              setLikes(newLikes);
              setIsLiked(liked);
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
