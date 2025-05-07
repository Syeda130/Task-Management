// src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'h-8 w-8', color = 'border-blue-500' }) => {
  return (
    <div
        className={`inline-block ${size} animate-spin rounded-full border-4 border-solid ${color} border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
        role="status" // ARIA role for accessibility
    >
      <span
        className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]" // Screen reader only text
      >
        Loading...
      </span>
    </div>
  );
};

export default LoadingSpinner;