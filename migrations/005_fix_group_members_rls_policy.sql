-- Drop the overly restrictive "Teachers can manage group members" policy
-- and replace it with more specific policies

-- First, drop the old policy if it exists
DROP POLICY IF EXISTS "Teachers can manage group members" ON group_members;

-- Add a SELECT policy for teachers to view group members
CREATE POLICY "Teachers can view their group members"
    ON group_members FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM groups
            WHERE id = group_members.group_id 
            AND teacher_id = auth.uid()
        )
    );

-- Add an INSERT policy for teachers to add students to their groups
CREATE POLICY "Teachers can add students to their groups"
    ON group_members FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM groups
            WHERE id = group_members.group_id 
            AND teacher_id = auth.uid()
        )
    );

-- Add an UPDATE policy for teachers to update their group members
CREATE POLICY "Teachers can update their group members"
    ON group_members FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM groups
            WHERE id = group_members.group_id 
            AND teacher_id = auth.uid()
        )
    );

-- Add a DELETE policy for teachers to remove students from their groups
CREATE POLICY "Teachers can remove students from their groups"
    ON group_members FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM groups
            WHERE id = group_members.group_id 
            AND teacher_id = auth.uid()
        )
    );

-- ============================================
-- Add RLS policies for profiles table
-- ============================================

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow teachers and admins to view student profiles
CREATE POLICY IF NOT EXISTS "Teachers can view student profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        role = 'student' AND 
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin')
        )
    );

-- Allow students to view their own profile
CREATE POLICY IF NOT EXISTS "Students can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        id = auth.uid()
    );

-- Allow users to view profiles needed for their groups
CREATE POLICY IF NOT EXISTS "Users can view profiles related to their groups"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        role = 'student' AND
        EXISTS (
            SELECT 1 FROM group_members gm
            JOIN groups g ON gm.group_id = g.id
            WHERE gm.student_id = profiles.id
            AND (
                g.teacher_id = auth.uid()
                OR gm.student_id = auth.uid()
            )
        )
    );
