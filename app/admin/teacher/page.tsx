import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Profile } from '@/types/database';
import TeacherTable from './TeacherTable';
import TeacherRefreshButton from '@/app/admin/teacher/TeacherRefreshButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import SchoolIcon from '@mui/icons-material/School';

async function getTeachers(): Promise<(Profile & { email?: string })[]> {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Get profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'teacher')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }

  // Get emails from auth users
  const { data: authUsers } = await adminClient.auth.admin.listUsers();
  
  // Map emails to profiles
  const teachersWithEmail = (profiles || []).map((profile) => {
    const authUser = authUsers?.users.find((u) => u.id === profile.id);
    return {
      ...profile,
      email: authUser?.email || 'N/A',
    };
  });

  return teachersWithEmail;
}

export default async function TeacherPage() {
  const teachers = await getTeachers();

  return (
    <Box sx={{ minHeight: '100vh', background: '#ffffff', p: { xs: 2, sm: 3, lg: 4 } }}>
      {/* Welcome Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '2xl',
        p: { xs: 3, sm: 4, lg: 6 },
        mb: { xs: 4, lg: 6 },
        color: 'white',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}>
              <SchoolIcon sx={{ fontSize: { xs: 32, lg: 40 }, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.75rem', lg: '2.125rem' } }}>Teacher Management</Typography>
              <Typography variant="body2" sx={{ opacity: 0.95, fontSize: { xs: '0.875rem', lg: '1rem' } }}>Manage and create teacher accounts</Typography>
            </Box>
          </Stack>
          <TeacherRefreshButton />
        </Stack>
      </Box>

      {/* Teacher Table */}
      <TeacherTable teachers={teachers} />
    </Box>
  );
}
