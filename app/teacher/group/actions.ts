'use server';

import { createClient } from '@/lib/supabase/server';

export async function fetchTeacherGroups() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized', groups: [] };
    }

    // Fetch all groups for the teacher
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('id, name, subject, description, code, created_at, teacher_id')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (groupsError) {
      console.error('Fetch groups error:', groupsError);
      return { error: 'Failed to fetch groups', groups: [] };
    }

    if (!groups || groups.length === 0) {
      return { success: true, groups: [] };
    }

    // Fetch student counts for all groups
    const { data: studentCounts, error: studentCountError } = await supabase
      .from('group_members')
      .select('group_id', { count: 'exact', head: false })
      .eq('status', 'active')
      .in('group_id', groups.map(g => g.id));

    // Fetch material counts for all groups
    const { data: materialCounts, error: materialCountError } = await supabase
      .from('group_materials')
      .select('group_id', { count: 'exact', head: false })
      .in('group_id', groups.map(g => g.id));

    // Create a map of counts by group_id
    const studentCountMap = new Map<string, number>();
    const materialCountMap = new Map<string, number>();

    if (studentCounts) {
      groups.forEach(g => {
        const count = studentCounts.filter(sc => sc.group_id === g.id).length;
        studentCountMap.set(g.id, count);
      });
    }

    if (materialCounts) {
      groups.forEach(g => {
        const count = materialCounts.filter(mc => mc.group_id === g.id).length;
        materialCountMap.set(g.id, count);
      });
    }

    // Enrich groups with actual counts
    const enrichedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      subject: group.subject,
      description: group.description,
      code: group.code,
      created_at: group.created_at,
      student_count: studentCountMap.get(group.id) || 0,
      material_count: materialCountMap.get(group.id) || 0,
    }));

    return { success: true, groups: enrichedGroups };
  } catch (error) {
    console.error('Fetch teacher groups error:', error);
    return { error: 'Failed to fetch groups', groups: [] };
  }
}
