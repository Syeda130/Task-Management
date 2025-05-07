'use client';
import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import TaskFilter from '@/components/tasks/TaskFilter';
import TaskCard from '@/components/tasks/TaskCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';

const TasksPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    page: 1,
    limit: 12, // Number of tasks per page
  });

  // Build query string dynamically based on filters
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    params.append('page', filters.page.toString());
    params.append('limit', filters.limit.toString());
    return params.toString();
  }, [filters]);

  const swrKey = `/api/tasks?${queryString}`;
  const { data, error, isLoading } = useSWR(swrKey, fetcher, {
      keepPreviousData: true, // Keep displaying old data while loading new page/filters
  });

  const tasks = data?.tasks || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

   const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setFilters(prev => ({ ...prev, page: newPage }));
             window.scrollTo(0, 0); // Scroll to top on page change
        }
   }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
        <Link href="/tasks/new" passHref>
          <Button>
            <FaPlus className="mr-2 -ml-1 h-4 w-4" /> Create New Task
          </Button>
        </Link>
      </div>

      <TaskFilter filters={filters} onFilterChange={handleFilterChange} />

      {isLoading && !data && ( // Show full page spinner only on initial load
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="h-12 w-12" />
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-md">
          Error loading tasks: {error.info?.message || error.message}
        </div>
      )}

      {!isLoading && !error && tasks.length === 0 && (
         <div className="text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-6 rounded-md shadow">
             No tasks found matching your criteria.
         </div>
      )}


      {!error && tasks.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>

            {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-4">
                <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                    variant="outline"
                >
                    Previous
                </Button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoading}
                     variant="outline"
                >
                    Next
                </Button>
            </div>
          )}
        </>
      )}

      {isLoading && data && ( // Show subtle loading indicator when refetching/paginating
         <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
             Loading...
         </div>
      )}
    </div>
  );
};

export default TasksPage;