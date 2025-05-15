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
        tokenPreview: token ? `${token.substring(0, 5)}...` : "none",
        csrfToken:
          typeof document !== "undefined"
            ? document.cookie.match(/csrftoken=([^;]+)/)?.[1] || "No CSRF token"
            : "N/A",
      });

      if (userData) {
        // We have user data, but let's validate it's still valid
        try {
          // Try to fetch current user from API to verify session is still valid
          console.log("Validating authentication with API...");
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

          console.log("Auth validation response:", res.status);

          if (res.ok) {
            const currentUser = await res.json();
            console.log("Authentication validated successfully");
            setUser(currentUser);
            return true;
          } else {
            // Session expired or invalid
            console.warn("Session invalid, attempting to refresh token");

            // Try to refresh CSRF token
            try {
              const csrfRes = await fetch(
                "http://138.68.87.67:8000/social_network/auth/csrf/",
                {
                  credentials: "include",
                }
              );

              if (csrfRes.ok) {
                console.log("CSRF token refreshed");

                // Try auth validation again with fresh CSRF
                const retryRes = await fetch(
                  "http://138.68.87.67:8000/social_network/auth/current_user/",
                  {
                    credentials: "include",
                    headers: {
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      "X-CSRFToken":
                        typeof document !== "undefined"
                          ? document.cookie.match(/csrftoken=([^;]+)/)?.[1] ||
                            ""
                          : "",
                    },
                  }
                );

                if (retryRes.ok) {
                  const retryUser = await retryRes.json();
                  console.log("Authentication validated on retry");
                  setUser(retryUser);
                  return true;
                }
              }
            } catch (refreshError) {
              console.error("CSRF refresh failed:", refreshError);
            }

            throw new Error("Session expired");
          }
        } catch (apiError) {
          console.error("API validation error:", apiError);
          // If API validation fails, try to use stored user data
          try {
            const parsedUser = JSON.parse(userData);
            console.log("Using cached user data:", parsedUser.username);
            setUser(parsedUser);
            return true;
          } catch (parseError) {
            console.error("Failed to parse stored user data:", parseError);
            throw new Error("Invalid user data");
          }
        }
      } else {
        // No user data, redirect to login
        console.warn("No user data found in localStorage");
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
  }, []);

  const refreshAuth = async (): Promise<boolean> => {
    console.log("Refreshing authentication...");
    return await checkAuth();
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      // Call logout API
      await fetch("http://138.68.87.67:8000/social_network/auth/logout/", {
        method: "POST",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "X-CSRFToken":
            typeof document !== "undefined"
              ? document.cookie.match(/csrftoken=([^;]+)/)?.[1] || ""
              : "",
        },
      });
      console.log("Logout API call successful");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clean up locally regardless of API success
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      console.log("Local auth data cleared, redirecting to login");
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
