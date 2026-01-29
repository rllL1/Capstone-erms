import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Allows a student to join a class using a valid join code
 * POST /api/student/join-class
 *
 * Request body:
 * {
 *   code: string (e.g., "ABC123XY")
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string,
 *   groupId: string (optional)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
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

    // Get join code
    const { data: joinCode, error: codeError } = await supabase
      .from('class_join_codes')
      .select('id, group_id, max_uses, current_uses, is_active, expires_at')
      .eq('code', code.toUpperCase())
      .single();

    if (codeError || !joinCode) {
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 400 }
      );
    }

    // === Validation Checks (Re-validate before joining) ===

    if (!joinCode.is_active) {
      return NextResponse.json(
        { error: 'This code is no longer active' },
        { status: 400 }
      );
    }

    if (
      joinCode.max_uses !== -1 &&
      joinCode.current_uses >= joinCode.max_uses
    ) {
      return NextResponse.json(
        { error: 'Code usage limit reached' },
        { status: 400 }
      );
    }

    if (joinCode.expires_at && new Date(joinCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Code has expired' },
        { status: 400 }
      );
    }

    // === Add student to group_members ===
    const { data: newMembership, error: joinError } = await supabase
      .from('group_members')
      .insert({
        group_id: joinCode.group_id,
        student_id: user.id,
        status: 'active',
      })
      .select('id')
      .single();

    if (joinError) {
      // Check if it's a duplicate (unique constraint violation)
      if (joinError.code === '23505') {
        return NextResponse.json(
          { error: 'You are already a member of this class' },
          { status: 400 }
        );
      }
      throw joinError;
    }

    // === Increment usage count ===
    const { error: updateError } = await supabase
      .from('class_join_codes')
      .update({
        current_uses: joinCode.current_uses + 1,
      })
      .eq('id', joinCode.id);

    if (updateError) {
      console.error('Error updating join code usage:', updateError);
      // Don't fail the request - student is already added
      // The usage count is non-critical
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the class',
      groupId: joinCode.group_id,
    });
  } catch (err) {
    console.error('Join class error:', err);
    return NextResponse.json(
      { error: 'An error occurred while joining the class' },
      { status: 500 }
    );
  }
}
