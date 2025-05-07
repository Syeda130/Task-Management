'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import TaskForm from '@/components/tasks/TaskForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useSWRConfig } from 'swr';

const EditTaskPage = () => {
  const params = useParams();
  const taskId = params?.id;
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: taskData, error: taskError, isLoading: isTaskLoading } = useSWR(
    taskId ? `/api/tasks/${taskId}` : null, // Only fetch if taskId is available
    fetcher
  );

  const handleSubmit = async (formData) => {
     setIsSubmitting(true);
     try {
         await fetcher(`/api/tasks/${taskId}`, {
             method: 'PUT',
             body: JSON.stringify(formData),
         });
         toast.success('Task updated successfully!');
         // Mutate the specific task cache and the list cache
         mutate(`/api/tasks/${taskId}`);
         mutate((key) => typeof key === 'string' && key.startsWith('/api/tasks'), undefined, { revalidate: false }); // Optimistically update list view maybe? Or just let it refetch.
         router.push('/tasks'); // Redirect back to the tasks list
     } catch (error) {
         toast.error(error.info?.message || error.message || 'Failed to update task');
         console.error('Update task error:', error);
     } finally {
         setIsSubmitting(false);
     }
  };


  if (isTaskLoading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size="h-12 w-12" /></div>;
  }

  if (taskError) {
     return <div className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-md">Error loading task: {taskError.info?.message || taskError.message}</div>;
  }

   if (!taskData?.task) {
     return <div className="text-center text-gray-500 dark:text-gray-400 p-4">Task not found.</div>;
   }


  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Edit Task</h1>
      <TaskForm
        onSubmit={handleSubmit}
        initialData={taskData.task}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default EditTaskPage;