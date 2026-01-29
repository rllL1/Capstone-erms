'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { archiveTeacher, restoreTeacher } from './actions';
import type { Profile } from '@/types/database';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import ArchiveIcon from '@mui/icons-material/Archive';
import RestoreIcon from '@mui/icons-material/Restore';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface TeacherTableProps {
  teachers: (Profile & { email?: string })[];
}

export default function TeacherTable({ teachers }: TeacherTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const router = useRouter();

  async function handleArchive(teacherId: string) {
    if (!confirm('Are you sure you want to archive this teacher account?')) {
      return;
    }

    setLoadingId(teacherId);
    setError(null);

    const result = await archiveTeacher(teacherId);

    if (result.error) {
      setError(result.error);
    }

    setLoadingId(null);
  }

  async function handleRestore(teacherId: string) {
    setLoadingId(teacherId);
    setError(null);

    const result = await restoreTeacher(teacherId);

    if (result.error) {
      setError(result.error);
    }

    setLoadingId(null);
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const totalPages = Math.ceil(teachers.length / rowsPerPage);
  const paginatedTeachers = teachers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box sx={{ mt: 4 }}>
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

      <Card sx={{
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.5)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
      }}>
        {/* Header with Create Button */}
        <CardContent sx={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Stack direction="row" alignItems="center" gap={2}>
            <PersonIcon sx={{ fontSize: 32, color: '#667eea' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>Teacher Records</Typography>
              <Typography variant="body2" sx={{ color: '#999', mt: 0.5 }}>
                {teachers.length} total teacher{teachers.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => router.push('/admin/teacher/create')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
              px: 3,
              '&:hover': {
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              },
            }}
          >
            + Create Teacher
          </Button>
        </CardContent>

        {/* Table or Empty State */}
        {teachers.length === 0 ? (
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <PersonIcon sx={{ fontSize: 60, color: '#ddd', mb: 1 }} />
            </Box>
            <Typography variant="body1" sx={{ color: '#999', mb: 1 }}>No teacher accounts found</Typography>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Create your first teacher account above</Typography>
          </CardContent>
        ) : (
          <Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <BadgeIcon sx={{ fontSize: 18 }} />
                        Employee ID
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      Full Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <SchoolIcon sx={{ fontSize: 18 }} />
                        Department
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <EmailIcon sx={{ fontSize: 18 }} />
                        Email
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      Status
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTeachers.map((teacher, index) => (
                    <TableRow
                      key={teacher.id}
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        '&:hover': {
                          backgroundColor: '#f0f4ff',
                          transition: 'background-color 0.2s ease',
                        },
                        borderBottom: '1px solid #e5e7eb',
                      }}
                    >
                      <TableCell sx={{ color: '#667eea', fontWeight: 600 }}>
                        {teacher.employee_id || '-'}
                      </TableCell>
                      <TableCell sx={{ color: '#333', fontWeight: 500 }}>
                        {teacher.fullname || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: '#666' }}>
                        {teacher.department || '-'}
                      </TableCell>
                      <TableCell sx={{ color: '#666' }}>
                        {teacher.email || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={teacher.status === 'archived' ? 'Archived' : 'Active'}
                          color={teacher.status === 'archived' ? 'default' : 'success'}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            borderRadius: '6px',
                            ...(teacher.status === 'archived' && {
                              backgroundColor: '#f3f4f6',
                              color: '#999',
                              border: '1px solid #e5e7eb',
                            }),
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {teacher.status === 'archived' ? (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<RestoreIcon />}
                              onClick={() => handleRestore(teacher.id)}
                              disabled={loadingId === teacher.id}
                              sx={{
                                borderColor: '#4caf50',
                                color: '#4caf50',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '0.85rem',
                                '&:hover': {
                                  backgroundColor: 'rgba(76, 175, 80, 0.08)',
                                  borderColor: '#4caf50',
                                },
                              }}
                            >
                              Restore
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ArchiveIcon />}
                              onClick={() => handleArchive(teacher.id)}
                              disabled={loadingId === teacher.id}
                              sx={{
                                borderColor: '#ff9800',
                                color: '#ff9800',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '0.85rem',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 152, 0, 0.08)',
                                  borderColor: '#ff9800',
                                },
                              }}
                            >
                              Archive
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Custom Pagination */}
            <Box sx={{
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #e5e7eb',
              p: 3,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                renderItem={(item) => (
                  <PaginationItem
                    slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                    {...item}
                    sx={{
                      color: '#667eea',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      mx: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                      },
                    }}
                  />
                )}
              />
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
}
