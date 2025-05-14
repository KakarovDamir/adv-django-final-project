'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    try {
      const res = await fetch('http://localhost:8000/social_network/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
        credentials: 'include'
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/home');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-center text-violet-600">Вход</h2>
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            className="w-full p-3 border border-violet-100 rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
            placeholder="Имя пользователя"
            required
          />
          <input
            name="password"
            type="password"
            className="w-full p-3 border border-violet-100 rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
            placeholder="Пароль"
            required
          />
          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Войти
          </button>
        </form>
        <div className="text-center text-violet-600">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-violet-700 hover:underline">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}