import { createAdminClient } from '@/lib/supabase/admin';
import ApprovalActions from './ApprovalActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

export default async function AdminAssessmentPage() {
  const supabase = createAdminClient();

  // Fetch all assessments
  const { data: assessments, error: assessmentsError } = await supabase
    .from('assessments')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch all examinations
  const { data: examinations, error: examinationsError } = await supabase
    .from('examinations')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch all teacher profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, fullname, email, role')
    .eq('role', 'teacher');

  // Create a map of teacher profiles for easy lookup
  const teacherMap = new Map(profiles?.map(p => [p.id, p]) || []);

  // Enrich assessments with teacher info
  const allAssessments = (assessments || []).map(assessment => ({
    ...assessment,
    teacher: teacherMap.get(assessment.teacher_id)
  }));

  // Enrich examinations with teacher info
  const allExams = (examinations || []).map(exam => ({
    ...exam,
    teacher: teacherMap.get(exam.teacher_id)
  }));

  // Stats
  const totalItems = allAssessments.length + allExams.length;
  const pendingExams = allExams.filter((e) => e.status === 'pending').length;
  const approvedExams = allExams.filter((e) => e.status === 'approved').length;
  const rejectedExams = allExams.filter((e) => e.status === 'rejected').length;
  const publishedAssessments = allAssessments.filter((a) => a.status === 'published').length;

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', p: 3 }}>
      {/* Header Section */}
      <Box sx={{
        background: '#ffffff',
        borderRadius: '12px',
        p: 3,
        mb: 4,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #f0f0f0',
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <AssessmentIcon sx={{ fontSize: 40, color: '#667eea' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#333' }}>Assessment Management</Typography>
            <Typography variant="body2" sx={{ color: '#999', mt: 0.5 }}>View and manage all assessments, quizzes, assignments, and examinations</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Pending Examinations Alert */}
      {pendingExams > 0 && (
        <Alert
          icon={<WarningIcon />}
          severity="warning"
          sx={{
            mb: 4,
            borderRadius: '8px',
            border: '1px solid #fce4c4',
            backgroundColor: '#fffbf0',
            color: '#856404',
            '& .MuiAlert-message': {
              ml: 1,
            },
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {pendingExams} Examination{pendingExams > 1 ? 's' : ''} Awaiting Approval
          </Typography>
          <Typography variant="body2">
            Review and approve examinations before they can be published to students.
          </Typography>
        </Alert>
      )}

      {/* Examinations (Require Approval) */}
      <Card sx={{
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #f0f0f0',
        background: '#ffffff',
        mb: 4,
        overflow: 'hidden',
      }}>
        <CardContent sx={{
          background: '#ffffff',
          borderBottom: '1px solid #f0f0f0',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <TaskAltIcon sx={{ fontSize: 32, color: '#667eea' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>Examinations (Require Approval)</Typography>
            <Typography variant="body2" sx={{ color: '#999', mt: 0.5 }}>Prelim, Midterm, and Finals examinations require admin approval</Typography>
          </Box>
        </CardContent>

        {allExams.length === 0 ? (
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <AssessmentIcon sx={{ fontSize: 60, color: '#e8e8e8', mb: 1 }} />
            <Typography variant="body1" sx={{ color: '#bbb', mb: 1 }}>No examinations created yet</Typography>
          </CardContent>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#fafbfc', borderBottom: '1px solid #f0f0f0' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Teacher</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Questions</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allExams.map((exam, index) => (
                  <TableRow
                    key={exam.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                      '&:hover': {
                        backgroundColor: '#f5f6f8',
                        transition: 'background-color 0.2s ease',
                      },
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={exam.exam_type?.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: '6px',
                          backgroundColor:
                            exam.exam_type === 'prelim'
                              ? '#e8f5e9'
                              : exam.exam_type === 'midterm'
                              ? '#fff8e1'
                              : '#ffebee',
                          color:
                            exam.exam_type === 'prelim'
                              ? '#66bb6a'
                              : exam.exam_type === 'midterm'
                              ? '#ffa726'
                              : '#ef5350',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#333', fontWeight: 500 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{exam.title}</Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>{exam.year_level} - {exam.semester}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#666' }}>
                      <Typography variant="body2">{exam.teacher?.fullname}</Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>{exam.teacher?.email}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#666' }}>{exam.subject}</TableCell>
                    <TableCell sx={{ color: '#666' }}>{exam.questions?.length || 0} questions</TableCell>
                    <TableCell>
                      <Chip
                        label={exam.status?.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: '6px',
                          backgroundColor:
                            exam.status === 'pending'
                              ? '#fff8e1'
                              : exam.status === 'approved'
                              ? '#e8f5e9'
                              : '#ffebee',
                          color:
                            exam.status === 'pending'
                              ? '#ffa726'
                              : exam.status === 'approved'
                              ? '#66bb6a'
                              : '#ef5350',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <ApprovalActions examination={exam} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Assessments (Auto-approved - Monitoring) */}
      <Card sx={{
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #f0f0f0',
        background: '#ffffff',
        overflow: 'hidden',
      }}>
        <CardContent sx={{
          background: '#ffffff',
          borderBottom: '1px solid #f0f0f0',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <CheckCircleIcon sx={{ fontSize: 32, color: '#667eea' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>Assessments (Auto-approved)</Typography>
            <Typography variant="body2" sx={{ color: '#999', mt: 0.5 }}>Quizzes and assignments are automatically published - monitoring only</Typography>
          </Box>
        </CardContent>

        {allAssessments.length === 0 ? (
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <AssessmentIcon sx={{ fontSize: 60, color: '#e8e8e8', mb: 1 }} />
            <Typography variant="body1" sx={{ color: '#bbb', mb: 1 }}>No assessments created yet</Typography>
          </CardContent>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#fafbfc', borderBottom: '1px solid #f0f0f0' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Teacher</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Level</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Questions</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allAssessments.map((assessment, index) => (
                  <TableRow
                    key={assessment.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                      '&:hover': {
                        backgroundColor: '#f5f6f8',
                        transition: 'background-color 0.2s ease',
                      },
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <TableCell sx={{ color: '#333', fontWeight: 500 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{assessment.title}</Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>{assessment.description}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#666' }}>
                      <Typography variant="body2">{assessment.teacher?.fullname}</Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>{assessment.teacher?.email}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#666' }}>{assessment.subject}</TableCell>
                    <TableCell sx={{ color: '#666' }}>{assessment.grade_level}</TableCell>
                    <TableCell sx={{ color: '#666' }}>{assessment.questions?.length || 0} questions</TableCell>
                    <TableCell>
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="PUBLISHED"
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: '6px',
                          backgroundColor: '#e8f5e9',
                          color: '#66bb6a',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#666' }}>
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
