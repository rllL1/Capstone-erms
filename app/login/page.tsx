'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { login } from './actions';
import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// Unified login page for all roles

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  // No mode needed for unified login
  const [passwordStrength, setPasswordStrength] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Helper to check students table for the given user id and redirect if found
    async function checkStudentAndRedirect(user: any) {
      try {
        console.debug('checkStudentAndRedirect - user.id:', user?.id, 'user.email:', user?.email);
        const { data, error } = await supabase.from('students').select('user_id').eq('user_id', user.id).single();
        console.debug('students lookup result:', data, 'error:', error);
        if (!error && data) {
          router.push('/student/dashboard');
          return true;
        }
        setError('Student account not found');
        return false;
      } catch (err: any) {
        console.error('students lookup error', err);
        setError('Failed to verify student account');
        return false;
      } finally {
        setIsCheckingSession(false);
      }
    }

    // Check existing session on mount
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await checkStudentAndRedirect(session.user);
        } else {
          setIsCheckingSession(false);
        }
      } catch (e) {
        setIsCheckingSession(false);
      }
    })();

    // Listen for auth state changes (e.g., sign in) and handle redirect
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.debug('onAuthStateChange event', event, session?.user?.id);
      if (event === 'SIGNED_IN' && session?.user) {
        await checkStudentAndRedirect(session.user);
      }
    });

    return () => {
      try { listener.subscription.unsubscribe(); } catch {}
    };
  }, [router]);

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

  // If we're checking an existing session, avoid rendering the form
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-white">
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">ERMS</h1>
            </div>
            <div className="flex items-center gap-3">
              <img src="/2-re.png" alt="Institution Logo" className="h-10 w-auto object-contain" />
              <img src="/234.png" alt="Institution Logo" className="h-10 w-auto object-contain" />
            </div>
          </div>
        </header>
        <main className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-700">Checking session...</p>
          </div>
        </main>
      </div>
    );
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
                <h2 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back</h2>
                <p className="text-gray-500 text-base">Please login to access your account</p>
              </div>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                {/* No tabs needed for unified login */}
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

              {/* Unified Login Form for all roles */}
              <form action={login} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input id="email" name="email" type="email" required className="w-full px-4 h-11 border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-gray-900 placeholder-gray-400" placeholder="Enter your email" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input id="password" name="password" type="password" required className="w-full px-4 h-11 border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-gray-900 placeholder-gray-400" placeholder="Enter your password" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full h-11 bg-purple-400 hover:bg-purple-500 disabled:bg-purple-300 text-white font-medium rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                  Login
                </button>
              </form>
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
  