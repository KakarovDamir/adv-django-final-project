'use client';
import { useState } from 'react';

export default function CommentForm({ 
  postId,
  onSubmit,
  error 
}: { 
  postId: number;
  onSubmit: (content: string) => Promise<void>;
  error: string;
}) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className={`flex-1 px-4 py-2 text-violet-900 rounded-lg border ${
            error ? 'border-red-500' : 'border-violet-100'
          } focus:ring-2 focus:ring-violet-500 transition-all`}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </form>
  );
}