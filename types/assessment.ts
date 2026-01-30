export type QuestionType = 'multiple_choice' | 'true_false' | 'identification' | 'enumeration' | 'essay' | 'short_answer';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type AssessmentStatus = 'draft' | 'published' | 'archived';
export type ExaminationStatus = 'pending' | 'approved' | 'rejected' | 'draft' | 'published' | 'archived';
export type ExamType = 'prelim' | 'midterm' | 'finals';

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  points: number;
  difficulty: DifficultyLevel;
  
  // For multiple choice
  options?: MultipleChoiceOption[];
  
  // For true/false
  correctAnswer?: boolean;
  
  // For identification and essay
  sampleAnswer?: string;
  
  order: number;
}

export interface AssessmentSettings {
  totalPoints: number;
  timeLimit: number; // in minutes
  randomizeQuestions: boolean;
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  availableFrom: string;
  availableUntil: string;
  passingScore?: number;
}

export interface Assessment {
  id: string;
  teacher_id: string;
  title: string;
  description: string;
  subject: string;
  grade_level: string;
  status: AssessmentStatus;
  questions: Question[];
  settings: AssessmentSettings;
  created_at: string;
  updated_at: string;
  published_at?: string;
  terms_accepted: boolean;
  generation_method?: 'ai' | 'manual' | 'mixed';
}

export interface CreateAssessmentData {
  title: string;
  description: string;
  subject: string;
  grade_level: string;
  questions: Question[];
  settings: AssessmentSettings;
  terms_accepted: boolean;
  generation_method: 'ai' | 'manual' | 'mixed';
}

export interface AIGenerationRequest {
  file?: File;
  text?: string;
  numberOfQuestions: number;
  questionTypes: QuestionType[];
  difficultyLevel: DifficultyLevel;
  subject: string;
  gradeLevel: string;
}

export interface Examination {
  id: string;
  teacher_id: string;
  exam_type: ExamType;
  title: string;
  description: string;
  subject: string;
  year_level: string;
  semester: string;
  status: ExaminationStatus;
  questions: Question[];
  settings: AssessmentSettings;
  created_at: string;
  updated_at: string;
  published_at?: string;
  terms_accepted: boolean;
  generation_method?: 'ai' | 'manual' | 'mixed';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface CreateExaminationData {
  exam_type: ExamType;
  title: string;
  description: string;
  subject: string;
  year_level: string;
  semester: string;
  questions: Question[];
  settings: AssessmentSettings;
  terms_accepted: boolean;
  generation_method: 'ai' | 'manual' | 'mixed';
}
