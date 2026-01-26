'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveStudent(studentId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('students')
    .update({ status: 'active' })
    .eq('id', studentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/student');
  return { success: true };
}

export async function rejectStudent(studentId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('students')
    .update({ status: 'rejected' })
    .eq('id', studentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/student');
  return { success: true };
}

export async function archiveStudent(studentId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('students')
    .update({ status: 'archived' })
    .eq('id', studentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/student');
  return { success: true };
}
