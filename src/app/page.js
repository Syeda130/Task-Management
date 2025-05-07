'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Link from 'next/link'; // Import Link

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if logged in, once loading is complete
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
    // If not loading and not authenticated, they stay here (on the landing/root page)
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="h-16 w-16" />
        </div>
     )
  }

  // Render a simple landing page for non-authenticated users
  if (!isAuthenticated) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 text-center p-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
                  Welcome to TaskManager
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Your collaborative solution for managing team tasks efficiently.
              </p>
              <div>
                  <Link href="/login" className="px-6 py-3 mr-4 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200">
                      Login
                  </Link>
                  <Link href="/register" className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md shadow hover:bg-gray-300 transition duration-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                      Register
                  </Link>
              </div>
          </div>
      );
  }

  // This part should technically not be reached if redirect works, but acts as a fallback.
  return null; // Or some minimal content if needed
}