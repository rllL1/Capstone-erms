-- Migration: Add missing columns to groups table and setup RLS
-- This adds columns that are required by the group creation feature

-- First, ensure id column has proper default
ALTER TABLE groups ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add missing columns if they don't already exist
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS subject VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS year_level VARCHAR(100),
ADD COLUMN IF NOT EXISTS semester VARCHAR(100),
ADD COLUMN IF NOT EXISTS code VARCHAR(50),
ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS material_count INTEGER DEFAULT 0;

-- Add unique constraint on code column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT constraint_name FROM information_schema.table_constraints 
    WHERE table_name='groups' AND constraint_name='unique_group_code'
  ) THEN
    ALTER TABLE groups ADD CONSTRAINT unique_group_code UNIQUE (code);
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON groups(teacher_id);
CREATE INDEX IF NOT EXISTS idx_groups_code ON groups(code);

-- Enable RLS on groups table if not already enabled
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Teachers can create groups" ON groups;
DROP POLICY IF EXISTS "Teachers can view own groups" ON groups;
DROP POLICY IF EXISTS "Teachers can update own groups" ON groups;
DROP POLICY IF EXISTS "Teachers can delete own groups" ON groups;

-- Teachers can create and manage their own groups
CREATE POLICY "Teachers can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (teacher_id = auth.uid());

-- Teachers can view their own groups and admins can view all
CREATE POLICY "Teachers can view own groups"
  ON groups FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Teachers can update their own groups
CREATE POLICY "Teachers can update own groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Teachers can delete their own groups
CREATE POLICY "Teachers can delete own groups"
  ON groups FOR DELETE
  TO authenticated
  USING (teacher_id = auth.uid());
