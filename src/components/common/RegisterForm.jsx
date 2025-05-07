'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetcher } from '@/lib/fetcher';
import toast from 'react-hot-toast';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Link from 'next/link';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) { // Example basic validation
        setError('Password must be at least 6 characters long.');
        toast.error('Password must be at least 6 characters long.');
        return;
    }


    setIsLoading(true);

    try {
      await fetcher('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      toast.success('Registration successful! Please log in.');
      router.push('/login'); // Redirect to login page
    } catch (err) {
      const errorMessage = err.info?.message || err.message || 'Registration failed. Please try again.';
       if (err.status === 400 && err.info?.errors) {
            // Handle validation errors from backend
            const backendErrors = {};
             for (const key in err.info.errors) {
                 backendErrors[key] = err.info.errors[key].message;
             }
             setValidationErrors(backendErrors);
             setError("Please fix the errors below."); // General message
             toast.error("Please fix the validation errors.");

        } else {
            setError(errorMessage);
            toast.error(errorMessage);
        }

      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
       {error && <p className="text-center text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
      <Input
        label="Your Name"
        id="name"
        name="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={validationErrors.name}
        disabled={isLoading}
      />
      <Input
        label="Email address"
        id="email"
        name="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={validationErrors.email}
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
        error={validationErrors.password}
        disabled={isLoading}
      />
      <Input
        label="Confirm Password"
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isLoading}
         error={password !== confirmPassword && confirmPassword ? 'Passwords do not match' : ''}
      />
      <div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Registering...' : 'Create account'}
        </Button>
      </div>
       <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
            </Link>
        </p>
    </form>
  );
};

export default RegisterForm;