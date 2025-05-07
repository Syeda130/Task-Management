'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import NotificationBell from '@/components/notifications/NotificationBell'; // We'll create this next
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand Name */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              TaskManager
            </Link>
          </div>

          {/* Main Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/dashboard')
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Dashboard
            </Link>
            <Link
               href="/tasks"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/tasks') || pathname.startsWith('/tasks/')
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Tasks
            </Link>
            {/* Add other links as needed */}
          </div>

          {/* Right side: Notifications, User Menu, Logout */}
          <div className="flex items-center space-x-4">
             {!isLoading && user && (
                 <>
                    <NotificationBell />

                    <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300">
                        Hi, {user.name}
                    </span>

                    <Button onClick={logout} variant="outline" size="sm">
                        Logout
                    </Button>
                </>
             )}
             {isLoading && <div className="text-sm text-gray-500">Loading...</div>}
          </div>

          {/* Mobile Menu Button (Optional) */}
          {/* <div className="md:hidden"> ... </div> */}
        </div>
      </div>

        {/* Mobile Menu Panel (Optional) */}
        {/* <div className="md:hidden"> ... </div> */}
    </nav>
  );
};

export default Navbar;