'use client';
import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { FaBell } from 'react-icons/fa';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import Button from '../common/Button';

const NotificationBell = () => {
  const { data, error, mutate } = useSWR('/api/notifications', fetcher, {
    refreshInterval: 60000, // Refresh every 60 seconds
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

   // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


  const handleToggle = () => setIsOpen(!isOpen);

  const handleMarkAllRead = async () => {
     try {
         await fetcher('/api/notifications', { method: 'POST' }); // Call the mark all read endpoint
         mutate(); // Revalidate notification data
         setIsOpen(false); // Close dropdown
         toast.success('Notifications marked as read');
     } catch (err) {
        toast.error('Failed to mark notifications as read');
         console.error("Mark all read error:", err);
     }
  };

  if (error) {
    console.error('Failed to load notifications:', error);
    // Optionally return a disabled bell or error indicator
    return (
         <div className="relative">
            <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500" title="Error loading notifications">
                <FaBell className="h-5 w-5" />
                 <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 justify-center items-center text-white text-xs">!</span>
                </span>
            </button>
        </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <FaBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 justify-center items-center text-white text-xs font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-80 sm:w-96 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100 transform opacity-100 scale-100"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
                {notifications.length > 0 && unreadCount > 0 && (
                     <Button onClick={handleMarkAllRead} variant="outline" size="sm">
                        Mark all read
                    </Button>
                )}
            </div>

            <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">No new notifications</p>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif._id}
                            className={`block px-4 py-3 text-sm border-b border-gray-100 dark:border-gray-700 ${
                                !notif.read ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            role="menuitem"
                        >
                            {notif.link ? (
                                <Link href={notif.link} className="block" onClick={() => setIsOpen(false)}>
                                    <p className={`font-medium ${!notif.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>{notif.message}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                    </p>
                                </Link>
                            ) : (
                                <div>
                                     <p className={`font-medium ${!notif.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>{notif.message}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;