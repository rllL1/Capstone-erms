import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Profile } from '@/types/database';
import StudentTable from './StudentTable';

async function getStudents(): Promise<(Profile & { email?: string })[]> {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Get students from the new students table
  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }

  // Get emails from auth users
  const { data: authUsers } = await adminClient.auth.admin.listUsers();

  // Map emails to students
  const studentsWithEmail = (students || []).map((student) => {
    const authUser = authUsers?.users.find((u) => u.id === student.id);
    return {
      ...student,
      email: authUser?.email || 'N/A',
    };
  });

  return studentsWithEmail;
}

export default async function StudentPage() {
  const students = await getStudents();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-500 mt-1">Approve, reject, or manage student accounts</p>
      </div>

      {/* Student Table */}
      <StudentTable students={students} />
    </div>
  );
}
