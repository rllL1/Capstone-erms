-- ============================================
-- ERMS Database Schema
-- Student Management System
-- ============================================

-- ============================================
-- 1. Update existing profiles table
-- ============================================
-- Add student_id and profile_picture columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_id VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Create index on student_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, status);

-- ============================================
-- 2. Exam Grades Table
-- For recording student exam scores (offline exams)
-- ============================================
CREATE TABLE IF NOT EXISTS exam_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    exam_name VARCHAR(255) NOT NULL,
    score DECIMAL(10, 2) NOT NULL,
    max_score DECIMAL(10, 2) NOT NULL DEFAULT 100,
    percentage DECIMAL(5, 2) GENERATED ALWAYS AS ((score / max_score) * 100) STORED,
    remarks TEXT,
    exam_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_score CHECK (score >= 0),
    CONSTRAINT positive_max_score CHECK (max_score > 0),
    CONSTRAINT score_not_exceed_max CHECK (score <= max_score)
);

-- Indexes for exam_grades
CREATE INDEX IF NOT EXISTS idx_exam_grades_student ON exam_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_grades_teacher ON exam_grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exam_grades_created_at ON exam_grades(created_at DESC);

-- ============================================
-- 3. Assessment Submissions Table
-- For quiz and assignment submissions
-- ============================================
CREATE TABLE IF NOT EXISTS assessment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    score DECIMAL(10, 2) NOT NULL DEFAULT 0,
    max_score DECIMAL(10, 2) NOT NULL,
    percentage DECIMAL(5, 2) GENERATED ALWAYS AS ((score / max_score) * 100) STORED,
    answers JSONB, -- Store student answers
    time_taken INTEGER, -- Time taken in seconds
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP WITH TIME ZONE,
    feedback TEXT,
    
    CONSTRAINT unique_student_assessment UNIQUE(assessment_id, student_id),
    CONSTRAINT positive_submission_score CHECK (score >= 0),
    CONSTRAINT positive_submission_max CHECK (max_score > 0)
);

-- Indexes for assessment_submissions
CREATE INDEX IF NOT EXISTS idx_submissions_assessment ON assessment_submissions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON assessment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_group ON assessment_submissions(group_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON assessment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON assessment_submissions(submitted_at DESC);

-- ============================================
-- 4. Student Group Memberships Table
-- For managing which students belong to which groups
-- ============================================
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'removed')),
    
    CONSTRAINT unique_group_student UNIQUE(group_id, student_id)
);

-- Indexes for group_members
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_student ON group_members(student_id);
CREATE INDEX IF NOT EXISTS idx_group_members_status ON group_members(status);

-- ============================================
-- 5. Final Grades Table
-- For computed final grades based on quizzes, assignments, and exams
-- ============================================
CREATE TABLE IF NOT EXISTS final_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    term VARCHAR(100), -- e.g., "1st Quarter", "Semester 1"
    academic_year VARCHAR(20), -- e.g., "2025-2026"
    
    -- Component averages
    quiz_average DECIMAL(5, 2) DEFAULT 0,
    assignment_average DECIMAL(5, 2) DEFAULT 0,
    exam_average DECIMAL(5, 2) DEFAULT 0,
    
    -- Weights (should total 100)
    quiz_weight INTEGER DEFAULT 30,
    assignment_weight INTEGER DEFAULT 30,
    exam_weight INTEGER DEFAULT 40,
    
    -- Final computed grade
    final_grade DECIMAL(5, 2) GENERATED ALWAYS AS (
        (quiz_average * quiz_weight / 100.0) + 
        (assignment_average * assignment_weight / 100.0) + 
        (exam_average * exam_weight / 100.0)
    ) STORED,
    
    letter_grade VARCHAR(5),
    remarks TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_student_subject_term UNIQUE(student_id, subject, term, academic_year),
    CONSTRAINT valid_weights CHECK (quiz_weight + assignment_weight + exam_weight = 100),
    CONSTRAINT valid_averages CHECK (
        quiz_average >= 0 AND quiz_average <= 100 AND
        assignment_average >= 0 AND assignment_average <= 100 AND
        exam_average >= 0 AND exam_average <= 100
    )
);

-- Indexes for final_grades
CREATE INDEX IF NOT EXISTS idx_final_grades_student ON final_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_final_grades_teacher ON final_grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_final_grades_group ON final_grades(group_id);
CREATE INDEX IF NOT EXISTS idx_final_grades_academic_year ON final_grades(academic_year);

-- ============================================
-- 6. Grade Scale Reference Table
-- Define letter grade mappings
-- ============================================
CREATE TABLE IF NOT EXISTS grade_scale (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_score DECIMAL(5, 2) NOT NULL,
    max_score DECIMAL(5, 2) NOT NULL,
    letter_grade VARCHAR(5) NOT NULL,
    grade_point DECIMAL(3, 2),
    description VARCHAR(100),
    
    CONSTRAINT valid_score_range CHECK (min_score < max_score),
    CONSTRAINT valid_scores CHECK (min_score >= 0 AND max_score <= 100)
);

