'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/social_network/posts/${id}/`)
      .then(res => res.json())
      .then(setPost);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const res = await fetch(`http://localhost:8000/social_network/posts/${id}/update/`, {
      method: 'PUT',
      headers: { 
        'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: formData.get('title'),
        content: formData.get('content'),
        image: formData.get('image')
      }),
      credentials: 'include'
    });

    if (res.ok) router.push(`http://localhost:3000/home`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const res = await fetch(`http://localhost:8000/social_network/posts/${id}/delete/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '',
        },
        credentials: 'include'
      });

      if (res.ok) {
        router.push('http://localhost:3000/home');
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting post');
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-violet-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-violet-900">Edit Post</h2>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Delete Post
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              name="title"
              defaultValue={post.title}
              required
              className="w-full p-3 text-violet-800 border border-violet-100 rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
              placeholder="Заголовок поста"
            />
            
            <textarea
              name="content"
              defaultValue={post.content}
              required
              className="w-full p-3 text-violet-800 border border-violet-100 rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all h-48"
              placeholder="Содержание поста"
            />
            
            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Сохранить изменения
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}