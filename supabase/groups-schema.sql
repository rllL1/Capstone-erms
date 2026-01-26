-- Groups Schema for ERMS
-- Run this in your Supabase SQL Editor

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  year_level TEXT NOT NULL,
  semester TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  student_count INTEGER DEFAULT 0,
  material_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create group_students table (for students who join groups)
CREATE TABLE IF NOT EXISTS group_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, student_id)
);

-- Create group_materials table (for assessments/examinations shared to groups)
CREATE TABLE IF NOT EXISTS group_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL CHECK (material_type IN ('assessment', 'examination')),
  material_id UUID NOT NULL,
  posted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  posted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_materials ENABLE ROW LEVEL SECURITY;

-- Policies for groups table
CREATE POLICY "Service role has full access on groups"
  ON groups
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Teachers can view own groups"
  ON groups
  FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create groups"
  ON groups
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own groups"
  ON groups
  FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own groups"
  ON groups
  FOR DELETE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view groups they joined"
  ON groups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_students
      WHERE group_students.group_id = groups.id
      AND group_students.student_id = auth.uid()
    )
  );

-- Policies for group_students table
CREATE POLICY "Service role has full access on group_students"
  ON group_students
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Teachers can view students in their groups"
  ON group_students
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_students.group_id
      AND groups.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can join groups"
  ON group_students
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their group memberships"
  ON group_students
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can leave groups"
  ON group_students
  FOR DELETE
  USING (auth.uid() = student_id);

-- Policies for group_materials table
CREATE POLICY "Service role has full access on group_materials"
  ON group_materials
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Teachers can manage materials in their groups"
  ON group_materials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_materials.group_id
      AND groups.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view materials in their groups"
  ON group_materials
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_students
      WHERE group_students.group_id = group_materials.group_id
      AND group_students.student_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON groups(teacher_id);
CREATE INDEX IF NOT EXISTS idx_groups_code ON groups(code);
CREATE INDEX IF NOT EXISTS idx_group_students_group_id ON group_students(group_id);
CREATE INDEX IF NOT EXISTS idx_group_students_student_id ON group_students(student_id);
CREATE INDEX IF NOT EXISTS idx_group_materials_group_id ON group_materials(group_id);
CREATE INDEX IF NOT EXISTS idx_group_materials_material_type ON group_materials(material_type);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_groups_updated_at();

-- Trigger to update student_count when students join/leave
CREATE OR REPLACE FUNCTION update_group_student_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE groups
    SET student_count = student_count + 1
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE groups
    SET student_count = student_count - 1
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER group_student_count_trigger
  AFTER INSERT OR DELETE ON group_students
  FOR EACH ROW
  EXECUTE FUNCTION update_group_student_count();

-- Trigger to update material_count when materials are added/removed
CREATE OR REPLACE FUNCTION update_group_material_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE groups
    SET material_count = material_count + 1
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE groups
    SET material_count = material_count - 1
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER group_material_count_trigger
  AFTER INSERT OR DELETE ON group_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_group_material_count();
