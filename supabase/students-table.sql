-- Create dedicated students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id VARCHAR NOT NULL UNIQUE,
  firstname VARCHAR NOT NULL,
  middlename VARCHAR,
  lastname VARCHAR NOT NULL,
  fullname VARCHAR NOT NULL,
  course VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (for server-side operations)
CREATE POLICY "Service role has full access to students"
  ON students
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Students can read their own profile
CREATE POLICY "Students can read own profile"
  ON students
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admins can read all students
CREATE POLICY "Admins can read all students"
  ON students
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Teachers can read approved students
CREATE POLICY "Teachers can read approved students"
  ON students
  FOR SELECT
  USING (
    status = 'approved' AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- Policy: Admins can insert students
CREATE POLICY "Admins can insert students"
  ON students
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update students
CREATE POLICY "Admins can update students"
  ON students
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Students can update their own profile (limited fields)
CREATE POLICY "Students can update own profile"
  ON students
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_students_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_students_updated_at();

-- Comments for documentation
COMMENT ON TABLE students IS 'Student profiles and registration data';
COMMENT ON COLUMN students.id IS 'References auth.users - primary key';
COMMENT ON COLUMN students.student_id IS 'Unique student identifier used for login';
COMMENT ON COLUMN students.firstname IS 'Student first name';
COMMENT ON COLUMN students.middlename IS 'Student middle name (optional)';
COMMENT ON COLUMN students.lastname IS 'Student last name';
COMMENT ON COLUMN students.fullname IS 'Full name (firstname + middlename + lastname)';
COMMENT ON COLUMN students.course IS 'Student enrolled course/program';
COMMENT ON COLUMN students.status IS 'Account status: pending (awaiting approval), approved (active), inactive (rejected/deactivated)';
COMMENT ON COLUMN students.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN students.updated_at IS 'Last update timestamp';
