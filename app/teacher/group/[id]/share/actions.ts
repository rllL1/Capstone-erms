'use server';

import { createClient } from '@/lib/supabase/server';

export async function shareMaterial(
  groupId: string,
  materialType: 'assessment' | 'examination',
  materialId: string,
  title: string
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
        description: '',
        due_date: null,
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
