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
    const { data: joinCodeData, error: codeError } = await supabase
      .from('class_join_codes')
      .select('id, group_id, max_uses, current_uses, is_active, expires_at')
      .eq('code', code.toUpperCase())
      .single();

    console.log('Join code lookup:', { joinCodeData, codeError, code: code.toUpperCase() });

    let joinCode = joinCodeData;

    // If not found in class_join_codes, try groups table and create a join code
    if (!joinCodeData) {
      console.log('Join code not found, checking groups table...');
      
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id, teacher_id')
        .eq('code', code.toUpperCase())
        .single();

      console.log('Groups table lookup:', { groupData, groupError });

      if (!groupData) {
        console.error('Code not found in either table during join:', code.toUpperCase());
        return NextResponse.json(
          { error: 'Invalid code' },
          { status: 400 }
        );
      }

      // Create join code for this group
      console.log('Creating join code for group during join:', groupData.id);
      
      const { data: newJoinCode, error: createError } = await supabase
        .from('class_join_codes')
        .insert({
          group_id: groupData.id,
          code: code.toUpperCase(),
          max_uses: -1,
          current_uses: 0,
          is_active: true,
          created_by: groupData.teacher_id,
        })
        .select('id, group_id, max_uses, current_uses, is_active, expires_at')
        .single();

      console.log('Join code creation during join:', { newJoinCode, createError });

      if (!newJoinCode) {
        console.error('Failed to create join code during join:', createError);
        return NextResponse.json(
          { error: 'Invalid code' },
          { status: 400 }
        );
      }

      joinCode = newJoinCode;
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
