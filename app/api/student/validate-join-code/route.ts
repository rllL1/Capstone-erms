import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates a join code and returns class preview information
 * POST /api/student/validate-join-code
 *
 * Request body:
 * {
 *   code: string (e.g., "ABC123XY")
 * }
 *
 * Response:
 * {
 *   classInfo: {
 *     groupId: string,
 *     className: string,
 *     subject: string,
 *     teacherName: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string' || code.length < 1) {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Find join code with related group and teacher info
    const { data: joinCode, error: codeError } = await supabase
      .from('class_join_codes')
      .select(`
        id,
        group_id,
        code,
        max_uses,
        current_uses,
        is_active,
        expires_at,
        groups:group_id (
          id,
          name,
          subject,
          teacher_id,
          profiles:teacher_id (fullname)
        )
      `)
      .eq('code', code.toUpperCase())
      .single();

    if (codeError || !joinCode) {
      return NextResponse.json(
        { error: 'Code not found or invalid' },
        { status: 404 }
      );
    }

    // === Validation Checks ===

    // Check if code is active
    if (!joinCode.is_active) {
      return NextResponse.json(
        { error: 'This join code has been deactivated by the teacher' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (
      joinCode.max_uses !== -1 &&
      joinCode.current_uses >= joinCode.max_uses
    ) {
      return NextResponse.json(
        { error: 'This join code has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check expiration
    if (joinCode.expires_at && new Date(joinCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This join code has expired' },
        { status: 400 }
      );
    }

    // Check if student already member of this class
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', joinCode.group_id)
      .eq('student_id', user.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this class' },
        { status: 400 }
      );
    }

    // === Extract class information ===
    const group = Array.isArray(joinCode.groups)
      ? joinCode.groups[0]
      : joinCode.groups;

    const teacher = Array.isArray(group?.profiles)
      ? group?.profiles[0]
      : group?.profiles;

    return NextResponse.json({
      classInfo: {
        groupId: joinCode.group_id,
        className: group?.name || 'Unknown Class',
        subject: group?.subject || 'N/A',
        teacherName: teacher?.fullname || 'Unknown Teacher',
      },
    });
  } catch (err) {
    console.error('Validate join code error:', err);
    return NextResponse.json(
      { error: 'An error occurred while validating the code' },
      { status: 500 }
    );
  }
}
