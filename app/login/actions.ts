'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: 'Login failed' };
  }

  // Fetch user profile to check status and role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { error: 'User profile not found. Please contact administrator.' };
  }

  // Check if user is archived
  if (profile.status === 'archived') {
    await supabase.auth.signOut();
    return { error: 'Your account has been archived. Please contact administrator.' };
  }

  // Redirect based on role
  if (profile.role === 'admin') {
    redirect('/admin/dashboard');
  } else {
    redirect('/teacher/dashboard');
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
