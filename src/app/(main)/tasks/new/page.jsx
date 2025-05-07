'use client';
import React, { useState } from 'react';
import TaskForm from '@/components/tasks/TaskForm';
import { fetcher } from '@/lib/fetcher';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';

const NewTaskPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const newTask = await fetcher('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      toast.success('Task created successfully!');
      // Mutate the tasks list cache so the new task appears immediately
       mutate((key) => typeof key === 'string' && key.startsWith('/api/tasks'), undefined, { revalidate: true });
      router.push('/tasks'); // Redirect to the tasks list
    } catch (error) {
      toast.error(error.info?.message || error.message || 'Failed to create task');
      console.error('Create task error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Create New Task</h1>
      <TaskForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};

export default NewTaskPage;