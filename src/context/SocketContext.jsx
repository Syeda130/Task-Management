// src/context/SocketContext.jsx
'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext'; // To get user ID after login
import toast from 'react-hot-toast'; // For displaying notifications
import { useSWRConfig } from 'swr'; // To mutate data on updates

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
   if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth(); // Get auth state
  const socketRef = useRef(null); // Ref to hold the socket instance
  const { mutate } = useSWRConfig(); // Get SWR mutate function

  useEffect(() => {
    // Connect only when authenticated and socket isn't already set up
    if (isAuthenticated && user?._id && !socketRef.current) {
      // Initialize connection
     const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL,  {
        
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: { userId: user._id } // Optionally send userId in query
      });

      socketRef.current = newSocket; // Store in ref
      setSocket(newSocket); // Store in state (triggers re-render if needed)

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setIsConnected(true);
        // IMPORTANT: Tell the server which user this socket belongs to
        newSocket.emit('join', user._id);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
         // Handle potential cleanup if needed
      });

       newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setIsConnected(false);
        // Optionally show error to user
      });


      // --- Listen for Custom Events ---

      // Listen for task assignment
      newSocket.on('taskAssigned', (data) => {
        console.log('🔔 Event received: taskAssigned', data);
        toast.success(data.message || `New task assigned: ${data.title}`, {
           icon: '📥',
        });
        // Revalidate tasks data to show the new task
        mutate('/api/tasks'); // Revalidate the main task list endpoint
        mutate('/api/notifications'); // Revalidate notifications
         // Could also mutate specific dashboard widgets if needed
         // mutate('/api/tasks?assignedToMe=true');
      });

      // Listen for task updates
      newSocket.on('taskUpdated', (data) => {
        console.log('🔔 Event received: taskUpdated', data);
         toast.info(data.message || `Task updated: ${data.title}`, {
           icon: '🔄',
        });
         // Revalidate task lists and the specific task if viewing it
        mutate('/api/tasks');
        mutate(`/api/tasks/${data.taskId}`); // Revalidate specific task data if cached
        mutate('/api/notifications');
         // mutate('/api/tasks?assignedToMe=true');
         // mutate('/api/tasks?status=...'); // Revalidate filtered lists
      });

      // --- End Custom Event Listeners ---

    } else if ((!isAuthenticated || !user?._id) && socketRef.current) {
      // Disconnect if user logs out or becomes unauthenticated
      console.log('🔌 Disconnecting socket due to logout/auth change.');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        console.log('🧹 Cleaning up socket connection.');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('taskAssigned');
        socketRef.current.off('taskUpdated');
        // Don't necessarily disconnect here unless the provider itself is unmounting permanently
        // Disconnection is handled by the auth state change effect above
      }
    };
  }, [isAuthenticated, user?._id, mutate]); // Rerun effect if auth state changes


  // The context value could provide the socket instance and connection status
  const value = { socket, isConnected };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};