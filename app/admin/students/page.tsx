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
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from '@mui/material/Pagination';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

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
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ fullname: '', studentId: '', course: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
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
    } catch (err: any) {
      setError(err?.message || 'Unable to load students');
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

      setMessage('Student created successfully');
      setForm({ fullname: '', studentId: '', course: '', email: '', password: '' });
      await load();
    } catch (err: any) {
      setMessage(err?.message || 'Failed to create student');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">Students</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton aria-label="refresh" onClick={() => { setQuery(''); setSelectedCourse(''); setPage(1); router.refresh(); }}>
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" onClick={() => router.refresh()}>Refresh</Button>
        </Stack>
      </Stack>

      {loading && <Typography>Loading students...</Typography>}
      {error && <Alert severity="error">Unable to load students</Alert>}

      {!loading && students && (
        <Paper sx={{ p: 2, mb: 4 }} elevation={1}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <TextField
              placeholder="Search by name, id or email"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              size="small"
              sx={{ minWidth: 240 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Course</InputLabel>
              <Select
                label="Course"
                value={selectedCourse}
                onChange={(e) => { setSelectedCourse(e.target.value); setPage(1); }}
              >
                <MenuItem value="">All</MenuItem>
                {courses.map((c) => (
                  <MenuItem key={c.name || c.id} value={c.name}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {filteredStudents.length === 0 ? (
            <Alert severity="info">No students match your search.</Alert>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell>{s.student_id}</TableCell>
                      <TableCell>{s.fullname}</TableCell>
                      <TableCell>{s.course}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Stack alignItems="center" sx={{ mt: 2 }}>
                <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" />
              </Stack>
            </>
          )}
        </Paper>
      )}

      <Paper sx={{ p: 3 }} elevation={1}>
        <Grid container spacing={2} component="form" onSubmit={handleCreate}>
          <Grid item xs={12}>
            <Typography variant="h6">Create Student Account</Typography>
            {message && <Alert sx={{ mb: 2 }}>{message}</Alert>}
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Full name" value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Student ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Course" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" disabled={creating}>{creating ? 'Creating...' : 'Create Student'}</Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
