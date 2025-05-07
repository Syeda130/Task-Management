'use client';
import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TaskCard from '@/components/tasks/TaskCard'; // Reuse TaskCard for display
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Get user info if needed

//  export const metadata = { // Note: 'use client' means metadata might not work as expected here. Define in layout or parent server component if static.
//     title: 'Dashboard - Task Manager',
// };

const DashboardSection = ({ title, swrKey, emptyMessage }) => {
    const { data, error, isLoading } = useSWR(swrKey, fetcher);

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{title}</h2>
            {isLoading && <div className="flex justify-center p-4"><LoadingSpinner /></div>}
            {error && <p className="text-red-500 dark:text-red-400 text-center">Failed to load tasks.</p>}
            {data && !isLoading && (
                data.tasks?.length > 0 ? (
                    <div className="space-y-4">
                         {data.tasks.map(task => <TaskCard key={task._id} task={task} />)}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center">{emptyMessage}</p>
                )
            )}
        </div>
    );
};


const DashboardPage = () => {
   const { user } = useAuth(); // Can use user._id if needed, though API handles it via auth context

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Dashboard</h1>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-1">
               <DashboardSection
                  title="Tasks Assigned To Me (Recent 5)"
                  swrKey="/api/tasks?assignedToMe=true&limit=5&sort=createdAt:desc" // Added sort
                  emptyMessage="No tasks assigned to you currently."
              />
           </div>
            <div className="lg:col-span-1">
              <DashboardSection
                  title="Tasks I Created (Recent 5)"
                  swrKey="/api/tasks?createdByMe=true&limit=5&sort=createdAt:desc" // Added sort
                  emptyMessage="You haven't created any tasks yet."
              />
           </div>
           <div className="lg:col-span-1">
              <DashboardSection
                  title="Overdue Tasks (Assigned or Created)"
                   // Fetching overdue tasks might need more complex logic or a specific API flag
                   // This assumes API supports a generic 'overdue' flag for relevant tasks
                  swrKey="/api/tasks?overdue=true&limit=5&sort=dueDate:asc" // Sort by oldest due date
                  emptyMessage="No overdue tasks. Great job!"
              />
           </div>
       </div>

        <div className="mt-8 text-center">
            <Link href="/tasks" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                View All Tasks →
            </Link>
        </div>
    </div>
  );
};

export default DashboardPage;