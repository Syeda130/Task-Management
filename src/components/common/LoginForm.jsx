'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/fetcher';
import toast from 'react-hot-toast';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Link from 'next/link';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await fetcher('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data.user); // Update auth context
      toast.success('Login successful!');
      router.push('/dashboard'); // Redirect to dashboard
    } catch (err) {
      const errorMessage = err.info?.message || err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-center text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
      <Input
        label="Email address"
        id="email"
        name="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
      />
      <Input
        label="Password"
        id="password"
        name="password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />

      {/* Add forgot password link if needed */}
      {/* <div className="flex items-center justify-between">
                  <div className="text-sm">
                      <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                          Forgot your password?
                      </a>
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