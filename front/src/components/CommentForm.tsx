/* eslint-disable */
"use client";
import { useState } from "react";

export default function CommentForm({
  postId,
  onSubmit,
  error,
}: {
  postId: number;
  onSubmit: (content: string) => Promise<void>;
  error: string;
}) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mt-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Comment here"
        className={`w-full px-3 py-2 text-gray-800 bg-transparent border ${
          error ? "border-red-400" : "border-gray-300"
        } rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent min-h-[60px] resize-none`}
        disabled={isSubmitting}
      />

      <div className="flex justify-between items-center mt-2">
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="ml-auto flex items-center">
          <span className="text-xs text-gray-500 mr-2">
            {content.length}/280
          </span>
          <button
            type="submit"
            disabled={isSubmitting || content.trim().length < 3}
            className={`px-4 py-1.5 rounded-full text-white text-sm font-bold transition-colors ${
              isSubmitting || content.trim().length < 3
                ? "bg-blue-700 opacity-50 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? "Posting..." : "Comment"}
          </button>
        </div>
      </div>
    </form>
  );
}
