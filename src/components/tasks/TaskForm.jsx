'use client';
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import { useRouter } from 'next/navigation';

const TaskForm = ({ onSubmit, initialData = null, isLoading }) => {
  const isEditMode = Boolean(initialData);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'To Do',
    priority: initialData?.priority || 'Medium',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '', // Format for date input
    assignedTo: initialData?.assignedTo?._id || '', // Store only the ID
  });
  const [errors, setErrors] = useState({});

  // Fetch users for assignment dropdown
  const { data: usersData, error: usersError } = useSWR('/api/users', fetcher);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error on change
     if (errors[name]) {
        setErrors(prev => ({...prev, [name]: null}));
     }
  };

   const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        // Add more validation rules if needed
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
   }

  const handleSubmit = (e) => {
    e.preventDefault();
     if (!validateForm()) {
         return; // Stop submission if validation fails
     }
    // Prepare data for submission (handle empty assignedTo, dueDate)
    const dataToSubmit = {
      ...formData,
      assignedTo: formData.assignedTo || null, // Send null if unassigned
      dueDate: formData.dueDate || null, // Send null if no due date
    };
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <Input
        label="Task Title"
        id="title"
        name="title"
        required
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        disabled={isLoading}
        placeholder="Enter task title"
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Enter task description"
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-600 dark:focus:border-blue-600"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Status"
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled={isLoading}
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Under Review">Under Review</option>
          <option value="Done">Done</option>
        </Select>

        <Select
          label="Priority"
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          disabled={isLoading}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </Select>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Input
            label="Due Date (Optional)"
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            disabled={isLoading}
        />

        <Select
          label="Assign To (Optional)"
          id="assignedTo"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          disabled={isLoading || usersError || !usersData}
        >
          <option value="">-- Unassigned --</option>
          {usersError && <option disabled>Error loading users</option>}
          {!usersData && !usersError && <option disabled>Loading users...</option>}
          {usersData?.users?.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </Select>
        </div>


      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()} // Go back to previous page
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Task' : 'Create Task')}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;