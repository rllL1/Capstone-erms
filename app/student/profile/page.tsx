"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({ fullname: '', email: '', password: '', currentPassword: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch('/api/student/me');
      if (!res.ok) {
        setMessage('Unable to load profile');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStudent(data.student);
      setForm({ ...form, fullname: data.student.fullname, email: data.student.email });
      setLoading(false);
    };
    load();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      if (!student) {
        setMessage('No student loaded');
        return;
      }
      const supabase = createClient();
      // Update students table
      const { data, error } = await supabase.from('students').update({ fullname: form.fullname, email: form.email }).eq('user_id', student.user_id);
      if (error) throw error;

      // Optionally update auth email/password for current user
      if (form.password) {
        const { error: authErr } = await supabase.auth.updateUser({ password: form.password });
        if (authErr) throw authErr;
      }

      setMessage('Profile updated successfully');
    } catch (err: any) {
      setMessage(err?.message || 'Failed to update profile');
    }
  };

  if (loading) return <Typography>Loading profile...</Typography>;

  if (!student) return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Profile</Typography>
      {message && <Alert sx={{ mb: 2 }}>{message}</Alert>}
      <Typography>Unable to load profile.</Typography>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Profile</Typography>
      {message && <Alert sx={{ mb: 2 }}>{message}</Alert>}

      <Box component="form" onSubmit={handleUpdate} sx={{ maxWidth: 640 }}>
        <TextField fullWidth label="Full name" value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Student ID" value={student?.student_id ?? ''} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
          <TextField fullWidth label="Course" value={student?.course ?? ''} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
        <TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} sx={{ mb: 2 }} />

        <TextField fullWidth label="Current password (required to change password)" type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} sx={{ mb: 2 }} />
        <TextField fullWidth label="New password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} sx={{ mb: 2 }} />

        <Button type="submit" variant="contained">Save changes</Button>
      </Box>
    </Box>
  );
}
