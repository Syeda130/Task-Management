'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/fetcher';
import toast from 'react-hot-toast';
import Input from '@/components/common/Input'; // Ensure Input component exists
import Button from '@/components/common/Button'; // Ensure Button component exists
import Link from 'next/link';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // State to hold login error message
  const { login } = useAuth(); // login function from AuthContext
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Clear previous errors

    try {
      const data = await fetcher('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // On successful login from API:
      login(data.user); // Update the AuthContext with user data
      toast.success('Login successful!');
      router.push('/dashboard'); // Redirect to the main dashboard page

    } catch (err) {
      // Handle errors from the fetcher (API errors)
      const errorMessage = err.info?.message || err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage); // Set the error state to display in the form
      toast.error(errorMessage); // Show error toast notification
      console.error('Login error:', err);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display login error message if it exists */}
      {error && (
        <p className="text-center text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">
          {error}
        </p>
      )}

      <Input
        label="Email address"
        id="email"
        name="email"
        type="email"
        autoComplete="email" // Added for better UX
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        placeholder="you@example.com"
      />

      <Input
        label="Password"
        id="password"
        name="password"
        type="password"
        autoComplete="current-password" // Added for better UX
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        placeholder="Your password"
      />

      {/* Optional: Add remember me / forgot password links */}
      {/* <div className="flex items-center justify-between">
           <div className="flex items-center">
               <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
               <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300"> Remember me </label>
           </div>
           <div className="text-sm">
               <a href="#" className="font-medium text-blue-600 hover:text-blue-500"> Forgot your password? </a>
           </div>
       </div> */}

      <div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>

      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Not a member?{' '}
        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
          Register now
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;