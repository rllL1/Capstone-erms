-- Add student-specific columns to profiles table

-- Make employee_id nullable since students don't have employee IDs
ALTER TABLE profiles ALTER COLUMN employee_id DROP NOT NULL;

-- Add student_id column (unique identifier for students)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_id VARCHAR UNIQUE;

-- Add name columns for students
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS firstname VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS middlename VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lastname VARCHAR;

-- Add course column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS course VARCHAR;

-- Add status column for approval workflow
-- Values: 'pending', 'approved', 'inactive'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending';

-- Create index for faster student lookups
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, status);

-- Update existing teacher and admin profiles to have 'approved' status
UPDATE profiles 
SET status = 'approved' 
WHERE (role = 'teacher' OR role = 'admin') AND status IS NULL;

-- Comments for documentation
COMMENT ON COLUMN profiles.student_id IS 'Unique student identifier used for login';
COMMENT ON COLUMN profiles.firstname IS 'Student first name';
COMMENT ON COLUMN profiles.middlename IS 'Student middle name';
COMMENT ON COLUMN profiles.lastname IS 'Student last name';
COMMENT ON COLUMN profiles.course IS 'Student enrolled course/program';
COMMENT ON COLUMN profiles.status IS 'Account status: pending (awaiting approval), approved (active), inactive (rejected/deactivated)';
