import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Profile } from '@/types/database';
import TeacherForm from './TeacherForm';
import TeacherTable from './TeacherTable';

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
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
        <p className="text-gray-500 mt-1">Create and manage teacher accounts</p>
      </div>

      {/* Create Teacher Form */}
      <TeacherForm />

      {/* Teacher Table */}
      <TeacherTable teachers={teachers} />
    </div>
  );
}
