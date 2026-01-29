import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(req: Request) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query students table using user_id
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('user_id, student_id, fullname, course, email, status, created_at')
      .eq('user_id', user.id)
      .single();

    if (studentError || !student) {
      console.error('Student query error:', studentError);
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
