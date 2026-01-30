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
      .from('group_members')
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

export async function fetchGroupStudents(groupId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized', students: [] };
    }

    // Verify group ownership
    const { data: group } = await supabase
      .from('groups')
      .select('teacher_id')
      .eq('id', groupId)
      .single();

    if (!group || group.teacher_id !== user.id) {
      return { error: 'Unauthorized', students: [] };
    }

    // Fetch group members
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('status', 'active')
      .order('joined_at', { ascending: false });

    if (membersError) {
      console.error('Fetch members error:', membersError);
      return { error: 'Failed to fetch members', students: [] };
    }

    if (!members || members.length === 0) {
      return { success: true, students: [] };
    }

    // Fetch profiles for all students
    const studentIds = members.map(m => m.student_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, fullname, email')
      .in('id', studentIds);

    if (profilesError) {
      console.error('Fetch profiles error:', profilesError);
    }

    // Fetch from students table as well (in case students are stored there)
    const { data: studentRecords, error: studentsError } = await supabase
      .from('students')
      .select('user_id, fullname, email')
      .in('user_id', studentIds);

    if (studentsError) {
      console.error('Fetch students error:', studentsError);
    }

    // Combine members with their data from either table
    const enrichedStudents = members.map(member => {
      // Try to find in profiles first
      let fullname = 'Unknown';
      let email = 'N/A';

      const profile = profiles?.find(p => p.id === member.student_id);
      if (profile?.fullname) {
        fullname = profile.fullname;
        email = profile.email || 'N/A';
      } else {
        // Try to find in students table
        const studentRecord = studentRecords?.find(s => s.user_id === member.student_id);
        if (studentRecord?.fullname) {
          fullname = studentRecord.fullname;
          email = studentRecord.email || 'N/A';
        }
      }

      return {
        id: member.id,
        student_id: member.student_id,
        joined_at: member.joined_at,
        profiles: {
          full_name: fullname,
          email: email
        }
      };
    });

    return { success: true, students: enrichedStudents };
  } catch (error) {
    console.error('Fetch group students error:', error);
    return { error: 'Failed to fetch students', students: [] };
  }
}
