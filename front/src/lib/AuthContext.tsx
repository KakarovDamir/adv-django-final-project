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
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  logout: () => {},
  user: null,
  refreshAuth: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to check authentication
  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Check for user in localStorage
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      console.log("Auth check:", {
        hasUserData: !!userData,
        hasToken: !!token,
        csrfToken:
          typeof document !== "undefined"
            ? document.cookie.match(/csrftoken=([^;]+)/)?.[1] || "No CSRF token"
            : "N/A",
      });

      if (userData) {
        // We have user data, but let's validate it's still valid
        try {
          // Try to fetch current user from API to verify session is still valid
          const res = await fetch(
            "http://138.68.87.67:8000/social_network/auth/current_user/",
            {
              credentials: "include",
              headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                "X-CSRFToken":
                  typeof document !== "undefined"
                    ? document.cookie.match(/csrftoken=([^;]+)/)?.[1] || ""
                    : "",
              },
            }
          );

          if (res.ok) {
            const currentUser = await res.json();
            setUser(currentUser);
            return true;
          } else {
            // Session expired or invalid
            console.warn("Session invalid, redirecting to login");
            throw new Error("Session expired");
          }
        } catch (apiError) {
          console.error("API validation error:", apiError);
          // If API validation fails, try to use stored user data
          setUser(JSON.parse(userData));
          return true;
        }
      } else {
        // No user data, redirect to login
        throw new Error("No user data");
      }
    } catch (error) {
      console.error("Auth verification failed:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      router.replace("/login");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial auth check on component mount
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== "undefined") {
      checkAuth();
    }
  }, [router]);

  const refreshAuth = async (): Promise<boolean> => {
    return await checkAuth();
  };

  const logout = async () => {
    try {
      // Call logout API
      await fetch("http://138.68.87.67:8000/social_network/auth/logout/", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken":
            typeof document !== "undefined"
              ? document.cookie.match(/csrftoken=([^;]+)/)?.[1] || ""
              : "",
        },
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clean up locally regardless of API success
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      router.replace("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        logout,
        user,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
