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
    <Box sx={{ minHeight: '100vh', background: '#ffffff', p: 3 }}>
      {/* Header Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        p: 3,
        mb: 4,
        color: 'white',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <SchoolIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Teacher Management</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Manage and create teacher accounts</Typography>
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
