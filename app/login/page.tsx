'use client';

import { useState } from 'react';
import { login } from './actions';
import { login as studentLogin, logout } from '../student/login/actions';
import { signup as studentSignup } from '../student/signup/actions';
import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

type LoginMode = 'teacher' | 'student-login' | 'student-signup';

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<LoginMode>('student-login');
  const [passwordStrength, setPasswordStrength] = useState<string>('');

  async function handleTeacherSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  async function handleStudentLogin(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const result = await studentLogin(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  async function handleStudentSignup(formData: FormData) {
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

    const result = await studentSignup(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      setSuccess(result.success);
      setIsLoading(false);
    }
  }

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
            {/* Left Section - Login Form */}
            <div className="w-full max-w-md mx-auto">
              {/* Heading */}
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  {mode === 'student-signup' ? 'Student Registration' : 'Welcome Back'}
                </h2>
                <p className="text-gray-500 text-base">
                  {mode === 'student-signup' ? 'Create your student account' : 'Please login to access your account'}
                </p>
              </div>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                  value={mode === 'teacher' ? 0 : mode === 'student-login' ? 1 : 2}
                  onChange={(e, newValue) => {
                    setError(null);
                    setSuccess(null);
                    if (newValue === 0) setMode('teacher');
                    else if (newValue === 1) setMode('student-login');
                    else setMode('student-signup');
                  }}
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    },
                    '& .Mui-selected': {
                      color: '#8B5CF6',
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#8B5CF6',
                    },
                  }}
                >
                  <Tab label="Teacher" />
                  <Tab label="Student Login" />
                  <Tab label="Student Signup" />
                </Tabs>
              </Box>

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Teacher/Admin Login Form */}
              {mode === 'teacher' && (
                <form action={handleTeacherSubmit} className="space-y-5">
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
              )}

              {/* Student Login Form */}
              {mode === 'student-login' && (
                <form action={handleStudentLogin} className="space-y-5">
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
                      htmlFor="student_password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password:
                    </label>
                    <input
                      id="student_password"
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
              )}

              {/* Student Signup Form */}
              {mode === 'student-signup' && (
                <form action={handleStudentSignup} className="space-y-5">
                  <div>
                    <label
                      htmlFor="signup_student_id"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Student ID:
                    </label>
                    <input
                      id="signup_student_id"
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
                      htmlFor="signup_email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email:
                    </label>
                    <input
                      id="signup_email"
                      name="email"
                      type="email"
                      required
                      className="w-full px-4 h-11 border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-gray-900 placeholder-gray-400"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="signup_password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password:
                    </label>
                    <input
                      id="signup_password"
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

                  <p className="text-xs text-gray-400 text-center">
                    Your account will be activated after admin approval
                  </p>
                </form>
              )}

              {/* Footer Note */}
              {mode === 'teacher' && (
                <p className="mt-8 text-xs text-gray-400 text-center">
                  Contact your administrator for account access
                </p>
              )}
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
