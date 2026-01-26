'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function approveStudent(studentId: string) {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('students')
      .update({ status: 'approved' })
      .eq('id', studentId);

    if (error) {
      console.error('Approve student error:', error);
      return { error: 'Failed to approve student' };
    }

    revalidatePath('/admin/students');
    return { success: true };
  } catch (error) {
    console.error('Approve student error:', error);
    return { error: 'Failed to approve student' };
  }
}

export async function rejectStudent(studentId: string) {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('students')
      .update({ status: 'inactive' })
      .eq('id', studentId);

    if (error) {
      console.error('Reject student error:', error);
      return { error: 'Failed to reject student' };
    }

    revalidatePath('/admin/students');
    return { success: true };
  } catch (error) {
    console.error('Reject student error:', error);
    return { error: 'Failed to reject student' };
  }
}

export async function fetchStudents(filter?: 'all' | 'pending' | 'approved' | 'inactive') {
  try {
    const supabase = createAdminClient();
    
    let query = supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter && filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Fetch students error:', error);
      return { error: 'Failed to fetch students', data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Fetch students error:', error);
    return { error: 'Failed to fetch students', data: [] };
  }
}