-- Insert default grade scale
INSERT INTO grade_scale (min_score, max_score, letter_grade, grade_point, description) VALUES
(90, 100, 'A', 4.00, 'Excellent'),
(85, 89.99, 'B+', 3.50, 'Very Good'),
(80, 84.99, 'B', 3.00, 'Good'),
(75, 79.99, 'C+', 2.50, 'Satisfactory'),
(70, 74.99, 'C', 2.00, 'Fair'),
(65, 69.99, 'D', 1.00, 'Passing'),
(0, 64.99, 'F', 0.00, 'Failing')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. Student Activity Log
-- Track student actions and engagement
-- ============================================
CREATE TABLE IF NOT EXISTS student_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- 'login', 'assessment_submit', 'group_join', etc.
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_activity_log_student ON student_activity_log(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON student_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON student_activity_log(created_at DESC);

-- ============================================
-- 8. Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_exam_grades_updated_at
    BEFORE UPDATE ON exam_grades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_final_grades_updated_at
    BEFORE UPDATE ON final_grades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically compute letter grade
CREATE OR REPLACE FUNCTION compute_letter_grade(score DECIMAL)
RETURNS VARCHAR(5) AS $$
DECLARE
    letter VARCHAR(5);
BEGIN
    SELECT grade_scale.letter_grade INTO letter
    FROM grade_scale
    WHERE score >= min_score AND score <= max_score
    LIMIT 1;
    
    RETURN COALESCE(letter, 'N/A');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign letter grade when final_grade is computed
CREATE OR REPLACE FUNCTION auto_assign_letter_grade()
RETURNS TRIGGER AS $$
BEGIN
    NEW.letter_grade = compute_letter_grade(NEW.final_grade);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_letter_grade_trigger
    BEFORE INSERT OR UPDATE ON final_grades
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_letter_grade();

-- ============================================
-- 9. Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on tables
ALTER TABLE exam_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_activity_log ENABLE ROW LEVEL SECURITY;

-- Exam Grades Policies
CREATE POLICY "Students can view their own exam grades"
    ON exam_grades FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR teacher_id = auth.uid());

CREATE POLICY "Teachers can manage exam grades"
    ON exam_grades FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('teacher', 'admin')
        )
    );

-- Assessment Submissions Policies
CREATE POLICY "Students can view their own submissions"
    ON assessment_submissions FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

CREATE POLICY "Students can create their own submissions"
    ON assessment_submissions FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view all submissions"
    ON assessment_submissions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('teacher', 'admin')
        )
    );

-- Group Members Policies
CREATE POLICY "Students can view their group memberships"
    ON group_members FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage group members"
    ON group_members FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM groups
            WHERE id = group_members.group_id 
            AND teacher_id = auth.uid()
        )
    );

-- Final Grades Policies
CREATE POLICY "Students can view their own final grades"
    ON final_grades FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage final grades"
    ON final_grades FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('teacher', 'admin')
        )
    );

-- Activity Log Policies
CREATE POLICY "Students can view their own activity"
    ON student_activity_log FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

CREATE POLICY "Teachers and admins can view all activity"
    ON student_activity_log FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('teacher', 'admin')
        )
    );

-- ============================================
-- 10. Helpful Views
-- ============================================

-- View for student performance summary
CREATE OR REPLACE VIEW student_performance_summary AS
SELECT 
    p.id AS student_id,
    p.student_id AS student_number,
    p.fullname AS student_name,
    COUNT(DISTINCT gm.group_id) AS total_classes,
    COUNT(DISTINCT asub.id) AS completed_assessments,
    AVG(asub.percentage) AS average_assessment_score,
    AVG(eg.percentage) AS average_exam_score,
    AVG(fg.final_grade) AS gpa
FROM profiles p
LEFT JOIN group_members gm ON p.id = gm.student_id AND gm.status = 'active'
LEFT JOIN assessment_submissions asub ON p.id = asub.student_id AND asub.status = 'graded'
LEFT JOIN exam_grades eg ON p.id = eg.student_id
LEFT JOIN final_grades fg ON p.id = fg.student_id
WHERE p.role = 'student' AND p.status = 'active'
GROUP BY p.id, p.student_id, p.fullname;

-- View for teacher's student roster
CREATE OR REPLACE VIEW teacher_student_roster AS
SELECT 
    g.teacher_id,
    g.id AS group_id,
    g.name AS group_name,
    p.id AS student_id,
    p.student_id AS student_number,
    p.fullname AS student_name,
    gm.joined_at,
    gm.status AS membership_status
FROM groups g
JOIN group_members gm ON g.id = gm.group_id
JOIN profiles p ON gm.student_id = p.id
WHERE p.role = 'student';

-- ============================================
-- 11. Sample Data Comments
-- ============================================

-- To add a student to a group:
-- INSERT INTO group_members (group_id, student_id) 
-- VALUES ('group-uuid', 'student-uuid');

-- To record an exam grade:
-- INSERT INTO exam_grades (student_id, teacher_id, exam_name, score, max_score, exam_date)
-- VALUES ('student-uuid', 'teacher-uuid', 'Midterm Exam', 85, 100, '2026-01-26');

-- To compute and save final grades:
-- INSERT INTO final_grades (student_id, teacher_id, group_id, subject, term, academic_year, quiz_average, assignment_average, exam_average)
-- VALUES ('student-uuid', 'teacher-uuid', 'group-uuid', 'Mathematics', '1st Quarter', '2025-2026', 88, 90, 85);

-- ============================================
-- END OF SCHEMA
-- ============================================
