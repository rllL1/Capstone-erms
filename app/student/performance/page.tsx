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

interface ScoreData {
  subject: string;
  quizzes: { title: string; score: number; max_score: number; date: string }[];
  assignments: { title: string; score: number; max_score: number; date: string }[];
  exams: {
    prelim?: { score: number; max_score: number; date: string };
    midterm?: { score: number; max_score: number; date: string };
    final?: { score: number; max_score: number; date: string };
  };
}

function getGradeColor(percentage: number) {
  if (percentage >= 90) return '#10B981'; // A - Green
  if (percentage >= 80) return '#3B82F6'; // B - Blue
  if (percentage >= 70) return '#F59E0B'; // C - Amber
  if (percentage >= 60) return '#EF4444'; // D - Red
  return '#6B7280'; // F - Gray
}

function getLetterGrade(percentage: number) {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

export default function StudentPerformancePage() {
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
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

        // Fetch group members to get student's classes
        const { data: groupMembers, error: memberError } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('student_id', user.id);

        if (memberError) throw memberError;

        if (!groupMembers || groupMembers.length === 0) {
          setScores([]);
          setLoading(false);
          return;
        }

        const groupIds = groupMembers.map((m) => m.group_id);

        // Fetch groups info
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('id, subject')
          .in('id', groupIds);

        if (groupsError) throw groupsError;

        // Fetch quiz submissions
        const { data: quizSubmissions, error: quizError } = await supabase
          .from('assessment_submissions')
          .select('assessment_id, score, max_score, submitted_at, assessments(title, group_id)')
          .eq('student_id', user.id);

        if (quizError) throw quizError;

        // Fetch exam grades
        const { data: examGrades, error: examError } = await supabase
          .from('exam_grades')
          .select('exam_name, score, max_score, exam_date')
          .eq('student_id', user.id);

        if (examError) throw examError;

        // Organize data by group/subject
        const scoresMap = new Map<string, ScoreData>();

        // Initialize with groups
        (groupsData || []).forEach((group: any) => {
          scoresMap.set(group.id, {
            subject: group.subject,
            quizzes: [],
            assignments: [],
            exams: {},
          });
        });

        // Add quiz submissions
        (quizSubmissions || []).forEach((sub: any) => {
          const groupId = sub.assessments?.group_id;
          const scoreData = scoresMap.get(groupId);
          if (scoreData) {
            scoreData.quizzes.push({
              title: sub.assessments?.title || 'Quiz',
              score: sub.score,
              max_score: sub.max_score,
              date: sub.submitted_at,
            });
          }
        });

        // Add exam grades
        (examGrades || []).forEach((exam: any) => {
          // Try to match exam to subject based on exam name
          scoresMap.forEach((scoreData) => {
            if (!scoreData.exams[exam.exam_name.toLowerCase()]) {
              scoreData.exams[exam.exam_name.toLowerCase()] = {
                score: exam.score,
                max_score: exam.max_score,
                date: exam.exam_date,
              };
            }
          });
        });

        setScores(Array.from(scoresMap.values()));
      } catch (err: any) {
        setError(err?.message || 'Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', blockSize: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Performance</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {scores.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="textSecondary">
              No performance data available yet. Take quizzes and assignments to see your scores.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {scores.map((scoreData, idx) => (
            <Grid item xs={12} key={idx}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#111827' }}>
                    {scoreData.subject}
                  </Typography>

                  {/* Quizzes Section */}
                  {scoreData.quizzes.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                        Quiz Scores
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#F3F4F6' }}>
                              <TableCell sx={{ fontWeight: 600 }}>Quiz</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Score</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Percentage</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Grade</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {scoreData.quizzes.map((quiz, qIdx) => {
                              const percentage = (quiz.score / quiz.max_score) * 100;
                              return (
                                <TableRow key={qIdx}>
                                  <TableCell>{quiz.title}</TableCell>
                                  <TableCell align="center">
                                    {quiz.score.toFixed(2)}/{quiz.max_score}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={percentage}
                                        sx={{ inlineSize: '60%', mr: 1 }}
                                      />
                                      <Typography variant="body2">{percentage.toFixed(1)}%</Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      label={getLetterGrade(percentage)}
                                      size="small"
                                      sx={{ bgcolor: getGradeColor(percentage), color: '#fff' }}
                                    />
                                  </TableCell>
                                  <TableCell>{new Date(quiz.date).toLocaleDateString()}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {/* Exam Section */}
                  {(scoreData.exams.prelim || scoreData.exams.midterm || scoreData.exams.final) && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                        Exam Scores
                      </Typography>
                      <Grid container spacing={2}>
                        {scoreData.exams.prelim && (
                          <Grid item xs={12} sm={6} md={4}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                  Preliminary Exam
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                  {scoreData.exams.prelim.score}/{scoreData.exams.prelim.max_score}
                                </Typography>
                                <Box sx={{ mb: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(scoreData.exams.prelim.score / scoreData.exams.prelim.max_score) * 100}
                                  />
                                </Box>
                                <Typography variant="caption" color="textSecondary">
                                  {((scoreData.exams.prelim.score / scoreData.exams.prelim.max_score) * 100).toFixed(1)}%
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {scoreData.exams.midterm && (
                          <Grid item xs={12} sm={6} md={4}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                  Midterm Exam
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                  {scoreData.exams.midterm.score}/{scoreData.exams.midterm.max_score}
                                </Typography>
                                <Box sx={{ mb: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(scoreData.exams.midterm.score / scoreData.exams.midterm.max_score) * 100}
                                  />
                                </Box>
                                <Typography variant="caption" color="textSecondary">
                                  {((scoreData.exams.midterm.score / scoreData.exams.midterm.max_score) * 100).toFixed(1)}%
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {scoreData.exams.final && (
                          <Grid item xs={12} sm={6} md={4}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                  Final Exam
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                  {scoreData.exams.final.score}/{scoreData.exams.final.max_score}
                                </Typography>
                                <Box sx={{ mb: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(scoreData.exams.final.score / scoreData.exams.final.max_score) * 100}
                                  />
                                </Box>
                                <Typography variant="caption" color="textSecondary">
                                  {((scoreData.exams.final.score / scoreData.exams.final.max_score) * 100).toFixed(1)}%
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}

                  {scoreData.quizzes.length === 0 && Object.keys(scoreData.exams).length === 0 && (
                    <Typography color="textSecondary">
                      No score data available for this subject yet.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
