'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const password = formData.get('password');
    const password2 = formData.get('password2');

    // Client-side validation
    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/social_network/auth/register/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.get('username'),
          email: formData.get('email'),
          password: formData.get('password'),
          password2: formData.get('password2')
        }),
        credentials: 'include'
      });

      const data = await res.json();
      
      if (res.ok) {
        router.push('/login');  // Перенаправляем сразу в систему
      } else {
        setError(data.errors ? Object.values(data.errors).join(' ') : 'Registration failed');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center p-4">
      <form 
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-violet-600 mb-8">
          Регистрация
        </h2>
        
        <div className="space-y-4">
          <input 
            name="username" 
            placeholder="Username" 
            required
            minLength={3}
            className="w-full p-3 border border-violet-100 rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
          />
          <input 
            name="email" 
            type="email" 
            placeholder="Email"
            required
            className="w-full p-3 border border-violet-100 rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            required
            minLength={8}
            className="w-full p-3 border border-violet-100 rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
          />
          <input 
            name="password2" 
            type="password" 
            placeholder="Confirm Password" 
            required
            className="w-full p-3 border border-violet-100 rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Зарегистрироваться
        </button>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}