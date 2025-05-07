'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import { debounce } from 'lodash'; // Install: npm install lodash

const TaskFilter = ({ filters, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [priority, setPriority] = useState(filters.priority || '');

   // Debounce the search term update
   const debouncedSearch = useCallback(
       debounce((value) => {
           onFilterChange({ ...filters, search: value, page: 1 }); // Reset page on search
       }, 500), // 500ms delay
    [filters, onFilterChange]
   );

    useEffect(() => {
       debouncedSearch(searchTerm);
       // Cleanup function to cancel the debounce on unmount or change
       return debouncedSearch.cancel;
    }, [searchTerm, debouncedSearch]);


  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    onFilterChange({ ...filters, status: newStatus, page: 1 }); // Reset page on filter change
  };

  const handlePriorityChange = (e) => {
    const newPriority = e.target.value;
    setPriority(newPriority);
    onFilterChange({ ...filters, priority: newPriority, page: 1 }); // Reset page
  };

   const handleReset = () => {
        setSearchTerm('');
        setStatus('');
        setPriority('');
        onFilterChange({ search: '', status: '', priority: '', page: 1 }); // Reset all filters and page
   }

  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <Input
          label="Search Tasks"
          id="search"
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          // No immediate API call here, handled by useEffect debounce
        />
        <Select
          label="Status"
          id="status"
          value={status}
          onChange={handleStatusChange}
        >
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Under Review">Under Review</option>
          <option value="Done">Done</option>
        </Select>
        <Select
          label="Priority"
          id="priority"
          value={priority}
          onChange={handlePriorityChange}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </Select>
         <Button onClick={handleReset} variant="outline" className="mt-4 md:mt-0 lg:mt-7">
             Reset Filters
         </Button>
        {/* Add Due Date Filter if needed */}
      </div>
    </div>
  );
};

export default TaskFilter;