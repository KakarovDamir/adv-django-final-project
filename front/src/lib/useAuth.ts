'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useAuth() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // This avoids issues during hydration
    setIsChecking(true);
    
    try {
      // Check if localStorage has user data
      const user = localStorage.getItem('user');
      if (!user) {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      router.replace('/login');
    } finally {
      setIsChecking(false);
    }
  }, [router]);

  return { isChecking };
} 