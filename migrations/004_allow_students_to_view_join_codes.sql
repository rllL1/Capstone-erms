-- Migration: Add student access to join codes
-- This allows students to validate and view join codes

-- Add policy to allow students to view join codes (needed for validation)
CREATE POLICY IF NOT EXISTS "Students can view join codes"
  ON class_join_codes FOR SELECT
  TO authenticated
  USING (true);

-- This policy allows any authenticated user to read join codes for validation purposes
-- The actual authorization happens at the application level to prevent abuse
