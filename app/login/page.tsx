'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { login } from './actions';
import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

// Unified login page for all roles

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Helper to check students table for the given user id and redirect if found
    async function checkStudentAndRedirect(user: { id: string; email?: string }) {
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
      } catch (err: unknown) {
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
      } catch (err: unknown) {
        console.error('Session check error:', err);
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

  // If we're checking an existing session, avoid rendering the form
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-white">
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">ERMS</h1>
            </div>
            <div className="flex items-center gap-3">
              <Image src="/2-re.png" alt="Institution Logo" width={40} height={40} className="h-10 w-auto object-contain" />
              <Image src="/234.png" alt="Institution Logo" width={40} height={40} className="h-10 w-auto object-contain" />
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
        open={false}
        aria-labelledby="loading-modal"
        aria-describedby="loading-authentication"
      >
        <Box
          sx={{
            position: 'absolute',
            insetBlockStart: '50%',
            insetInlineStart: '50%',
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
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">ERMS</h1>
          </div>

          {/* Institution Logos */}
          <div className="flex items-center gap-3">
            <Image src="/2-re.png" alt="Institution Logo" width={40} height={40} className="h-10 w-auto object-contain" />
            <Image src="/234.png" alt="Institution Logo" width={40} height={40} className="h-10 w-auto object-contain" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen flex items-center py-6 sm:py-10">
        <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 lg:gap-20 items-center">
            {/* Left Section - Login Form */}
            <div className="w-full max-w-md mx-auto relative">
              {/* Decorative violet background shape */}
              <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-violet-200 to-purple-200 rounded-full filter blur-3xl opacity-30 -z-10 transform translate-x-20 translate-y-32"></div>
              {/* Heading */}
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back</h2>
                <p className="text-gray-500 text-base">Please login to access your account</p>
              </div>

              {/* Error Message */}
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Login Form */}
              <Box
                component="form"
                action={login}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2.5,
                }}
              >
                <TextField
                  fullWidth
                  id="email-input"
                  name="email"
                  label="Email Address"
                  variant="outlined"
                  type="email"
                  required
                  placeholder="Enter your email"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#FFFFFF',
                      '&:hover fieldset': { borderColor: '#8B5CF6' },
                      '&.Mui-focused fieldset': { borderColor: '#8B5CF6', borderWidth: 2 },
                      '& fieldset': { borderColor: '#E5E7EB' },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#6B7280',
                      '&.Mui-focused': { color: '#8B5CF6' },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  id="password-input"
                  name="password"
                  label="Password"
                  variant="outlined"
                  type="password"
                  required
                  placeholder="Enter your password"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#FFFFFF',
                      '&:hover fieldset': { borderColor: '#8B5CF6' },
                      '&.Mui-focused fieldset': { borderColor: '#8B5CF6', borderWidth: 2 },
                      '& fieldset': { borderColor: '#E5E7EB' },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#6B7280',
                      '&.Mui-focused': { color: '#8B5CF6' },
                    },
                  }}
                />

                <button 
                  type="submit" 
                  className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 mt-2"
                >
                  Sign In
                </button>
              </Box>
            </div>

            {/* Right Section - Illustration */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                <Image src="/2345.png" alt="Education Illustration" width={400} height={400} className="w-full h-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
  