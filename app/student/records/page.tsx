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
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function StudentRecords() {
  const [records, setRecords] = useState<{
    title: string;
    type: string;
    className: string;
    submittedAt: string;
    score: number;
    maxScore: number;
    status: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // TODO: Fetch actual records when database tables are ready
        // For now, showing placeholder
        setRecords([]);
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
        Assessment Records
      </Typography>
      <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
        View all your quiz and assignment submissions with scores
      </Typography>

      {loading ? (
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Loading...
        </Typography>
      ) : records.length === 0 ? (
        <Card sx={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <AssignmentIcon sx={{ fontSize: 80, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
              No Records Yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              You haven&apos;t completed any assessments yet.
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
                    <TableCell sx={{ fontWeight: 600 }}>Assessment</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date Submitted</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.title}</TableCell>
                      <TableCell>
                        <Chip 
                          label={record.type} 
                          size="small"
                          color={record.type === 'Quiz' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>{record.className}</TableCell>
                      <TableCell>{record.submittedAt}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {record.score}/{record.maxScore}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={record.status} 
                          size="small"
                          color={record.status === 'Graded' ? 'success' : 'warning'}
                        />
                      </TableCell>
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
