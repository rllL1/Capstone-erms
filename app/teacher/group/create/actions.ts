'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CreateGroupData {
  name: string;
  subject: string;
  description: string;
  year_level: string;
  semester: string;
  code: string;
}

export async function createGroup(data: CreateGroupData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Check if code already exists in class_join_codes
    const { data: existingCode } = await supabase
      .from('class_join_codes')
      .select('id')
      .eq('code', data.code)
      .single();

    if (existingCode) {
      return { error: 'This code already exists. Please generate a new one.' };
    }

    // Insert group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        teacher_id: user.id,
        name: data.name,
        subject: data.subject,
        description: data.description,
        year_level: data.year_level,
        semester: data.semester,
        code: data.code,
        student_count: 0,
        material_count: 0,
      })
      .select()
      .single();

    if (groupError) {
      console.error('Database error creating group:', groupError);
      return { error: groupError.message || 'Failed to create group' };
    }

    if (!group) {
      return { error: 'Failed to create group - no data returned' };
    }

    // Create join code for the group
    const { error: joinCodeError } = await supabase
      .from('class_join_codes')
      .insert({
        group_id: group.id,
        code: data.code,
        max_uses: -1, // unlimited uses
        current_uses: 0,
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (joinCodeError) {
      console.error('Database error creating join code:', joinCodeError);
      // Still return success because the group was created, but log the error
      return { success: true, groupId: group.id, warning: 'Group created but join code setup failed' };
    }

    revalidatePath('/teacher/group');
    
    return { success: true, groupId: group.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
    console.error('Create group error:', error);
    return { error: errorMessage };
  }
}
