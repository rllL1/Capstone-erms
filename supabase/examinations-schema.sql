-- Create examinations table
CREATE TABLE IF NOT EXISTS examinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('prelim', 'midterm', 'finals')),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  year_level TEXT NOT NULL,
  semester TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'draft', 'published', 'archived')),
  questions JSONB NOT NULL DEFAULT '[]',
  settings JSONB NOT NULL DEFAULT '{}',
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  generation_method TEXT CHECK (generation_method IN ('ai', 'manual', 'mixed')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view their own examinations
CREATE POLICY "Teachers can view own examinations"
  ON examinations
  FOR SELECT
  USING (auth.uid() = teacher_id);

-- Policy: Teachers can insert their own examinations
CREATE POLICY "Teachers can create examinations"
  ON examinations
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Policy: Teachers can update their own examinations
CREATE POLICY "Teachers can update own examinations"
  ON examinations
  FOR UPDATE
  USING (auth.uid() = teacher_id);

-- Policy: Teachers can delete their own examinations
CREATE POLICY "Teachers can delete own examinations"
  ON examinations
  FOR DELETE
  USING (auth.uid() = teacher_id);

-- Policy: Admins can view all examinations
CREATE POLICY "Admins can view all examinations"
  ON examinations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update all examinations (for approval/rejection)
CREATE POLICY "Admins can update examinations"
  ON examinations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create index for better query performance
CREATE INDEX idx_examinations_teacher_id ON examinations(teacher_id);
CREATE INDEX idx_examinations_exam_type ON examinations(exam_type);
CREATE INDEX idx_examinations_status ON examinations(status);
CREATE INDEX idx_examinations_created_at ON examinations(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_examinations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER examinations_updated_at
  BEFORE UPDATE ON examinations
  FOR EACH ROW
  EXECUTE FUNCTION update_examinations_updated_at();
