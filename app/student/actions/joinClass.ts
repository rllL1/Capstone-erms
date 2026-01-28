'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function joinClass(classCode: string) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'You must be logged in to join a class' };
    }

    // Trim and uppercase the class code for case-insensitive matching
    const normalizedCode = classCode.trim().toUpperCase();

    if (!normalizedCode) {
      return { error: 'Please enter a class code' };
    }

    // Find the class by invite code (assuming groups table has an invite_code column)
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('id, name, teacher_id')
      .eq('invite_code', normalizedCode)
      .single();

    if (groupError || !groupData) {
      console.error('Group lookup error:', groupError);
      return { error: 'Invalid class code. Please check and try again.' };
    }

    // Check if the student is already a member of this class
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('group_members')
      .select('id, status')
      .eq('group_id', groupData.id)
      .eq('student_id', user.id)
      .single();

    if (existingMember) {
      if (existingMember.status === 'active') {
        return { error: 'You are already a member of this class' };
      } else if (existingMember.status === 'removed') {
        // Reactivate membership
        const { error: updateError } = await supabase
          .from('group_members')
          .update({ status: 'active', joined_at: new Date().toISOString() })
          .eq('id', existingMember.id);

        if (updateError) {
          console.error('Membership reactivation error:', updateError);
          return { error: 'Failed to rejoin the class. Please try again.' };
        }

        revalidatePath('/student/class');
        revalidatePath('/student/dashboard');
        return { success: true, message: 'Successfully rejoined the class!' };
      }
    }

    // Add the student to the class
    const { error: insertError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupData.id,
        student_id: user.id,
        status: 'active',
      });

    if (insertError) {
      console.error('Member insertion error:', insertError);
      return { error: 'Failed to join the class. Please try again.' };
    }

    // Revalidate relevant pages to show updated data
    revalidatePath('/student/class');
    revalidatePath('/student/dashboard');

    return { success: true, message: 'Successfully joined the class!' };
  } catch (error: any) {
    console.error('Unexpected error in joinClass:', error);
    return { error: error.message || 'An unexpected error occurred' };
  }
}
