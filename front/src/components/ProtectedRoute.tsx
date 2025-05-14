"use client";

import { ReactNode } from "react";
import { useAuth } from "../lib/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't render anything while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  // If not authenticated, the AuthContext will handle the redirect
  // This is a fallback just in case
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render the children
  return <>{children}</>;
}
