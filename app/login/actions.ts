'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return;
  }

  if (!data.user) {
    return;
  }

  // Fetch user profile to check status and role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    // If no profile found in `profiles`, check `students` table for student accounts
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('user_id')
      .eq('user_id', data.user.id)
      .single();

    if (!studentError && student) {
      // It's a student account — redirect to student dashboard
      redirect('/student/dashboard');
    }

    await supabase.auth.signOut();
    return;
  }

  // Check if user is archived
  if (profile.status === 'archived') {
    await supabase.auth.signOut();
    return;
  }

  // Redirect based on role
  if (profile.role === 'admin') {
    redirect('/admin/dashboard');
  } else if (profile.role === 'student') {
    redirect('/student/dashboard');
  } else {
    redirect('/teacher/dashboard');
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
