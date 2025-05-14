'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LikeButton({
  postId,
  initialLikes,
  isLiked: initialIsLiked,
  onLikeUpdate
}: {
  postId: number;
  initialLikes: number;
  isLiked: boolean;
  onLikeUpdate: (newLikes: number, liked: boolean) => void;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialIsLiked);
  const [isAnimating, setIsAnimating] = useState(false);

  // Синхронизация с пропсами
  useEffect(() => {
    setLikes(initialLikes);
    setLiked(initialIsLiked);
  }, [initialLikes, initialIsLiked]);

  const handleLike = async () => {
    const newLikedState = !liked;
    const newLikes = newLikedState ? likes + 1 : likes - 1;
    
    // Оптимистичное обновление
    setLiked(newLikedState);
    setLikes(newLikes);
    setIsAnimating(true);

    try {
      const response = await fetch(`http://localhost:8000/social_network/posts/${postId}/like/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Like failed');
      }
      onLikeUpdate(newLikes, newLikedState);
    } catch (err) {
      // Откат изменений при ошибке
      setLiked(!newLikedState);
      setLikes(likes);
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <motion.button 
      onClick={handleLike}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
        liked 
          ? 'bg-violet-100 text-violet-700 shadow-inner' 
          : 'text-violet-600 hover:bg-violet-50'
      }`}
    >
      <motion.span
        key={liked ? 'liked' : 'unliked'}
        animate={isAnimating ? { scale: 1.2 } : {}}
        className="text-2xl"
      >
        {liked ? '❤️' : '🤍'}
      </motion.span>
      <span className="font-medium">{likes}</span>
    </motion.button>
  );
}