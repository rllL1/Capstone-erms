'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CreateExaminationData } from '@/types/assessment';

export async function createExamination(data: CreateExaminationData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { data: examination, error } = await supabase
      .from('examinations')
      .insert({
        teacher_id: user.id,
        exam_type: data.exam_type,
        title: data.title,
        description: data.description,
        subject: data.subject,
        year_level: data.year_level,
        semester: data.semester,
        status: 'pending',
        questions: data.questions,
        settings: data.settings,
        terms_accepted: data.terms_accepted,
        generation_method: data.generation_method,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to create examination' };
    }

    revalidatePath('/teacher/examination');
    
    return { success: true, examinationId: examination.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create examination';
    console.error('Create examination error:', error);
    return { error: errorMessage };
  }
}
