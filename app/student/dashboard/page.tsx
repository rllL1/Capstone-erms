'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    totalClasses: 0,
    pendingAssignments: 0,
    completedAssessments: 0,
    averageGrade: 0,
  });
  const [profile, setProfile] = useState<{
    fullname: string;
    student_id: string;
  } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        
        // Step 1: Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        console.log('🔍 Student Dashboard - Auth User:', user);
        console.log('🔍 Student Dashboard - User Error:', userError);
        
        setDebugInfo({
          step: 'auth_check',
          userId: user?.id,
          userEmail: user?.email,
          userError: userError?.message,
        });
        
        if (userError) {
          setFetchError('❌ Authentication Error: ' + userError.message);
          setIsLoading(false);
          return;
        }
        
        if (!user) {
          setFetchError('❌ No authenticated user found. Please log in again.');
          setIsLoading(false);
          return;
        }
        
        // Step 2: Fetch student profile from students table
        const { data: profileData, error: profileError } = await supabase
          .from('students')
          .select('fullname, student_id, status')
          .eq('id', user.id)
          .single();
        
        console.log('🔍 Student Dashboard - Profile Data:', profileData);
        console.log('🔍 Student Dashboard - Profile Error:', profileError);
        
        setDebugInfo((prev: any) => ({
          ...prev,
          step: 'profile_fetch',
          profileData,
          profileError: profileError?.message,
          profileErrorCode: profileError?.code,
          profileErrorDetails: profileError?.details,
        }));
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            setFetchError(
              `❌ Student record not found in database.\n\n` +
              `User ID: ${user.id}\n` +
              `This usually means:\n` +
              `1. Your account was not properly created during signup\n` +
              `2. You need to be approved by an admin\n` +
              `3. The student record is missing from the students table`
            );
          } else if (profileError.message.includes('permission')) {
            setFetchError(
              `❌ Permission Denied (RLS Policy Issue)\n\n` +
              `User ID: ${user.id}\n` +
              `The Row Level Security policy is blocking your access.\n` +
              `Please contact an administrator.`
            );
          } else {
            setFetchError(
              `❌ Database Error: ${profileError.message}\n\n` +
              `Code: ${profileError.code}\n` +
              `Details: ${profileError.details || 'None'}`
            );
          }
          setIsLoading(false);
          return;
        }
        
        if (!profileData) {
          setFetchError(
            `❌ Student record not found.\n\n` +
            `User ID: ${user.id}\n` +
            `Email: ${user.email}\n\n` +
            `Please contact an administrator to create your student profile.`
          );
          setIsLoading(false);
          return;
        }
        
        // Step 3: Check student status
        if (profileData.status !== 'active') {
          setFetchError(
            `⚠️ Account Status: ${profileData.status.toUpperCase()}\n\n` +
            `Your account is not active yet.\n` +
            `Please wait for admin approval or contact an administrator.`
          );
          setIsLoading(false);
          return;
        }
        
        // Success: Set profile data
        setProfile(profileData);
        setStats({
          totalClasses: 0,
          pendingAssignments: 0,
          completedAssessments: 0,
          averageGrade: 0,
        });
        
        setDebugInfo((prev: any) => ({
          ...prev,
          step: 'success',
          profileLoaded: true,
        }));
        
        setIsLoading(false);
        
      } catch (err: any) {
        console.error('🚨 Student Dashboard - Catch Error:', err);
        setFetchError(
          `❌ Unexpected Error: ${err?.message || 'Unknown error'}\n\n` +
          `This might be a network issue or browser problem.\n` +
          `Please check your internet connection and try again.`
        );
        setDebugInfo((prev: any) => ({
          ...prev,
          step: 'catch_error',
          error: err?.message,
          errorStack: err?.stack,
        }));
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Total Classes',
      value: stats.totalClasses,
      icon: <ClassIcon sx={{ fontSize: 40, color: '#8B5CF6' }} />,
      color: '#F3E8FF',
    },
    {
      title: 'Pending Assignments',
      value: stats.pendingAssignments,
      icon: <AssignmentIcon sx={{ fontSize: 40, color: '#F59E0B' }} />,
      color: '#FEF3C7',
    },
    {
      title: 'Completed Assessments',
      value: stats.completedAssessments,
      icon: <DashboardIcon sx={{ fontSize: 40, color: '#10B981' }} />,
      color: '#D1FAE5',
    },
    {
      title: 'Average Grade',
      value: stats.averageGrade > 0 ? `${stats.averageGrade}%` : 'N/A',
      icon: <GradeIcon sx={{ fontSize: 40, color: '#3B82F6' }} />,
      color: '#DBEAFE',
    },
  ];

  return (
    <Box>
      {/* Error Display */}
      {fetchError && (
        <Box sx={{ mb: 3 }}>
          <Card sx={{ bgcolor: '#FEE2E2', border: '2px solid #DC2626' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#B91C1C', fontWeight: 600, mb: 2 }}>
                🚨 Dashboard Access Error
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#7F1D1D', 
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}
              >
                {fetchError}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
      
      {/* Debug Info (only show if there's an error) */}
      {debugInfo && fetchError && (
        <Box sx={{ mb: 3 }}>
          <Card sx={{ bgcolor: '#EFF6FF', border: '1px solid #3B82F6' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#1E40AF', fontWeight: 600, mb: 2 }}>
                🔧 Debug Information
              </Typography>
              <Box 
                component="pre" 
                sx={{ 
                  fontSize: '0.75rem', 
                  color: '#1E3A8A',
                  overflow: 'auto',
                  p: 2,
                  bgcolor: '#DBEAFE',
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
                {JSON.stringify(debugInfo, null, 2)}
              </Box>
              <Typography variant="caption" sx={{ color: '#6B7280', mt: 2, display: 'block' }}>
                💡 Share this debug info with your administrator for faster troubleshooting.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
      
      {/* Loading State */}
      {isLoading && !fetchError && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: '#6B7280', mb: 2 }}>
            Loading your dashboard...
          </Typography>
        </Box>
      )}
      
      {/* Dashboard Content (only show if no error and not loading) */}
      {!isLoading && !fetchError && (
        <>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
            Welcome back, {profile?.fullname || 'Student'}!
          </Typography>
      <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
        Here&apos;s an overview of your academic progress
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                bgcolor: card.color,
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                },
                transition: 'box-shadow 0.2s',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                      {card.title}
                    </Typography>
                  </Box>
                  <Box>{card.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

          <Box sx={{ mt: 4 }}>
            <Card sx={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
                  Recent Activity
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  No recent activity to display
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </>
      )}
    </Box>
  );
}
