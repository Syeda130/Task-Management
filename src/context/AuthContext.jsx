// src/context/AuthContext.jsx
'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetcher } from '@/lib/fetcher'; // Assume fetcher exists
import LoadingSpinner from '@/components/common/LoadingSpinner'; // Assume component exists
import { useRouter } from 'next/navigation'; // Import useRouter for logout redirect

/**
 * @typedef {object} AuthContextValue
 * @property {object|null} user - The authenticated user object (without password) or null.
 * @property {boolean} isAuthenticated - Whether the user is authenticated.
 * @property {boolean} isLoading - Whether the auth state is currently being loaded/checked.
 * @property {(userData: object) => void} login - Function to set user data on login.
 * @property {() => Promise<void>} logout - Function to log the user out.
 * @property {() => Promise<void>} checkAuth - Function to manually re-check auth status.
 */

/** @type {React.Context<AuthContextValue|undefined>} */
const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter(); // Get router instance

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const data = await fetcher('/api/auth/me');
      setUser(data?.user || null);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    // Optional: redirect after login if needed
    // router.push('/dashboard');
  };

  const logout = async () => {
    setIsLoading(true);
    try {
       // No API call needed if just clearing httpOnly cookie state client-side
       // If you had an API route like /api/auth/logout to clear server session:
       // await fetcher('/api/auth/logout', { method: 'POST' });
      setUser(null);
      // Redirect to login page after logout
      router.push('/login');
    } catch (error) {
        console.error("Logout failed:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth
  };

   // Optional: Show a global loading state while checking initial auth
   if (isLoading && typeof window !== 'undefined') { // Avoid SSR issues with this check
     return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
     )
   }


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};