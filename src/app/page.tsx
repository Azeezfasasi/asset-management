'use client';

import Image from "next/image";
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from "@/components/context-api/UserContext";
import { Suspense } from 'react';

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginComponent />
    </Suspense>
  );
}

function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const { setAuthenticatedUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthenticatedUser(data.user);
        const redirectPath = searchParams.get('redirect') || '/dashboard/my-dashboard';
        window.location.assign(redirectPath);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Login Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome to RevLock</h1>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 mb-4 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          {/* forget password link */}
          <div className="text-center mt-4">
            <a href="/forget-password" className="text-blue-600 hover:underline">
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
      {/* Image Section */}
      <div className="flex-1 bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
        <div className="text-center">
          <Image src="/next.svg" alt="RevLock Logo" loading="eager" className="w-32 h-32 mx-auto mb-4" width={128} height={128} />
          <h2 className="text-2xl font-bold text-white mb-2">Secure Access</h2>
          <p className="text-white opacity-90">Your gateway to RevLock dashboard</p>
        </div>
      </div>
    </div>
  );
}
