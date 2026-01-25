'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CreateTeacherData } from '@/types/database';

export async function createTeacher(formData: FormData) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Verify current user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Only administrators can create teacher accounts' };
  }

  const data: CreateTeacherData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullname: formData.get('fullname') as string,
    employee_id: formData.get('employee_id') as string,
    department: formData.get('department') as string,
  };

  // Validate required fields
  if (!data.email || !data.password || !data.fullname || !data.employee_id || !data.department) {
    return { error: 'All fields are required' };
  }

  // Validate password length
  if (data.password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  // Create user in Supabase Auth using admin client
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  });

  if (authError) {
    console.error('Auth error:', authError);
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: 'Failed to create user' };
  }

  // Create profile
  const { error: profileError } = await adminClient.from('profiles').insert({
    id: authData.user.id,
    role: 'teacher',
    fullname: data.fullname,
    employee_id: data.employee_id,
    department: data.department,
    status: 'active',
  });

  if (profileError) {
    console.error('Profile error:', profileError);
    // Rollback: delete the auth user if profile creation fails
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return { error: 'Failed to create profile: ' + profileError.message };
  }

  revalidatePath('/admin/teacher');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

export async function archiveTeacher(teacherId: string) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Verify current user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Only administrators can archive teacher accounts' };
  }

  // Update teacher status to archived
  const { error } = await adminClient
    .from('profiles')
    .update({ status: 'archived' })
    .eq('id', teacherId)
    .eq('role', 'teacher');

  if (error) {
    console.error('Archive error:', error);
    return { error: 'Failed to archive teacher' };
  }

  revalidatePath('/admin/teacher');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

export async function restoreTeacher(teacherId: string) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Verify current user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Only administrators can restore teacher accounts' };
  }

  // Update teacher status to active
  const { error } = await adminClient
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', teacherId)
    .eq('role', 'teacher');

  if (error) {
    console.error('Restore error:', error);
    return { error: 'Failed to restore teacher' };
  }

  revalidatePath('/admin/teacher');
  revalidatePath('/admin/dashboard');

  return { success: true };
}
