'use client';

import { useState } from 'react';
import { signup } from './actions';
import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Link from 'next/link';

export default function StudentSignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string>('');

  function checkPasswordStrength(password: string) {
    if (password.length === 0) {
      setPasswordStrength('');
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength < 2) setPasswordStrength('Weak');
    else if (strength < 4) setPasswordStrength('Medium');
    else setPasswordStrength('Strong');
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      setIsLoading(false);
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      setIsLoading(false);
      return;
    }

    if (!/\d/.test(password)) {
      setError('Password must contain at least one number');
      setIsLoading(false);
      return;
    }

    const result = await signup(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      setSuccess(result.success);
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Registration Successful!</h2>
            <p className="text-green-700 mb-6">{success}</p>
            <Link 
              href="/student/login"
              className="inline-block w-full text-center py-2 bg-purple-400 hover:bg-purple-500 text-white font-medium rounded-sm transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Loading Modal */}
      <Modal
        open={isLoading}
        aria-labelledby="loading-modal"
        aria-describedby="loading-registration"
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
          <p className="text-gray-700 font-medium">Creating your account...</p>
        </Box>
      </Modal>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 h-16 flex items-center justify-between">
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
      <main className="pt-16 min-h-screen flex items-center py-6 sm:py-10">
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 lg:gap-20 items-center">
            {/* Left Section - Signup Form */}
            <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-none md:shadow p-4 sm:p-8 md:p-10 lg:p-0">
              {/* Heading */}
              <div className="mb-10">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  Student Registration
                </h2>
                <p className="text-gray-500 text-base">
                  Create your account to get started
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Signup Form */}
              <form action={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="student_id"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Student ID:
                  </label>
                  <input
                    id="student_id"
                    name="student_id"
                    type="text"
                    required
                    className="w-full px-4 h-11 border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-gray-900 placeholder-gray-400"
                    placeholder="Enter your student ID"
                  />
                </div>

                <div>
                  <label
                    htmlFor="fullname"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name:
                  </label>
                  <input
                    id="fullname"
                    name="fullname"
                    type="text"
                    required
                    className="w-full px-4 h-11 border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-gray-900 placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>

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
                    onChange={(e) => checkPasswordStrength(e.target.value)}
                    className="w-full px-4 h-11 border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-gray-900 placeholder-gray-400"
                    placeholder="Create a strong password"
                  />
                  {passwordStrength && (
                    <p className={`text-xs mt-1 ${
                      passwordStrength === 'Weak' ? 'text-red-600' :
                      passwordStrength === 'Medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      Password strength: {passwordStrength}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Must be 8+ characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirm_password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password:
                  </label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    required
                    className="w-full px-4 h-11 border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-gray-900 placeholder-gray-400"
                    placeholder="Re-enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-purple-400 hover:bg-purple-500 disabled:bg-purple-300 text-white font-medium rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Sign Up
                </button>
              </form>

              {/* Footer Note */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/student/login" className="text-purple-500 hover:text-purple-600 font-medium">
                    Login here
                  </Link>
                </p>
                <p className="mt-4 text-xs text-gray-400">
                  Your account will be activated after admin approval
                </p>
              </div>
            </div>

            {/* Right Section - Illustration */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                <img src="/2345.png" alt="Education Illustration" className="w-full h-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
