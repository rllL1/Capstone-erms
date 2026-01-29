"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import JoinClassModal from './components/JoinClassModal';

interface Class {
  id: string;
  name: string;
  subject: string;
  teacher_id: string;
  teacher_name: string;
  created_at: string;
}

interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'assignment';
  due_date: string;
  max_score: number;
  submitted: boolean;
  score?: number;
  feedback?: string;
}

function TabPanel(props: { children: React.ReactNode; value: number; index: number } & { [key: string]: unknown }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function StudentClassPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [openJoinModal, setOpenJoinModal] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
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
          setClasses([]);
          setLoading(false);
          return;
        }

        const groupIds = groupMembers.map((m) => m.group_id);

        // Fetch groups with teacher info
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('id, name, subject, teacher_id, created_at, profiles:teacher_id(fullname)')
          .in('id', groupIds);

        if (groupsError) throw groupsError;

        const formattedClasses = (groupsData || []).map((group: { id: string; name: string; subject: string; teacher_id: string; created_at: string; profiles: { fullname: string }[] | { fullname: string } | null }) => ({
          id: group.id,
          name: group.name,
          subject: group.subject,
          teacher_id: group.teacher_id,
          teacher_name: (Array.isArray(group.profiles) ? group.profiles[0]?.fullname : group.profiles?.fullname) || 'Unknown',
          created_at: group.created_at,
        }));

        setClasses(formattedClasses);
        if (formattedClasses.length > 0) {
          setSelectedClass(formattedClasses[0]);
          await fetchAssessments(formattedClasses[0].id, user.id);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to load classes');
        } else {
          setError('Failed to load classes');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const fetchAssessments = async (groupId: string, studentId: string) => {
    setLoadingAssessments(true);
    try {
      const supabase = createClient();

      // Fetch assessments for this group
      const { data: assessmentsData, error: assessError } = await supabase
        .from('assessments')
        .select('id, title, type, due_date, max_score')
        .eq('group_id', groupId);

      if (assessError) throw assessError;

      // Fetch student's submissions
      const { data: submissions, error: subError } = await supabase
        .from('assessment_submissions')
        .select('assessment_id, score, feedback, submitted_at')
        .eq('student_id', studentId)
        .in('assessment_id', (assessmentsData || []).map((a: { id: string }) => a.id));

      if (subError) throw subError;

      const submissionMap = new Map(submissions?.map((s: { assessment_id: string; score?: number; feedback?: string }) => [s.assessment_id, s]) || []);

      const formattedAssessments = (assessmentsData || []).map((assess: { id: string; title: string; type: 'quiz' | 'assignment'; due_date: string; max_score: number }) => ({
        id: assess.id,
        title: assess.title,
        type: assess.type,
        due_date: assess.due_date,
        max_score: assess.max_score,
        submitted: submissionMap.has(assess.id),
        score: submissionMap.get(assess.id)?.score,
        feedback: submissionMap.get(assess.id)?.feedback,
      }));

      setAssessments(formattedAssessments);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load assessments');
      }
    } finally {
      setLoadingAssessments(false);
    }
  };

  const handleSelectClass = async (classItem: Class) => {
    setSelectedClass(classItem);
    setTabValue(0);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await fetchAssessments(classItem.id, user.id);
    }
  };

  const handleJoinSuccess = async () => {
    // Refresh classes list after successful join
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch updated group members
      const { data: groupMembers, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('student_id', user.id);

      if (memberError) throw memberError;

      if (!groupMembers || groupMembers.length === 0) {
        setClasses([]);
        setSelectedClass(null);
        setLoading(false);
        return;
      }

      const groupIds = groupMembers.map((m) => m.group_id);

      // Fetch updated groups with teacher info
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, subject, teacher_id, created_at, profiles:teacher_id(fullname)')
        .in('id', groupIds);

      if (groupsError) throw groupsError;

      const formattedClasses = (groupsData || []).map((group: { id: string; name: string; subject: string; teacher_id: string; created_at: string; profiles: { fullname: string }[] | { fullname: string } | null }) => ({
        id: group.id,
        name: group.name,
        subject: group.subject,
        teacher_id: group.teacher_id,
        teacher_name: (Array.isArray(group.profiles) ? group.profiles[0]?.fullname : group.profiles?.fullname) || 'Unknown',
        created_at: group.created_at,
      }));

      setClasses(formattedClasses);
      // Select the last joined class (most recent)
      if (formattedClasses.length > 0) {
        const newClass = formattedClasses[formattedClasses.length - 1];
        setSelectedClass(newClass);
        await fetchAssessments(newClass.id, user.id);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to refresh classes');
      } else {
        setError('Failed to refresh classes');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', blockSize: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 0, fontWeight: 600 }}>
          Classes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenJoinModal(true)}
          sx={{
            background: 'linear-gradient(to right, #8B5CF6, #6D28D9)',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
          }}
        >
          Join Class
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {classes.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="textSecondary">
              No classes available. Please contact your teacher to join a class.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {classes.map((classItem) => (
            <Box key={classItem.id} sx={{ xs: 1, md: 1/2, display: 'grid', p: 1 }}>
              <Card
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedClass?.id === classItem.id ? '#F3E8FF' : '#FFFFFF',
                  border: selectedClass?.id === classItem.id ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                  transition: 'all 0.3s',
                  '&:hover': { bgcolor: '#F9FAFB' },
                }}
                onClick={() => handleSelectClass(classItem)}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
                    {classItem.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                    <strong>Subject:</strong> {classItem.subject}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    <strong>Teacher:</strong> {classItem.teacher_name}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Grid>
      )}

      {selectedClass && (
        <Card>
          <Box sx={{ borderBlockEnd: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Quizzes" />
              <Tab label="Assignments" />
            </Tabs>
          </Box>

          {loadingAssessments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TabPanel value={tabValue} index={0}>
                {assessments.filter((a) => a.type === 'quiz').length === 0 ? (
                  <Typography color="textSecondary">No quizzes available.</Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F3F4F6' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Quiz Title</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {assessments
                          .filter((a) => a.type === 'quiz')
                          .map((quiz) => (
                            <TableRow key={quiz.id}>
                              <TableCell>{quiz.title}</TableCell>
                              <TableCell>{new Date(quiz.due_date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {quiz.submitted ? `${quiz.score}/${quiz.max_score}` : '-'}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={quiz.submitted ? 'Submitted' : 'Not Submitted'}
                                  color={quiz.submitted ? 'success' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={quiz.submitted}
                                >
                                  {quiz.submitted ? 'View' : 'Take Quiz'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {assessments.filter((a) => a.type === 'assignment').length === 0 ? (
                  <Typography color="textSecondary">No assignments available.</Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F3F4F6' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Assignment Title</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {assessments
                          .filter((a) => a.type === 'assignment')
                          .map((assignment) => (
                            <TableRow key={assignment.id}>
                              <TableCell>{assignment.title}</TableCell>
                              <TableCell>{new Date(assignment.due_date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {assignment.submitted ? `${assignment.score}/${assignment.max_score}` : '-'}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={assignment.submitted ? 'Submitted' : 'Not Submitted'}
                                  color={assignment.submitted ? 'success' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={assignment.submitted}
                                >
                                  {assignment.submitted ? 'View' : 'Submit'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>
            </>
          )}
        </Card>
      )}

      <JoinClassModal
        open={openJoinModal}
        onClose={() => setOpenJoinModal(false)}
        onSuccess={handleJoinSuccess}
      />
    </Box>
  );
}
