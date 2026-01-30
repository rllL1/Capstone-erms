"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from '@mui/material/Pagination';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

type Student = {
  id: string;
  student_id: string;
  fullname: string;
  course: string;
  email: string;
  status: string;
  created_at?: string;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [courses, setCourses] = useState<Array<{ name: string; id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/students');
      if (!res.ok) throw new Error('Unable to load students');
      const data = await res.json();
      setStudents(data.students || []);
      setCourses(data.courses || []);
      if ((data.students || []).length === 0) {
        // empty response handled in UI
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to load students';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Derived filtered students
  const filteredStudents = (students || []).filter((s) => {
    const q = query.trim().toLowerCase();
    if (q) {
      return (
        s.fullname.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }
    if (selectedCourse) return s.course === selectedCourse;
    return true;
  });

  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / rowsPerPage));
  const paged = filteredStudents.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleCreateClick = () => {
    router.push('/admin/students/create');
  };

  return (
    <Box sx={{ minHeight: 'auto', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', p: 3 }}>
      {/* Header Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        borderRadius: '16px',
        p: { xs: 2, sm: 3, lg: 4 },
        mb: 4,
        color: 'white',
        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <PeopleIcon sx={{ fontSize: { xs: 28, lg: 36 } }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.75rem', lg: '2.125rem' } }}>Student Management</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Manage and create student accounts</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              aria-label="refresh"
              onClick={() => { setQuery(''); setSelectedCourse(''); setPage(1); router.refresh(); }}
              sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)', transform: 'rotate(180deg)' }, transition: 'all 0.3s ease' }}
            >
              <RefreshIcon sx={{ fontSize: { xs: 24, lg: 28 } }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {loading && (
        <Card sx={{ p: 3, textAlign: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
          <Typography sx={{ color: '#667eea', fontWeight: 600 }}>Loading students...</Typography>
        </Card>
      )}
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
          Unable to load students
        </Alert>
      )}

      {!loading && students && (
        <Card sx={{
          mb: 4,
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #E5E7EB',
          background: '#FFFFFF',
        }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ flex: 1, width: '100%' }}>
                <TextField
                  placeholder="Search by name, id or email"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  size="small"
                  sx={{
                    flex: 1,
                    minWidth: '240px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    '&:hover fieldset': {
                      borderColor: '#8B5CF6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8B5CF6',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#8B5CF6' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl size="small" sx={{ minWidth: '200px', flex: 1 }}>
                <InputLabel sx={{ '&.Mui-focused': { color: '#8B5CF6' } }}>Course</InputLabel>
                <Select
                  label="Course"
                  value={selectedCourse}
                  onChange={(e) => { setSelectedCourse(e.target.value); setPage(1); }}
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E5E7EB',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#8B5CF6',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#8B5CF6',
                    },
                  }}
                >
                  <MenuItem value="">All Courses</MenuItem>
                  {courses.map((c) => (
                    <MenuItem key={c.name || c.id} value={c.name}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              </Stack>

              <Button
                onClick={handleCreateClick}
                variant="contained"
                startIcon={<PersonAddIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  borderRadius: '8px',
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                + Create Student
              </Button>
            </Stack>

            {filteredStudents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PeopleIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#999', fontWeight: 500 }}>No students match your search</Typography>
                <Typography variant="body2" sx={{ color: '#bbb', mt: 1 }}>Try adjusting your filters or search terms</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid #8B5CF6' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#8B5CF6' }}>Student ID</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#8B5CF6' }}>Full Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#8B5CF6' }}>Course</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#8B5CF6' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#8B5CF6' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paged.map((s, index) => (
                        <TableRow
                          key={s.id}
                          sx={{
                            backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                            '&:hover': {
                              backgroundColor: '#F5F3FF',
                              transition: 'all 0.2s ease',
                            },
                            borderBottom: '1px solid #E5E7EB',
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600, color: '#333' }}>
                            <Chip
                              icon={<BadgeIcon />}
                              label={s.student_id}
                              variant="outlined"
                              size="small"
                              sx={{ borderColor: '#8B5CF6', color: '#8B5CF6' }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#1F2937', fontWeight: 500 }}>{s.fullname}</TableCell>
                          <TableCell sx={{ color: '#6B7280' }}>
                            <Chip icon={<SchoolIcon />} label={s.course} size="small" variant="outlined" sx={{ borderColor: '#E9D5FF', color: '#8B5CF6' }} />
                          </TableCell>
                          <TableCell sx={{ color: '#6B7280' }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <EmailIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
                              <Typography variant="body2" sx={{ color: '#6B7280' }}>{s.email}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={s.status === 'active' ? <CheckCircleIcon /> : <CancelIcon />}
                              label={s.status}
                              size="small"
                              color={s.status === 'active' ? 'success' : 'default'}
                              variant="filled"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>

                <Stack alignItems="center" sx={{ mt: 3 }}>
                  <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(_, v) => setPage(v)}
                    color="primary"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: '8px',
                      },
                    }}
                  />
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Spacer */}
    </Box>
  );
}
