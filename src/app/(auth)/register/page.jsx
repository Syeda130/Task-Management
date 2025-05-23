import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

 export const metadata = {
    title: 'Register - Task Manager',
};

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 md:p-10 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;