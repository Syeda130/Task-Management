'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetcher } from '@/lib/fetcher';
import toast from 'react-hot-toast';
import Input from '@/components/common/Input'; // Ensure Input component exists
import Button from '@/components/common/Button'; // Ensure Button component exists
import Link from 'next/link';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // General error message
  const [validationErrors, setValidationErrors] = useState({}); // Specific field errors
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear general error
    setValidationErrors({}); // Clear validation errors

    // Basic Frontend Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) { // Example: Minimum password length
        setError('Password must be at least 6 characters long.');
        setValidationErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters long.' }));
        toast.error('Password must be at least 6 characters long.');
        return;
    }
    if (!name.trim()) {
        setValidationErrors(prev => ({ ...prev, name: 'Name is required.' }));
        toast.error('Name is required.');
        return; // Stop if name is empty
    }
     if (!email.trim()) { // Basic check, relies on backend for format
        setValidationErrors(prev => ({ ...prev, email: 'Email is required.' }));
        toast.error('Email is required.');
        return; // Stop if email is empty
    }


    setIsLoading(true);

    try {
      await fetcher('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      toast.success('Registration successful! Please log in.');
      router.push('/login'); // Redirect to login page after successful registration

    } catch (err) {
      // Handle errors from the backend (fetcher)
      const errorMessage = err.info?.message || err.message || 'Registration failed. Please try again.';

      if (err.status === 400 && err.info?.errors) {
        // Handle specific validation errors from the backend (Mongoose)
        const backendErrors = {};
        for (const key in err.info.errors) {
          backendErrors[key] = err.info.errors[key].message;
        }
        setValidationErrors(backendErrors);
        setError("Please fix the errors highlighted below."); // Set a general message
        toast.error("Please fix the validation errors.");
      } else if (err.status === 409) {
           // Handle specific "User already exists" error
           setError(errorMessage); // Display the specific message from backend
           setValidationErrors({ email: errorMessage }); // Highlight the email field
           toast.error(errorMessage);
      }
      else {
        // Handle other generic errors
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
      {/* Display general error message if it exists */}
      {error && !Object.keys(validationErrors).length > 0 && ( // Show general error only if no specific validation errors
          <p className="text-center text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">
              {error}
          </p>
      )}
       {error && Object.keys(validationErrors).length > 0 && ( // Show general instructions when validation errors exist
          <p className="text-center text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">
              {error}
          </p>
      )}


      <Input
        label="Your Name"
        id="name"
        name="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={validationErrors.name} // Pass specific validation error
        disabled={isLoading}
        placeholder="John Doe"
      />

      <Input
        label="Email address"
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={validationErrors.email} // Pass specific validation error
        disabled={isLoading}
        placeholder="you@example.com"
      />

      <Input
        label="Password"
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={validationErrors.password} // Pass specific validation error
        disabled={isLoading}
        placeholder="•••••••• (min. 6 characters)"
      />

      <Input
        label="Confirm Password"
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isLoading}
        // Add simple frontend check for immediate feedback
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