'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { format, isPast, parseISO } from 'date-fns';
import { FaEdit, FaTrash, FaUserCircle } from 'react-icons/fa';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal'; // Import the modal
import { fetcher } from '@/lib/fetcher';
import toast from 'react-hot-toast';
import { useSWRConfig } from 'swr';

const TaskCard = ({ task }) => {
  const { mutate } = useSWRConfig();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do': return 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
      case 'In Progress': return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
      case 'Under Review': return 'bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-100';
      case 'Done': return 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100';
      default: return 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'border-green-500';
      case 'Medium': return 'border-yellow-500';
      case 'High': return 'border-orange-500';
      case 'Urgent': return 'border-red-500';
      default: return 'border-gray-300';
    }
  };

  const dueDate = task.dueDate ? parseISO(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && task.status !== 'Done';

  const handleDeleteConfirm = async () => {
     setIsDeleting(true);
     try {
        await fetcher(`/api/tasks/${task._id}`, { method: 'DELETE' });
        toast.success('Task deleted successfully');
        setIsDeleteDialogOpen(false);
        // Mutate the SWR cache for the task list to reflect the deletion
        // Adjust the key based on how you fetch tasks in the list page
        mutate((key) => typeof key === 'string' && key.startsWith('/api/tasks'), undefined, { revalidate: true });
     } catch (error) {
        toast.error(error.info?.message || error.message || 'Failed to delete task');
        console.error('Delete task error:', error);
     } finally {
        setIsDeleting(false);
     }
  };

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 border-l-4 ${getPriorityColor(task.priority)} transition hover:shadow-lg`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 break-words mr-2">{task.title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 break-words">
            {task.description.length > 100 ? `${task.description.substring(0, 100)}...` : task.description}
          </p>
        )}

        <div className="flex flex-wrap justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="mb-2 sm:mb-0">
            {dueDate && (
              <span className={`mr-4 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                Due: {format(dueDate, 'MMM dd, yyyy')}
              </span>
            )}
             <span className="mr-4 hidden sm:inline">P: {task.priority}</span>
          </div>

            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                 <span title={`Created by: ${task.createdBy?.name || 'Unknown'}`} className="flex items-center">
                     <FaUserCircle className="mr-1 text-gray-400" /> {task.createdBy?.name?.split(' ')[0] || 'N/A'} (C)
                 </span>
                {task.assignedTo && (
                    <span title={`Assigned to: ${task.assignedTo.name || 'Unknown'}`} className="flex items-center">
                        <FaUserCircle className="mr-1 text-blue-400" /> {task.assignedTo.name?.split(' ')[0] || 'N/A'} (A)
                    </span>
                )}
            </div>

          <div className="flex space-x-2">
            <Link href={`/tasks/${task._id}/edit`} passHref>
              <Button variant="outline" size="sm" aria-label="Edit Task" className="p-1.5">
                <FaEdit />
              </Button>
            </Link>
            <Button
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="danger"
                size="sm"
                aria-label="Delete Task"
                className="p-1.5"
             >
              <FaTrash />
            </Button>
          </div>
        </div>
      </div>

       {/* Delete Confirmation Modal */}
      <Modal
         isOpen={isDeleteDialogOpen}
         onClose={() => setIsDeleteDialogOpen(false)}
         onConfirm={handleDeleteConfirm}
         title="Delete Task"
         confirmText="Delete"
         isConfirming={isDeleting}
      >
         Are you sure you want to delete the task "{task.title}"? This action cannot be undone.
      </Modal>
    </>
  );
};

export default TaskCard;