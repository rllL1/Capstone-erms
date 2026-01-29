'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

interface DiagnosticInfo {
  authUser: { id: string; email?: string } | null;
  studentRecord: { user_id: string; fullname: string; student_id: string; course: string; status: string } | null;
  groupMembers: { id: string; student_id: string; group_id: string }[];
  assessmentSubmissions: { id: string; assessment_id: string; student_id: string; score?: number }[];
  finalGrades: { id: string; student_id: string; final_grade: number }[];
  errors: { [key: string]: string };
}

export default function StudentDebugPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo>({
    authUser: null,
    studentRecord: null,
    groupMembers: [],
    assessmentSubmissions: [],
    finalGrades: [],
    errors: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const supabase = createClient();
      const errors: { [key: string]: string } = {};

      try {
        // 1. Check auth user
        console.log('1. Checking auth user...');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          errors['auth'] = 'No authenticated user';
        }
        console.log('Auth user:', user);

        // 2. Check student record
        if (user) {
          console.log('2. Checking student record for user:', user.id);
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (studentError) {
            errors['student_record'] = `Error: ${studentError.message}`;
            console.error('Student record error:', studentError);
          }
          console.log('Student record:', studentData);

          // 3. Check group members
          console.log('3. Checking group members for student:', user.id);
          const { data: groupData, error: groupError } = await supabase
            .from('group_members')
            .select('*')
            .eq('student_id', user.id);

          if (groupError) {
            errors['group_members'] = `Error: ${groupError.message}`;
            console.error('Group members error:', groupError);
          }
          console.log('Group members:', groupData);

          // 4. Check assessment submissions
          console.log('4. Checking assessment submissions for student:', user.id);
          const { data: submissionData, error: submissionError } = await supabase
            .from('assessment_submissions')
            .select('*')
            .eq('student_id', user.id)
            .limit(5);

          if (submissionError) {
            errors['submissions'] = `Error: ${submissionError.message}`;
            console.error('Submissions error:', submissionError);
          }
          console.log('Assessment submissions:', submissionData);

          // 5. Check final grades
          console.log('5. Checking final grades for student:', user.id);
          const { data: gradeData, error: gradeError } = await supabase
            .from('final_grades')
            .select('*')
            .eq('student_id', user.id)
            .limit(5);

          if (gradeError) {
            errors['grades'] = `Error: ${gradeError.message}`;
            console.error('Grades error:', gradeError);
          }
          console.log('Final grades:', gradeData);

          setDiagnostics({
            authUser: user ? { id: user.id, email: user.email } : null,
            studentRecord: studentData,
            groupMembers: groupData || [],
            assessmentSubmissions: submissionData || [],
            finalGrades: gradeData || [],
            errors,
          });
        }
      } catch (err: unknown) {
        console.error('Diagnostic error:', err);
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors['general'] = errorMsg;
        setDiagnostics((prev) => ({ ...prev, errors }));
      } finally {
        setLoading(false);
      }
    };

    runDiagnostics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', blockSize: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Student Dashboard Debug
      </Typography>

      {Object.keys(diagnostics.errors).length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Found {Object.keys(diagnostics.errors).length} issue(s) - see details below
        </Alert>
      )}

      {/* Auth User */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Auth User
          </Typography>
          {diagnostics.errors['auth'] ? (
            <Alert severity="error">{diagnostics.errors['auth']}</Alert>
          ) : (
            <Box component="pre" sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, overflow: 'auto' }}>
              {JSON.stringify(diagnostics.authUser, null, 2)}
            </Box>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 2 }} />

      {/* Student Record */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Student Record (students table)
          </Typography>
          {diagnostics.errors['student_record'] ? (
            <Alert severity="error">{diagnostics.errors['student_record']}</Alert>
          ) : diagnostics.studentRecord ? (
            <Box component="pre" sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, overflow: 'auto' }}>
              {JSON.stringify(diagnostics.studentRecord, null, 2)}
            </Box>
          ) : (
            <Alert severity="warning">No student record found</Alert>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 2 }} />

      {/* Group Members */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Group Members ({diagnostics.groupMembers.length})
          </Typography>
          {diagnostics.errors['group_members'] ? (
            <Alert severity="error">{diagnostics.errors['group_members']}</Alert>
          ) : diagnostics.groupMembers.length === 0 ? (
            <Alert severity="info">No group memberships found</Alert>
          ) : (
            <Box component="pre" sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, overflow: 'auto', maxBlockSize: 300 }}>
              {JSON.stringify(diagnostics.groupMembers, null, 2)}
            </Box>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 2 }} />

      {/* Assessment Submissions */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Assessment Submissions ({diagnostics.assessmentSubmissions.length})
          </Typography>
          {diagnostics.errors['submissions'] ? (
            <Alert severity="error">{diagnostics.errors['submissions']}</Alert>
          ) : diagnostics.assessmentSubmissions.length === 0 ? (
            <Alert severity="info">No submissions found</Alert>
          ) : (
            <Box component="pre" sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, overflow: 'auto', maxBlockSize: 300 }}>
              {JSON.stringify(diagnostics.assessmentSubmissions, null, 2)}
            </Box>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 2 }} />

      {/* Final Grades */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Final Grades ({diagnostics.finalGrades.length})
          </Typography>
          {diagnostics.errors['grades'] ? (
            <Alert severity="error">{diagnostics.errors['grades']}</Alert>
          ) : diagnostics.finalGrades.length === 0 ? (
            <Alert severity="info">No grades found</Alert>
          ) : (
            <Box component="pre" sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, overflow: 'auto', maxBlockSize: 300 }}>
              {JSON.stringify(diagnostics.finalGrades, null, 2)}
            </Box>
          )}
        </CardContent>
      </Card>

      <Typography variant="body2" sx={{ color: '#6B7280', mt: 3 }}>
        Open browser console to see detailed logs
      </Typography>
    </Box>
  );
}
