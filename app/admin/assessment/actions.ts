'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveExamination(examinationId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Update examination status
    const { error } = await supabase
      .from('examinations')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      })
      .eq('id', examinationId);

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to approve examination' };
    }

    revalidatePath('/admin/assessment');
    revalidatePath('/teacher/examination');

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to approve examination';
    console.error('Approve examination error:', error);
    return { error: errorMessage };
  }
}

export async function rejectExamination(examinationId: string, reason: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Update examination status
    const { error } = await supabase
      .from('examinations')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', examinationId);

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to reject examination' };
    }

    revalidatePath('/admin/assessment');
    revalidatePath('/teacher/examination');

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to reject examination';
    console.error('Reject examination error:', error);
    return { error: errorMessage };
  }
}
