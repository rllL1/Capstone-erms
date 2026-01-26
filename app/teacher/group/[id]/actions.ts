'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteGroup(groupId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Verify ownership
    const { data: group } = await supabase
      .from('groups')
      .select('teacher_id')
      .eq('id', groupId)
      .single();

    if (!group || group.teacher_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    // Delete group (cascade will handle students and materials)
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error('Delete group error:', error);
      return { error: 'Failed to delete group' };
    }

    revalidatePath('/teacher/group');
    return { success: true };
  } catch (error) {
    console.error('Delete group error:', error);
    return { error: 'Failed to delete group' };
  }
}

export async function removeStudent(studentRecordId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('group_students')
      .delete()
      .eq('id', studentRecordId);

    if (error) {
      console.error('Remove student error:', error);
      return { error: 'Failed to remove student' };
    }

    return { success: true };
  } catch (error) {
    console.error('Remove student error:', error);
    return { error: 'Failed to remove student' };
  }
}

export async function removeMaterial(materialId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('group_materials')
      .delete()
      .eq('id', materialId);

    if (error) {
      console.error('Remove material error:', error);
      return { error: 'Failed to remove material' };
    }

    return { success: true };
  } catch (error) {
    console.error('Remove material error:', error);
    return { error: 'Failed to remove material' };
  }
}

export async function updateGroup(
  groupId: string,
  data: {
    name: string;
    subject: string;
    description: string;
    year_level: string;
    semester: string;
  }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('groups')
      .update(data)
      .eq('id', groupId)
      .eq('teacher_id', user.id);

    if (error) {
      console.error('Update group error:', error);
      return { error: 'Failed to update group' };
    }

    revalidatePath('/teacher/group');
    revalidatePath(`/teacher/group/${groupId}`);
    return { success: true };
  } catch (error) {
    console.error('Update group error:', error);
    return { error: 'Failed to update group' };
  }
}

export async function shareMaterial(
  groupId: string,
  materialType: 'assessment' | 'examination',
  materialId: string,
  title: string,
  description: string,
  dueDate?: string
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Verify group ownership
    const { data: group } = await supabase
      .from('groups')
      .select('teacher_id')
      .eq('id', groupId)
      .single();

    if (!group || group.teacher_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    // Check if already shared
    const { data: existing } = await supabase
      .from('group_materials')
      .select('id')
      .eq('group_id', groupId)
      .eq('material_id', materialId)
      .single();

    if (existing) {
      return { error: 'Material already shared to this group' };
    }

    // Insert material
    const { error } = await supabase
      .from('group_materials')
      .insert({
        group_id: groupId,
        material_type: materialType,
        material_id: materialId,
        posted_by: user.id,
        title,
        description,
        due_date: dueDate || null,
      });

    if (error) {
      console.error('Share material error:', error);
      return { error: 'Failed to share material' };
    }

    return { success: true };
  } catch (error) {
    console.error('Share material error:', error);
    return { error: 'Failed to share material' };
  }
}
