-- Assessment Tables Migration
-- Run this in Supabase SQL Editor

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  generation_method TEXT CHECK (generation_method IN ('ai', 'manual', 'mixed'))
);

-- Enable Row Level Security
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access
CREATE POLICY "Service role has full access on assessments"
  ON assessments
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Teachers can read their own assessments
CREATE POLICY "Teachers can read own assessments"
  ON assessments
  FOR SELECT
  USING (auth.uid() = teacher_id);

-- Policy: Teachers can insert their own assessments
CREATE POLICY "Teachers can insert own assessments"
  ON assessments
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Policy: Teachers can update their own assessments
CREATE POLICY "Teachers can update own assessments"
  ON assessments
  FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Policy: Teachers can delete their own assessments
CREATE POLICY "Teachers can delete own assessments"
  ON assessments
  FOR DELETE
  USING (auth.uid() = teacher_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_teacher_id ON assessments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_subject ON assessments(subject);
CREATE INDEX IF NOT EXISTS idx_assessments_grade_level ON assessments(grade_level);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
