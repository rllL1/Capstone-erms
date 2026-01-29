"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';

interface FinalGrade {
  id: string;
  subject: string;
  term: string;
  academic_year: string;
  quiz_average: number;
  assignment_average: number;
  exam_average: number;
  quiz_weight: number;
  assignment_weight: number;
  exam_weight: number;
  final_grade: number;
  letter_grade: string;
  remarks: string;
}

function getLetterGradeColor(letterGrade: string) {
  switch (letterGrade) {
    case 'A':
      return '#10B981'; // Green
    case 'B':
      return '#3B82F6'; // Blue
    case 'C':
      return '#F59E0B'; // Amber
    case 'D':
      return '#EF4444'; // Red
    case 'F':
      return '#6B7280'; // Gray
    default:
      return '#6B7280';
  }
}

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<FinalGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setError('Not authenticated. Please log in.');
          setLoading(false);
          return;
        }

        // Fetch final grades for this student
        const { data: finalGradesData, error: gradesError } = await supabase
          .from('final_grades')
          .select('*')
          .eq('student_id', user.id)
          .order('academic_year', { ascending: false })
          .order('term', { ascending: false });

        if (gradesError) throw gradesError;

        if (!finalGradesData || finalGradesData.length === 0) {
          setGrades([]);
          setLoading(false);
          return;
        }

        setGrades(finalGradesData);
        
        // Set selected term to the first available term
        if (finalGradesData.length > 0) {
          setSelectedTerm(`${finalGradesData[0].term} - ${finalGradesData[0].academic_year}`);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load grades');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  // Get unique terms
  const uniqueTerms = Array.from(
    new Set(grades.map((g) => `${g.term} - ${g.academic_year}`))
  ).sort();

  // Filter grades by selected term
  const filteredGrades = selectedTerm
    ? grades.filter((g) => `${g.term} - ${g.academic_year}` === selectedTerm)
    : grades;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', blockSize: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Final Grades</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {grades.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="textSecondary">
              No grades available yet. Grades will appear here once your teachers input them.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Term Filter */}
          {uniqueTerms.length > 1 && (
            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {uniqueTerms.map((term) => (
                <Chip
                  key={term}
                  label={term}
                  onClick={() => setSelectedTerm(term)}
                  color={selectedTerm === term ? 'primary' : 'default'}
                  variant={selectedTerm === term ? 'filled' : 'outlined'}
                  sx={
                    selectedTerm === term
                      ? { bgcolor: '#8B5CF6', color: '#fff' }
                      : {}
                  }
                />
              ))}
            </Box>
          )}

          {/* Grades Summary Card */}
          {filteredGrades.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
                  Summary: {selectedTerm}
                </Typography>

                <Grid container spacing={2}>
                  {filteredGrades.map((grade) => (
                    <Grid item xs={12} sm={6} md={4} key={grade.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {grade.subject}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                              {grade.final_grade.toFixed(2)}
                            </Typography>
                            <Chip
                              label={grade.letter_grade}
                              sx={{
                                bgcolor: getLetterGradeColor(grade.letter_grade),
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                              }}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={grade.final_grade}
                            sx={{ mb: 1 }}
                          />
                          {grade.remarks && (
                            <Typography variant="caption" color="textSecondary">
                              {grade.remarks}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Detailed Grades Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
                Detailed Grades
              </Typography>

              {filteredGrades.length === 0 ? (
                <Typography color="textSecondary">
                  No grades available for this term.
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F3F4F6' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Quiz Avg</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Assignment Avg</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Exam Avg</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Final Grade</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Grade</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredGrades.map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell sx={{ fontWeight: 500 }}>{grade.subject}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Typography variant="body2">{grade.quiz_average.toFixed(2)}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                ({grade.quiz_weight}%)
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Typography variant="body2">{grade.assignment_average.toFixed(2)}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                ({grade.assignment_weight}%)
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Typography variant="body2">{grade.exam_average.toFixed(2)}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                ({grade.exam_weight}%)
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                              {grade.final_grade.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={grade.letter_grade}
                              size="small"
                              sx={{
                                bgcolor: getLetterGradeColor(grade.letter_grade),
                                color: '#fff',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
