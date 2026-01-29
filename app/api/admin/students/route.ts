import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const admin = createAdminClient();

export async function GET() {
  try {
    const { data: students, error } = await admin
      .from('students')
      .select('user_id, student_id, fullname, course, email, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Unable to load students' }, { status: 500 });
    }

    // Try to fetch courses table if exists, otherwise derive distinct courses
    let courses: any[] = [];
    const { data: courseTable, error: courseErr } = await admin.from('courses').select('id, name');
    if (!courseErr && courseTable) {
      courses = courseTable;
    } else {
      const { data: distinctCourses } = await admin.from('students').select('course');
      const uniq = Array.from(
        new Map((distinctCourses || []).map((r: any) => [r.course, r])).values()
      );
      courses = uniq.map((r: any) => ({ name: r.course }));
    }

    // map user_id -> id to keep client shape
    const mapped = (students || []).map((s: any) => ({
      id: s.user_id,
      student_id: s.student_id,
      fullname: s.fullname,
      course: s.course,
      email: s.email,
      status: s.status,
      created_at: s.created_at,
    }));

    return NextResponse.json({ students: mapped, courses });
  } catch (err) {
    return NextResponse.json({ error: 'Unable to load students' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullname, studentId, course, email, password } = body;

    if (!fullname || !studentId || !course || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check duplicates in students table
    const { data: existingById } = await admin.from('students').select('user_id').eq('student_id', studentId).limit(1);
    if (existingById && (existingById as any).length) {
      return NextResponse.json({ error: 'Student ID already exists', field: 'studentId' }, { status: 409 });
    }

    const { data: existingByEmail } = await admin.from('students').select('user_id').eq('email', email).limit(1);
    if (existingByEmail && (existingByEmail as any).length) {
      return NextResponse.json({ error: 'Email already registered', field: 'email' }, { status: 409 });
    }

    // Create user in Supabase Auth (service role)
    const { data: userData, error: userError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    } as any);

    if (userError || !userData?.user?.id) {
      return NextResponse.json({ error: userError?.message || 'Failed to create auth user' }, { status: 500 });
    }

    const userId = userData.user.id;

    // Insert into students table (profile only, no password storage)
    const { error: insertErr } = await admin.from('students').insert({
      user_id: userId,
      fullname: fullname,
      student_id: studentId,
      course,
      email,
      status: 'active',
    });

    if (insertErr) {
      // cleanup created auth user
      try {
        await admin.auth.admin.deleteUser(userId);
      } catch {}
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: userId }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
