'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import GradeIcon from '@mui/icons-material/Grade';

export default function StudentGrades() {
  const [grades, setGrades] = useState<{
    subject: string;
    teacher: string;
    term: string;
    score: number;
    grade: string;
    remarks: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [gpa, setGpa] = useState<number>(0);

  useEffect(() => {
    const fetchGrades = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // TODO: Fetch actual grades when database tables are ready
        // For now, showing placeholder
        setGrades([]);
        setGpa(0);
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'success';
    if (grade === 'B' || grade === 'B+') return 'info';
    if (grade === 'C' || grade === 'C+') return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
        My Grades
      </Typography>
      <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
        View all your grades and academic performance
      </Typography>

      {/* GPA Card */}
      <Card sx={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', mb: 3, bgcolor: '#F3E8FF' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                Current GPA
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                {gpa > 0 ? gpa.toFixed(2) : 'N/A'}
              </Typography>
            </Box>
            <GradeIcon sx={{ fontSize: 60, color: '#8B5CF6' }} />
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Loading...
        </Typography>
      ) : grades.length === 0 ? (
        <Card sx={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <GradeIcon sx={{ fontSize: 80, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
              No Grades Yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Your grades will appear here once your teacher inputs them.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Subject/Class</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Teacher</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Quarter/Term</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grades.map((grade, index) => (
                    <TableRow key={index}>
                      <TableCell>{grade.subject}</TableCell>
                      <TableCell>{grade.teacher}</TableCell>
                      <TableCell>{grade.term}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {grade.score}%
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={grade.grade} 
                          size="small"
                          color={getGradeColor(grade.grade) as 'success' | 'info' | 'warning' | 'error'}
                        />
                      </TableCell>
                      <TableCell>{grade.remarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
