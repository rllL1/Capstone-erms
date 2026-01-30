
-- (Removed duplicate and outdated students table definition. See below for the correct students table.)
-- ============================================
-- 1b. Groups Table (Needed for group_id references)
-- ============================================
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    description TEXT,
    year_level VARCHAR(100),
    semester VARCHAR(100),
    code VARCHAR(50) UNIQUE NOT NULL,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_count INTEGER DEFAULT 0,
    material_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for groups
CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON groups(teacher_id);
CREATE INDEX IF NOT EXISTS idx_groups_code ON groups(code);

-- ============================================

-- ============================================
-- 1. Profiles Table (Teachers and Admins Only)
-- ============================================
-- Keep existing profiles table for teachers and admins
-- No changes needed to existing structure


-- ============================================
-- 3. Exam Grades Table (Updated to use students table)
-- ============================================
CREATE TABLE IF NOT EXISTS exam_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
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
-- 4. Assessment Submissions Table (Updated)
-- ============================================
CREATE TABLE IF NOT EXISTS assessment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    score DECIMAL(10, 2) NOT NULL DEFAULT 0,
    max_score DECIMAL(10, 2) NOT NULL,
    percentage DECIMAL(5, 2) GENERATED ALWAYS AS ((score / max_score) * 100) STORED,
    answers JSONB,
    time_taken INTEGER,
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
-- 5. Student Group Memberships Table (Updated)
-- ============================================
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'removed')),
    
    CONSTRAINT unique_group_student UNIQUE(group_id, student_id)
);

-- Indexes for group_members
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_student ON group_members(student_id);
CREATE INDEX IF NOT EXISTS idx_group_members_status ON group_members(status);

-- ============================================
-- 6. Final Grades Table (Updated)
-- ============================================
CREATE TABLE IF NOT EXISTS final_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    term VARCHAR(100),
    academic_year VARCHAR(20),
    
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
-- 7. Grade Scale Reference Table
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
-- 8. Student Activity Log (Updated)
-- ============================================
CREATE TABLE IF NOT EXISTS student_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_activity_log_student ON student_activity_log(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON student_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON student_activity_log(created_at DESC);

-- ============================================
-- 9. Functions and Triggers
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
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exam_grades_updated_at ON exam_grades;
CREATE TRIGGER update_exam_grades_updated_at
    BEFORE UPDATE ON exam_grades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_final_grades_updated_at ON final_grades;
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

DROP TRIGGER IF EXISTS assign_letter_grade_trigger ON final_grades;
CREATE TRIGGER assign_letter_grade_trigger
    BEFORE INSERT OR UPDATE ON final_grades
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_letter_grade();

-- ============================================
-- 10. Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_activity_log ENABLE ROW LEVEL SECURITY;

-- Students Table Policies
CREATE POLICY "Students can view their own profile"
    ON students FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Students can update their own profile"
    ON students FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all students"
    ON students FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Teachers can view active students"
    ON students FOR SELECT
    TO authenticated
    USING (
        status = 'active' AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('teacher', 'admin')
        )
    );

-- Groups Table Policies
CREATE POLICY "Teachers can create groups"
    ON groups FOR INSERT
    TO authenticated
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can view own groups"
    ON groups FOR SELECT
    TO authenticated
    USING (teacher_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Teachers can update own groups"
    ON groups FOR UPDATE
    TO authenticated
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own groups"
    ON groups FOR DELETE
    TO authenticated
    USING (teacher_id = auth.uid());

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
-- 11. Helpful Views
-- ============================================

-- View for student performance summary
CREATE OR REPLACE VIEW student_performance_summary AS
SELECT 
    s.id AS student_id,
    s.student_id AS student_number,
    s.fullname AS student_name,
    s.status,
    COUNT(DISTINCT gm.group_id) AS total_classes,
    COUNT(DISTINCT asub.id) AS completed_assessments,
    AVG(asub.percentage) AS average_assessment_score,
    AVG(eg.percentage) AS average_exam_score,
    AVG(fg.final_grade) AS gpa
FROM students s
LEFT JOIN group_members gm ON s.id = gm.student_id AND gm.status = 'active'
LEFT JOIN assessment_submissions asub ON s.id = asub.student_id AND asub.status = 'graded'
LEFT JOIN exam_grades eg ON s.id = eg.student_id
LEFT JOIN final_grades fg ON s.id = fg.student_id
WHERE s.status = 'active'
GROUP BY s.id, s.student_id, s.fullname, s.status;

-- View for teacher's student roster
CREATE OR REPLACE VIEW teacher_student_roster AS
SELECT 
    g.teacher_id,
    g.id AS group_id,
    g.name AS group_name,
    s.id AS student_id,
    s.student_id AS student_number,
    s.fullname AS student_name,
    gm.joined_at,
    gm.status AS membership_status
FROM groups g
JOIN group_members gm ON g.id = gm.group_id
JOIN students s ON gm.student_id = s.id;

-- (Removed pending_students view: students are now created as active by admin, no pending status)

-- ============================================
-- 12. Migration Helper Function
-- ============================================

-- Function to migrate existing student data from profiles to students table
CREATE OR REPLACE FUNCTION migrate_students_from_profiles()
RETURNS void AS $$
BEGIN
    INSERT INTO students (id, student_id, fullname, status, created_at)
    SELECT 
        id,
        student_id,
        fullname,
        status,
        created_at
    FROM profiles
    WHERE role = 'student'
    ON CONFLICT (id) DO NOTHING;
    
    -- Optional: Delete student records from profiles after migration
    -- DELETE FROM profiles WHERE role = 'student';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 13. Sample Usage Examples
-- ============================================

-- To create a new student (after auth user is created):
-- INSERT INTO students (id, student_id, fullname, status)
-- VALUES ('auth-user-uuid', '2024-001', 'John Doe', 'pending');

-- To approve a student:
-- UPDATE students SET status = 'active' WHERE id = 'student-uuid';

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
