import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: Request) {
  try {
    // createServerClient requires cookies from Next.js Request – in App Router we can access via headers
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: student, error } = await supabase.from('students').select('user_id, student_id, fullname, course, email, status').eq('user_id', user.id).single();
    if (error) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    // map user_id -> id and full_name -> fullname for client
    const studentResp = {
      id: (student as any).user_id,
      student_id: (student as any).student_id,
      fullname: (student as any).fullname,
      course: (student as any).course,
      email: (student as any).email,
      status: (student as any).status,
    };

    return NextResponse.json({ student: studentResp });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
