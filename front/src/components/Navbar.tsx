'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({ username }: { username: string }) {
  const pathname = usePathname();
  
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-violet-100 fixed w-full top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link 
            href="/home" 
            className="flex items-center gap-2 group"
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
              Cartoonix
            </span>
          </Link>

          {/* Основное меню */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href={`/profile/${username}`} 
              className={`px-3 py-2 rounded-lg transition-colors ${
                pathname === '/profile' 
                  ? 'bg-violet-100 text-violet-700' 
                  : 'text-violet-600 hover:bg-violet-50 hover:text-violet-700'
              }`}
            >
              Профиль
            </Link>
            <Link 
              href="/friends" 
              className={`px-3 py-2 rounded-lg transition-colors ${
                pathname === '/friends' 
                  ? 'bg-violet-100 text-violet-700' 
                  : 'text-violet-600 hover:bg-violet-50 hover:text-violet-700'
              }`}
            >
              Друзья
            </Link>
            <Link 
              href="/generate-video" 
              className={`px-3 py-2 rounded-lg transition-colors ${
                pathname === '/generate-video' 
                  ? 'bg-violet-100 text-violet-700' 
                  : 'text-violet-600 hover:bg-violet-50 hover:text-violet-700'
              }`}
            >
              Создать видео
            </Link>
          </div>

          {/* Выход */}
          <Link 
            href="/login" 
            className="flex items-center gap-2 text-violet-600 hover:text-violet-700 group transition-colors"
          >
            <span className="hidden sm:inline">Выход</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}