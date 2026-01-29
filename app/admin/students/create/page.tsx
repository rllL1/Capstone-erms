"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function CreateStudentPage() {
  const [form, setForm] = useState({ fullname: '', studentId: '', course: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: form.fullname,
          studentId: form.studentId,
          course: form.course,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data?.field === 'studentId') setMessage('Student ID already exists');
        else if (data?.field === 'email') setMessage('Email already registered');
        else setMessage(data?.error || 'Failed to create student');
        return;
      }

      setMessage('Student created successfully!');
      setForm({ fullname: '', studentId: '', course: '', email: '', password: '' });
      setTimeout(() => {
        router.push('/admin/students');
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create student';
      setMessage(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'auto', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          onClick={() => router.back()}
          startIcon={<ArrowBackIcon />}
          sx={{
            color: '#667eea',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            mb: 2,
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
            },
          }}
        >
          Back to Students
        </Button>
      </Box>

      {/* Main Card */}
      <Card sx={{
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.5)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        maxWidth: '800px',
        mx: 'auto',
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* Title Section */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <PersonAddIcon sx={{ color: 'white', fontSize: 40 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#333', mb: 0.5 }}>Create New Student</Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>Fill in the details to add a new student account</Typography>
            </Box>
          </Stack>

          {/* Message Alert */}
          {message && (
            <Alert
              severity={message.includes('success') ? 'success' : 'error'}
              sx={{
                mb: 3,
                borderRadius: '8px',
                border: message.includes('success') ? '1px solid #4caf50' : '1px solid #ff6b6b',
              }}
            >
              {message}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleCreate}>
            <Stack spacing={2.5}>
              <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 2 }}>
                <TextField
                  fullWidth
                  sx={{ flex: 1 }}
                  label="Full Name"
                  value={form.fullname}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, fullname: e.target.value })}
                  required
                  placeholder="Enter student's full name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PeopleIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: '8px',
                        '&:hover fieldset': { borderColor: '#667eea' },
                        '&.Mui-focused fieldset': { borderColor: '#667eea' },
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  sx={{ flex: 1 }}
                  label="Student ID"
                  value={form.studentId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, studentId: e.target.value })}
                  required
                  placeholder="e.g., STU001"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: '8px',
                        '&:hover fieldset': { borderColor: '#667eea' },
                        '&.Mui-focused fieldset': { borderColor: '#667eea' },
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 2 }}>
                <TextField
                  fullWidth
                  sx={{ flex: 1 }}
                  label="Course"
                  value={form.course}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, course: e.target.value })}
                  required
                  placeholder="e.g., Computer Science"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: '8px',
                        '&:hover fieldset': { borderColor: '#667eea' },
                        '&.Mui-focused fieldset': { borderColor: '#667eea' },
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  sx={{ flex: 1 }}
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="student@example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: '8px',
                        '&:hover fieldset': { borderColor: '#667eea' },
                        '&.Mui-focused fieldset': { borderColor: '#667eea' },
                      },
                    },
                  }}
                />
              </Box>

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={form.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="Enter a secure password"
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: '8px',
                      '&:hover fieldset': { borderColor: '#667eea' },
                      '&.Mui-focused fieldset': { borderColor: '#667eea' },
                    },
                  },
                }}
              />

              {/* Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                <Button
                  onClick={() => router.back()}
                  variant="outlined"
                  sx={{
                    flex: 1,
                    borderColor: '#ccc',
                    color: '#666',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    '&:hover': {
                      borderColor: '#999',
                      backgroundColor: 'rgba(0,0,0,0.02)',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={creating}
                  startIcon={<PersonAddIcon />}
                  sx={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    py: 1.3,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {creating ? 'Creating...' : '+ Create Student'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
