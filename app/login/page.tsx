'use client';

import { useState } from 'react';
import { login } from './actions';
import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Link from 'next/link';

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Loading Modal */}
      <Modal
        open={isLoading}
        aria-labelledby="loading-modal"
        aria-describedby="loading-authentication"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress size={60} sx={{ color: '#A78BFA' }} />
          <p className="text-gray-700 font-medium">Signing in...</p>
        </Box>
      </Modal>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-[1440px] mx-auto px-16 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">ERMS</h1>
          </div>

          {/* Institution Logos */}
          <div className="flex items-center gap-3">
            <img src="/2-re.png" alt="Institution Logo" className="h-10 w-auto object-contain" />
            <img src="/234.png" alt="Institution Logo" className="h-10 w-auto object-contain" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen flex items-center">
        <div className="max-w-[1440px] mx-auto w-full px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left Section - Login Form */}
            <div className="max-w-md">
              {/* Heading */}
              <div className="mb-10">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  Welcome Back
                </h2>
                <p className="text-gray-500 text-base">
                  Please login to access your account
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form action={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email:
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 h-11 border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-gray-900 placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password:
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 h-11 border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-gray-900 placeholder-gray-400"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-purple-400 hover:bg-purple-500 disabled:bg-purple-300 text-white font-medium rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Login
                </button>
              </form>

              {/* Footer Note */}
              <p className="mt-8 text-xs text-gray-400 text-center">
                Contact your administrator for account access
              </p>
            </div>

            {/* Right Section - Illustration */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                <img src="/2345.png" alt="Education Illustration" className="w-full h-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
