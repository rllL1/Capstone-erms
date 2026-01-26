'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const studentId = formData.get('student_id') as string;
  const password = formData.get('password') as string;

  if (!studentId || !password) {
    return { error: 'Student ID and password are required' };
  }

  // First, get the student by student_id
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id, status, student_id')
    .eq('student_id', studentId)
    .single();

  if (studentError || !student) {
    return { error: 'Invalid student ID or password' };
  }

  // Check if student account is pending approval
  if (student.status === 'pending') {
    return { error: 'Your account is pending approval. Please wait for admin approval.' };
  }

  // Check if student account is archived
  if (student.status === 'archived') {
    return { error: 'Your account has been archived. Please contact administrator.' };
  }

  // Check if student account is rejected
  if (student.status === 'rejected') {
    return { error: 'Your account registration was rejected. Please contact administrator.' };
  }

  // Now sign in with email and password using auth.users
  // Use admin client to fetch email from auth.users
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const adminSupabase = createAdminClient();
  const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(student.id);
  if (userError || !userData?.user?.email) {
    return { error: 'Unable to find user email for login.' };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userData.user.email,
    password,
  });

  if (error) {
    return { error: 'Invalid student ID or password' };
  }

  if (!data.user) {
    return { error: 'Login failed' };
  }

  redirect('/student/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/student/login');
}
