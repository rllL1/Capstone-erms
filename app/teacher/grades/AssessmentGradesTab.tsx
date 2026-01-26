'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

export default function AssessmentGradesTab() {
  const [assessmentRecords, setAssessmentRecords] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    fetchGroups();
    fetchAssessmentRecords();
  }, []);

  const fetchGroups = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from('groups')
        .select('id, name')
        .eq('teacher_id', user.id)
        .order('name');
      
      if (data) setGroups(data);
    }
  };

  const fetchAssessmentRecords = async () => {
    // TODO: Implement when assessment_submissions table is ready
    setAssessmentRecords([]);
  };

  const filteredRecords = assessmentRecords.filter((record) => {
    const typeMatch = filterType === 'all' || record.type === filterType;
    const groupMatch = filterGroup === 'all' || record.group_id === filterGroup;
    return typeMatch && groupMatch;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
          Quiz & Assignment Records
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            label="Type"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="quiz">Quiz</MenuItem>
            <MenuItem value="assignment">Assignment</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Group/Class</InputLabel>
          <Select
            value={filterGroup}
            label="Group/Class"
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <MenuItem value="all">All Groups</MenuItem>
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filteredRecords.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" sx={{ color: '#6B7280', mb: 2 }}>
            No assessment records found
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            Student submissions will appear here once they complete assessments
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assessment</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Group/Class</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Percentage</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.student_name}</TableCell>
                  <TableCell>{record.assessment_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={record.type}
                      size="small"
                      color={record.type === 'quiz' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>{record.group_name}</TableCell>
                  <TableCell>
                    {record.score}/{record.max_score}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {((record.score / record.max_score) * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell>{record.submitted_at}</TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      size="small"
                      color={record.status === 'graded' ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
