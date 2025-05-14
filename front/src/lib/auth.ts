import { redirect } from 'next/navigation';
import React from 'react';

export const checkAuth = () => {
  // This function needs to run on the client side
  if (typeof window !== 'undefined') {
    try {
      const user = localStorage.getItem('user');
      return !!user;
    } catch (error) {
      console.error('Error checking auth:', error);
      return false;
    }
  }
  return false;
};

export const withAuth = (Component: React.ComponentType) => {
  const AuthComponent = (props: any) => {
    // This code will only run on the client side
    if (typeof window !== 'undefined') {
      try {
        const isAuthenticated = checkAuth();
        if (!isAuthenticated) {
          redirect('/login');
          return null;
        }
      } catch (error) {
        console.error('Auth wrapper error:', error);
        redirect('/login');
        return null;
      }
    }
    
    return React.createElement(Component, props);
  };
  
  // Copy display name for better debugging
  AuthComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  return AuthComponent;
}; 