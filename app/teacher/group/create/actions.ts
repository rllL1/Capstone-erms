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

    // Check if code already exists
    const { data: existingGroup } = await supabase
      .from('groups')
      .select('id')
      .eq('code', data.code)
      .single();

    if (existingGroup) {
      return { error: 'This code already exists. Please generate a new one.' };
    }

    // Insert group
    const { data: group, error } = await supabase
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

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to create group' };
    }

    revalidatePath('/teacher/group');
    
    return { success: true, groupId: group.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
    console.error('Create group error:', error);
    return { error: errorMessage };
  }
}
