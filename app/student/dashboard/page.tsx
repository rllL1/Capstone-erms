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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          setFetchError('Failed to get user: ' + userError.message);
          return;
        }
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('students')
            .select('fullname, student_id')
            .eq('id', user.id)
            .single();
          if (profileError) {
            setFetchError('Failed to fetch profile: ' + profileError.message);
            return;
          }
          setProfile(profileData);
          // TODO: Fetch actual stats when database tables are ready
          // For now, using placeholder values
          setStats({
            totalClasses: 0,
            pendingAssignments: 0,
            completedAssessments: 0,
            averageGrade: 0,
          });
        }
      } catch (err: any) {
        setFetchError('Failed to fetch: ' + (err?.message || 'Unknown error'));
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
      {fetchError && (
        <Box sx={{ mb: 3 }}>
          <Card sx={{ bgcolor: '#FEE2E2', color: '#B91C1C', p: 2 }}>
            <CardContent>
              <Typography variant="body1">{fetchError}</Typography>
            </CardContent>
          </Card>
        </Box>
      )}
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
        Welcome back, {profile?.fullname || 'Student'}!
      </Typography>
      <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
        Here&apos;s an overview of your academic progress
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid key={index} xs={12} sm={6} md={3}>
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
    </Box>
  );
}
