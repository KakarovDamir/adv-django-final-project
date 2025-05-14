/* eslint-disable */
"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  user: any | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  logout: () => {},
  user: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for user in localStorage
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Auth error:", error);
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    // Only run on client-side
    if (typeof window !== "undefined") {
      checkAuth();
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        logout,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
