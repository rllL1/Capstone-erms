import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Generates a unique join code for a teacher's class
 * POST /api/teacher/generate-join-code
 *
 * Request body:
 * {
 *   groupId: string (UUID),
 *   maxUses: number (-1 for unlimited),
 *   expirationDays: number | null (null for no expiration)
 * }
 *
 * Response:
 * {
 *   code: string,
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { groupId, maxUses, expirationDays } = await request.json();

    // Validate input
    if (!groupId || typeof groupId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    if (typeof maxUses !== 'number' || (maxUses !== -1 && maxUses < 1)) {
      return NextResponse.json(
        { error: 'Invalid max uses. Must be -1 or a positive number' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user (teacher)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify teacher owns this group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, teacher_id')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    if (group.teacher_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to generate codes for this class' },
        { status: 403 }
      );
    }

    // Generate unique join code
    let code: string = '';
    let codeExists = true;
    let attempts = 0;
    const maxAttempts = 10;

    while (codeExists && attempts < maxAttempts) {
      // Generate random 8-character alphanumeric code
      code = Array.from({ length: 8 })
        .map(() => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          return chars.charAt(Math.floor(Math.random() * chars.length));
        })
        .join('');

      // Check if code already exists
      const { count } = await supabase
        .from('class_join_codes')
        .select('id', { count: 'exact' })
        .eq('code', code);

      codeExists = (count ?? 0) > 0;
      attempts++;
    }

    if (codeExists) {
      return NextResponse.json(
        { error: 'Failed to generate unique code. Please try again.' },
        { status: 500 }
      );
    }

    // Calculate expiration date if specified
    let expiresAt: string | null = null;
    if (expirationDays && expirationDays > 0) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + expirationDays);
      expiresAt = futureDate.toISOString();
    }

    // Insert join code into database
    const { data: newCode, error: insertError } = await supabase
      .from('class_join_codes')
      .insert({
        group_id: groupId,
        code: code,
        max_uses: maxUses === -1 ? -1 : maxUses,
        current_uses: 0,
        is_active: true,
        expires_at: expiresAt,
        created_by: user.id,
      })
      .select('code')
      .single();

    if (insertError) {
      console.error('Error inserting join code:', insertError);
      return NextResponse.json(
        { error: 'Failed to generate join code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      code: newCode.code,
      message: 'Join code generated successfully',
    });
  } catch (err) {
    console.error('Generate join code error:', err);
    return NextResponse.json(
      { error: 'An error occurred while generating the join code' },
      { status: 500 }
    );
  }
}
