"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { Person, Lock, CheckCircle } from '@mui/icons-material';

export default function TeacherProfilePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [teacher, setTeacher] = useState<{ user_id: string; fullname: string; email: string; department: string; id: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({ fullname: '', email: '', password: '', currentPassword: '' });
  const [passwordValidationError, setPasswordValidationError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        console.debug('Profile: Starting data fetch');
        
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.warn('Profile: No authenticated user');
          setMessage({ type: 'error', text: 'Not authenticated. Please log in again.' });
          setLoading(false);
          return;
        }

        console.debug('Profile: User authenticated:', user.id);

        // Fetch teacher data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, fullname, email, department')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile: Profile query error:', profileError);
          setMessage({ type: 'error', text: 'Unable to load profile. ' + (profileError.message || 'Profile record not found.') });
          setLoading(false);
          return;
        }

        if (!profileData) {
          console.warn('Profile: No profile record found');
          setMessage({ type: 'error', text: 'Profile record not found. Please contact support.' });
          setLoading(false);
          return;
        }

        console.debug('Profile: Teacher data loaded:', profileData.fullname);
        setTeacher({ ...profileData, user_id: user.id });
        setForm({ 
          fullname: profileData.fullname || '', 
          email: profileData.email || '', 
          password: '', 
          currentPassword: '' 
        });
      } catch (err: unknown) {
        console.error('Profile error:', err);
        setMessage({ type: 'error', text: 'Failed to load profile. ' + (err instanceof Error ? err.message : 'Please try again.') });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const validateCurrentPassword = async (currentPassword: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      
      console.debug('Profile: Checking current session');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Profile: Session invalid');
        setPasswordValidationError('Session expired. Please log in again.');
        return false;
      }

      console.debug('Profile: Attempting password validation');
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: currentPassword,
      });

      if (error) {
        console.warn('Profile: Password validation failed:', error.message);
        setPasswordValidationError('Current password is incorrect');
        return false;
      }

      console.debug('Profile: Password validated successfully');
      return true;
    } catch (err: unknown) {
      console.error('Profile: Password validation error:', err);
      setPasswordValidationError('Failed to validate password');
      return false;
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setPasswordValidationError(null);
    setUpdating(true);

    try {
      if (!teacher) {
        setMessage({ type: 'error', text: 'No teacher profile loaded' });
        setUpdating(false);
        return;
      }

      // Validate form data
      if (!form.fullname.trim()) {
        setMessage({ type: 'error', text: 'Full name is required' });
        setUpdating(false);
        return;
      }

      if (!form.email.trim() || !form.email.includes('@')) {
        setMessage({ type: 'error', text: 'Valid email is required' });
        setUpdating(false);
        return;
      }

      const supabase = createClient();

      // Check if session is still valid
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
        setUpdating(false);
        return;
      }

      console.debug('Profile: Starting update for user:', user.id);

      // Update fullname and email if changed
      if (form.fullname !== teacher.fullname || form.email !== teacher.email) {
        console.debug('Profile: Updating fullname and email');
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            fullname: form.fullname,
            email: form.email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', teacher.user_id);

        if (updateError) {
          console.error('Profile: Update error:', updateError);
          throw updateError;
        }
      }

      // Update password if provided
      if (form.password) {
        if (!form.currentPassword) {
          setPasswordValidationError('Current password is required to change password');
          setUpdating(false);
          return;
        }

        // Validate current password first
        console.debug('Profile: Validating current password');
        const isValid = await validateCurrentPassword(form.currentPassword);
        if (!isValid) {
          setUpdating(false);
          return;
        }

        // Update password
        console.debug('Profile: Updating password');
        const { error: authErr } = await supabase.auth.updateUser({ password: form.password });
        if (authErr) {
          console.error('Profile: Password update error:', authErr);
          throw authErr;
        }

        // Clear password fields after successful update
        setForm({ ...form, password: '', currentPassword: '' });
      }

      console.debug('Profile: Update successful');
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      
      // Reload profile to show any changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: unknown) {
      console.error('Profile: Update failed:', err);
      // Handle specific error types
      if (err instanceof Error) {
        if (err.message?.includes('session') || err.message?.includes('Unauthorized')) {
          setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
        } else if (err.message?.includes('email')) {
          setMessage({ type: 'error', text: 'Email is already in use or invalid.' });
        } else {
          setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#8B5CF6' }} size={48} />
      </Box>
    );
  }

  if (!teacher) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ pt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#1F2937' }}>Profile</Typography>
          {message && (
            <Alert severity={message.type} sx={{ mb: 2, borderRadius: 2 }}>
              {message.text}
            </Alert>
          )}
          <Typography sx={{ color: '#6B7280' }}>Unable to load profile. Please refresh the page or log in again.</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4, px: 0 }}>
        {/* Header Section */}
        <Box sx={{ 
          mb: 4, 
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 50%, #F5F3FF 100%)',
          border: '1px solid #E9D5FF',
          boxShadow: '0 2px 8px rgba(139, 92, 246, 0.08)',
          transition: 'all 0.3s ease',
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 1, 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Person sx={{ fontSize: 32, background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
            Teacher Profile
          </Typography>
          <Typography sx={{ color: '#7C3AED', fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.3px' }}>
            Manage your account information and security settings
          </Typography>
        </Box>

        {/* Alert Messages */}
        {message && (
          <Alert 
            severity={message.type}
            icon={message.type === 'success' ? <CheckCircle /> : undefined}
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              backgroundColor: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: message.type === 'success' ? '#065F46' : '#7F1D1D',
              border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
              '& .MuiAlert-icon': { color: message.type === 'success' ? '#10B981' : '#EF4444' }
            }}
          >
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
          {/* Edit Profile Card */}
          <Grid item xs={12} sx={{ width: '100%', p: 0 }}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 10px 25px rgba(139, 92, 246, 0.1)',
                  borderColor: '#E9D5FF',
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box component="form" onSubmit={handleUpdate}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box 
                      sx={{ 
                        p: 1,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)',
                      }}
                    >
                      <Person sx={{ fontSize: 24, color: '#8B5CF6' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
                      Edit Profile
                    </Typography>
                  </Box>

                  <Stack spacing={2.5}>
                    {/* Basic Info Section */}
                    <Box>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7280', mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Full Name
                      </Typography>
                      <TextField
                        fullWidth
                        value={form.fullname}
                        onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                        disabled={updating}
                        placeholder="Enter your full name"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#FFFFFF',
                            '&:hover fieldset': { borderColor: '#8B5CF6' },
                            '&.Mui-focused fieldset': { borderColor: '#8B5CF6', borderWidth: 2 },
                            '& fieldset': { borderColor: '#E5E7EB' },
                          },
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7280', mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Email Address
                      </Typography>
                      <TextField
                        fullWidth
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        disabled={updating}
                        placeholder="Enter your email"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#FFFFFF',
                            '&:hover fieldset': { borderColor: '#8B5CF6' },
                            '&.Mui-focused fieldset': { borderColor: '#8B5CF6', borderWidth: 2 },
                            '& fieldset': { borderColor: '#E5E7EB' },
                          },
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 1, borderColor: '#E5E7EB' }} />

                    {/* Password Section */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Lock sx={{ fontSize: 18, color: '#8B5CF6' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                          Change Password (Optional)
                        </Typography>
                      </Box>

                      <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        value={form.currentPassword}
                        onChange={(e) => {
                          setForm({ ...form, currentPassword: e.target.value });
                          setPasswordValidationError(null);
                        }}
                        disabled={updating}
                        error={!!passwordValidationError}
                        helperText={passwordValidationError}
                        sx={{
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#FFFFFF',
                            '&:hover fieldset': { borderColor: '#8B5CF6' },
                            '&.Mui-focused fieldset': { borderColor: '#8B5CF6', borderWidth: 2 },
                            '& fieldset': { borderColor: '#E5E7EB' },
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        disabled={updating}
                        helperText="Leave blank if you don't want to change password"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#FFFFFF',
                            '&:hover fieldset': { borderColor: '#8B5CF6' },
                            '&.Mui-focused fieldset': { borderColor: '#8B5CF6', borderWidth: 2 },
                            '& fieldset': { borderColor: '#E5E7EB' },
                          },
                        }}
                      />
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={updating}
                      sx={{
                        mt: 2,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover:not(:disabled)': {
                          boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)',
                        }
                      }}
                    >
                      {updating ? (
                        <CircularProgress size={24} sx={{ color: '#fff' }} />
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
