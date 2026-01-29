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

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [student, setStudent] = useState<{ user_id: string; fullname: string; email: string; student_id: string; course: string; status: string } | null>(null);
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

        // Fetch student data directly from Supabase
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('user_id, fullname, email, student_id, course, status')
          .eq('user_id', user.id)
          .single();

        if (studentError) {
          console.error('Profile: Student query error:', studentError);
          setMessage({ type: 'error', text: 'Unable to load profile. ' + (studentError.message || 'Student record not found.') });
          setLoading(false);
          return;
        }

        if (!studentData) {
          console.warn('Profile: No student record found');
          setMessage({ type: 'error', text: 'Student record not found. Please contact support.' });
          setLoading(false);
          return;
        }

        console.debug('Profile: Student data loaded:', studentData.fullname);
        setStudent(studentData);
        setForm({ 
          fullname: studentData.fullname || '', 
          email: studentData.email || '', 
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
      if (!student) {
        setMessage({ type: 'error', text: 'No student loaded' });
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
      if (form.fullname !== student.fullname || form.email !== student.email) {
        console.debug('Profile: Updating fullname and email');
        
        const { error: updateError } = await supabase
          .from('students')
          .update({
            fullname: form.fullname,
            email: form.email,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', student.user_id);

        if (updateError) {
          console.error('Profile: Update error:', updateError);
          throw updateError;
        }

        // Also update profiles table if it exists
        try {
          await supabase
            .from('profiles')
            .update({
              fullname: form.fullname,
              updated_at: new Date().toISOString(),
            })
            .eq('id', student.user_id);
        } catch (err) {
          console.warn('Profile: Could not update profiles table:', err);
          // Don't fail if profiles table update fails
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', blockSize: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!student) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Profile</Typography>
        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}
        <Typography>Unable to load profile. Please refresh the page or log in again.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Student Profile</Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Read-only section */}
        <Box sx={{ xs: 1, md: 1/2, display: 'grid', p: 1.5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Account Information</Typography>
              <TextField
                fullWidth
                label="Student ID"
                value={student?.student_id ?? ''}
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Course"
                value={student?.course ?? ''}
                InputProps={{ readOnly: true }}
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#6B7280' }}>
                These fields are read-only and managed by administrators.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Editable section */}
        <Box sx={{ xs: 1, md: 1/2, display: 'grid', p: 1.5 }}>
          <Card>
            <CardContent>
              <Box component="form" onSubmit={handleUpdate}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Edit Profile</Typography>

                <TextField
                  fullWidth
                  label="Full Name"
                  value={form.fullname}
                  onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                  sx={{ mb: 2 }}
                  disabled={updating}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  sx={{ mb: 3 }}
                  disabled={updating}
                />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#374151' }}>
                  Change Password (Optional)
                </Typography>

                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) => {
                    setForm({ ...form, currentPassword: e.target.value });
                    setPasswordValidationError(null);
                  }}
                  sx={{ mb: 2 }}
                  disabled={updating}
                  error={!!passwordValidationError}
                  helperText={passwordValidationError}
                />

                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  sx={{ mb: 3 }}
                  disabled={updating}
                  helperText="Leave blank if you don't want to change password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={updating}
                  sx={{ bgcolor: '#8B5CF6', '&:hover': { bgcolor: '#7C3AED' } }}
                >
                  {updating ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Save Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Grid>
    </Box>
  );
}
