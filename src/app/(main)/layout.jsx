// src/app/(main)/layout.jsx
'use client'; // This layout component itself is a Client Component due to useAuth, useRouter

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// If you want a default title for this layout group,
// you'd typically put metadata in a PARENT Server Component layout.
// Since this (main)/layout.jsx is already a client component due to hooks,
// metadata for its specific children like /dashboard should ideally be in
// a higher-level server component layout if you need dynamic titles per page that's a client component.

// For now, let's assume the root layout provides the general app title.
// If you need a SPECIFIC title for /dashboard, and /dashboard itself is a client component,
// you might need to structure it differently or accept a more generic title from a parent server layout.

// Let's remove the metadata export here if it's also causing issues for (main) layout.
// Usually, the root layout.jsx at src/app/layout.jsx handles general metadata.

export default function MainLayout({
  children,
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
     )
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
            {children} {/* The DashboardPage will be rendered here */}
        </main>
      </div>
    );
  }

  return null;
}