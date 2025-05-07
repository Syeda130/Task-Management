import React from 'react';
import Button from '@/components/common/Button';

const Modal = ({ isOpen, onClose, title, children, confirmText = "Confirm", cancelText = "Cancel", onConfirm, isConfirming = false }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out flex items-center justify-center"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4">
        <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-t-lg">
          <div className="sm:flex sm:items-start">
            {/* Optional Icon */}
            {/* <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">...</svg>
                            </div> */}
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <Button
            onClick={onConfirm}
            variant="danger" // Or primary depending on context
            className="w-full inline-flex justify-center sm:ml-3 sm:w-auto sm:text-sm"
            disabled={isConfirming}
          >
            {isConfirming ? 'Processing...' : confirmText}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="mt-3 w-full inline-flex justify-center sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            disabled={isConfirming}
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
