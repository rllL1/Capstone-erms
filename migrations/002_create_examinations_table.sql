-- Create examinations table for storing online exam questions and settings
CREATE TABLE IF NOT EXISTS examinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_type VARCHAR(50) NOT NULL CHECK (exam_type IN ('prelim', 'midterm', 'final', 'quiz', 'practice')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(255) NOT NULL,
    year_level VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published', 'archived')),
    questions JSONB NOT NULL, -- Array of question objects
    settings JSONB NOT NULL, -- Contains timeLimit, randomizeQuestions, allowMultipleAttempts, etc.
    terms_accepted BOOLEAN DEFAULT false,
    generation_method VARCHAR(50) CHECK (generation_method IN ('ai', 'manual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT non_empty_title CHECK (title != ''),
    CONSTRAINT non_empty_questions CHECK (jsonb_array_length(questions) > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_examinations_teacher ON examinations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_examinations_status ON examinations(status);
CREATE INDEX IF NOT EXISTS idx_examinations_exam_type ON examinations(exam_type);
CREATE INDEX IF NOT EXISTS idx_examinations_created_at ON examinations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_examinations_subject ON examinations(subject);

-- Enable Row Level Security
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Teachers can only see their own examinations
CREATE POLICY "Teachers can view their own examinations"
    ON examinations FOR SELECT
    TO authenticated
    USING (teacher_id = auth.uid());

-- Teachers can insert their own examinations
CREATE POLICY "Teachers can create examinations"
    ON examinations FOR INSERT
    TO authenticated
    WITH CHECK (teacher_id = auth.uid());

-- Teachers can update their own examinations
CREATE POLICY "Teachers can update their own examinations"
    ON examinations FOR UPDATE
    TO authenticated
    USING (teacher_id = auth.uid());

-- Teachers can delete their own examinations (only if not published)
CREATE POLICY "Teachers can delete unpublished examinations"
    ON examinations FOR DELETE
    TO authenticated
    USING (teacher_id = auth.uid() AND status != 'published');

-- Admins can view all examinations (add admin role check if you have roles)
CREATE POLICY "Admins can view all examinations"
    ON examinations FOR SELECT
    TO authenticated
    USING (true); -- You may want to add: AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'

-- Create trigger to update updated_at
CREATE TRIGGER update_examinations_updated_at
    BEFORE UPDATE ON examinations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
