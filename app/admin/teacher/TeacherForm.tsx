'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTeacher } from './actions';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import CloseIcon from '@mui/icons-material/Close';

interface TeacherFormProps {
  isCreatePage?: boolean;
}

export default function TeacherForm({ isCreatePage = false }: TeacherFormProps) {
  const [isOpen, setIsOpen] = useState(isCreatePage);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await createTeacher(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setSuccess(true);
      if (isCreatePage) {
        // Auto-redirect after success on create page
        setTimeout(() => {
          router.push('/admin/teacher');
          router.refresh();
        }, 1500);
      } else {
        // Just close form on inline mode
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
        }, 2000);
      }
    }
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Success Message */}
      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: '8px',
            border: '1px solid #4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
          }}
        >
          Teacher account created successfully!
        </Alert>
      )}

      {/* Toggle Button - Only show when form is closed */}
      {!isOpen && (
        <Card sx={{
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.5)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          p: 3,
        }}>
          <Stack direction="row" spacing={3} alignItems="center">
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
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 0.5 }}>Create New Teacher</Typography>
              <Typography variant="body2" sx={{ color: '#999', mb: 2 }}>Add a new teacher account to the system</Typography>
              <Button
                onClick={() => setIsOpen(true)}
                variant="contained"
                startIcon={<PersonAddIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                + Create Teacher
              </Button>
            </Box>
          </Stack>
        </Card>
      )}

      {/* Form - Show when open */}
      {isOpen && (
        <Card sx={{
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.5)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>Create New Teacher Account</Typography>
                <Typography variant="body2" sx={{ color: '#999', mt: 0.5 }}>Fill in the details to add a new teacher</Typography>
              </Box>
              <IconButton
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                }}
                sx={{ color: '#999', '&:hover': { color: '#333' } }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>

            {/* Error Message */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: '8px',
                  border: '1px solid #ff6b6b',
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" action={handleSubmit}>
              <Stack spacing={2.5}>
                <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    sx={{ flex: 1 }}
                    name="employee_id"
                    label="Employee ID"
                    required
                    placeholder="e.g., EMP-001"
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
                  <TextField
                    fullWidth
                    sx={{ flex: 1 }}
                    name="fullname"
                    label="Full Name"
                    required
                    placeholder="e.g., John Doe"
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
                    name="department"
                    label="Department"
                    required
                    placeholder="e.g., Mathematics"
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
                    name="email"
                    type="email"
                    label="Email Address"
                    required
                    placeholder="e.g., john@school.edu"
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
                  name="password"
                  type="password"
                  label="Password"
                  required
                  inputProps={{ minLength: 6 }}
                  placeholder="Minimum 6 characters"
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

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      setError(null);
                    }}
                    variant="outlined"
                    sx={{
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
                    disabled={isLoading}
                    startIcon={<PersonAddIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '8px',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      px: 3,
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isLoading ? 'Creating...' : '+ Create Teacher'}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
