'use client';


import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, Typography, Box, Grid, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';
import GroupsIcon from '@mui/icons-material/Groups';


export default function StudentDashboard() {
  // Profile/overview
  const [profile, setProfile] = useState<{ fullname: string; student_id: string; term?: string } | null>(null);
  // Classes
  const [classes, setClasses] = useState<{ name: string; description: string; studentCount: number; assignmentCount: number }[]>([]);
  // Quizzes
  const [quizzes, setQuizzes] = useState<{ id: string; title: string; status: string }[]>([]);
  // Exam scores
  const [examScores, setExamScores] = useState<{ type: string; score: number | null }[]>([]);
  // Performance summary
  const [gpa, setGpa] = useState<number | null>(null);
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      const supabase = createClient();
      try {
        // 1. Auth user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('Authentication error. Please log in again.');

        // 2. Profile
        const { data: profileData, error: profileError } = await supabase
          .from('students')
          .select('fullname, student_id, status, term')
          .eq('id', user.id)
          .single();
        if (profileError || !profileData) throw new Error('Student profile not found or not active.');
        if (profileData.status !== 'active') throw new Error('Your account is not active yet.');
        setProfile(profileData);

        // 3. Classes (joined)
        // TODO: Replace with actual join table if available
        const { data: classData } = await supabase
          .from('student_classes')
          .select('class:class_id(name,description), assignment_count, student_count')
          .eq('student_id', user.id);
        setClasses((classData || []).map((c: any) => ({
          name: c.class?.name || 'Class',
          description: c.class?.description || '',
          studentCount: c.student_count || 0,
          assignmentCount: c.assignment_count || 0,
        })));

        // 4. Quizzes (available to take)
        const { data: quizData } = await supabase
          .from('quizzes')
          .select('id, title, status')
          .eq('is_active', true);
        setQuizzes(quizData || []);

        // 5. Exam scores (Prelim, Midterm, Final)
        const { data: examData } = await supabase
          .from('examination_scores')
          .select('type, score')
          .eq('student_id', user.id);
        setExamScores(examData || []);

        // 6. Performance summary (GPA)
        const { data: gpaData } = await supabase
          .from('student_gpa')
          .select('gpa')
          .eq('student_id', user.id)
          .single();
        setGpa(gpaData?.gpa ?? null);

        setIsLoading(false);
      } catch (err: any) {
        setFetchError(err.message || 'Failed to load dashboard.');
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // --- UI ---
  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Error State */}
      {fetchError && (
        <Card sx={{ bgcolor: '#FEE2E2', border: '2px solid #DC2626', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#B91C1C', fontWeight: 600, mb: 2 }}>
              🚨 Dashboard Error
            </Typography>
            <Typography variant="body2" sx={{ color: '#7F1D1D', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.95rem' }}>
              {fetchError}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !fetchError && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress color="secondary" />
          <Typography variant="h6" sx={{ color: '#6B7280', mt: 2 }}>
            Loading your dashboard...
          </Typography>
        </Box>
      )}

      {/* Main Dashboard Content */}
      {!isLoading && !fetchError && (
        <>
          {/* Overview */}
          <Card sx={{ mb: 3, bgcolor: '#F3E8FF', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                    {profile?.fullname || 'Student'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                    Student ID: <b>{profile?.student_id || 'N/A'}</b>
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                    Term: <b>{profile?.term || 'N/A'}</b>
                  </Typography>
                </Box>
                <DashboardIcon sx={{ fontSize: 60, color: '#8B5CF6', alignSelf: 'center' }} />
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Joined Classes */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ClassIcon sx={{ fontSize: 30, color: '#8B5CF6', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                      Joined Classes
                    </Typography>
                  </Box>
                  {classes.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      You haven&apos;t joined any classes yet.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {classes.map((c, idx) => (
                        <Card key={idx} sx={{ mb: 1, bgcolor: '#F9FAFB', p: 1 }} elevation={0}>
                          <CardContent sx={{ py: 1, px: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{c.name}</Typography>
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>{c.description}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip label={`${c.studentCount} students`} size="small" />
                              <Chip label={`${c.assignmentCount} assignments`} size="small" />
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Online Quizzes */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentIcon sx={{ fontSize: 30, color: '#F59E0B', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                      Online Quizzes
                    </Typography>
                  </Box>
                  {quizzes.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      No online quizzes available.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {quizzes.map((q) => (
                        <Card key={q.id} sx={{ mb: 1, bgcolor: '#FEF3C7', p: 1 }} elevation={0}>
                          <CardContent sx={{ py: 1, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{q.title}</Typography>
                            <Button variant="contained" size="small" color="warning" disabled={q.status !== 'open'} sx={{ ml: 2, textTransform: 'none' }}>
                              {q.status === 'open' ? 'Take Quiz' : 'Closed'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Exam Scores */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', mt: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <GradeIcon sx={{ fontSize: 30, color: '#3B82F6', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                      Examination Scores
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                    (Prelim, Midterm, Final — view only. Exams are offline, scores are teacher-recorded.)
                  </Typography>
                  {examScores.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      No examination scores yet.
                    </Typography>
                  ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ mt: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {['Prelim', 'Midterm', 'Final'].map((type) => {
                            const found = examScores.find((e) => e.type?.toLowerCase() === type.toLowerCase());
                            return (
                              <TableRow key={type}>
                                <TableCell>{type}</TableCell>
                                <TableCell>{found?.score != null ? found.score : 'N/A'}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Summary */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', mt: 3, bgcolor: '#F3E8FF' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                        Performance Summary (GPA)
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                        {gpa != null ? gpa.toFixed(2) : 'N/A'}
                      </Typography>
                    </Box>
                    <DashboardIcon sx={{ fontSize: 60, color: '#8B5CF6' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center' }}>
            Exams are offline. Students can only take online quizzes. All data shown is for your account only.
          </Typography>
        </>
      )}
    </Box>
  );
}
