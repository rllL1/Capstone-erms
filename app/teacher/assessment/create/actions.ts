'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Question, QuestionType, DifficultyLevel, CreateAssessmentData } from '@/types/assessment';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateQuestionsWithAI(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;
    const numberOfQuestions = parseInt(formData.get('numberOfQuestions') as string);
    const questionTypes = JSON.parse(formData.get('questionTypes') as string) as QuestionType[];
    const difficulty = formData.get('difficulty') as DifficultyLevel;
    const subject = formData.get('subject') as string;
    const gradeLevel = formData.get('gradeLevel') as string;

    let contentToAnalyze = '';

    // Handle file upload
    if (file) {
      const fileText = await file.text();
      contentToAnalyze = fileText;
    } else if (text) {
      contentToAnalyze = text;
    } else {
      return { error: 'No content provided' };
    }

    // Truncate content if too long (Gemini has token limits)
    if (contentToAnalyze.length > 30000) {
      contentToAnalyze = contentToAnalyze.substring(0, 30000);
    }

    // Create prompt for Gemini
    const prompt = `You are an expert educator creating assessment questions for ${subject} at Grade ${gradeLevel} level.

Based on the following content, generate exactly ${numberOfQuestions} questions.

Question types to generate: ${questionTypes.join(', ')}
Difficulty level: ${difficulty}

IMPORTANT: Return ONLY a valid JSON array with NO additional text, explanations, or markdown formatting.

Each question must follow this exact structure:
${questionTypes.includes('multiple_choice') ? `
For multiple_choice:
{
  "type": "multiple_choice",
  "question": "Clear question text?",
  "points": 2,
  "difficulty": "${difficulty}",
  "options": [
    {"id": "1", "text": "Option A", "isCorrect": true},
    {"id": "2", "text": "Option B", "isCorrect": false},
    {"id": "3", "text": "Option C", "isCorrect": false},
    {"id": "4", "text": "Option D", "isCorrect": false}
  ]
}` : ''}
${questionTypes.includes('true_false') ? `
For true_false:
{
  "type": "true_false",
  "question": "Statement to evaluate?",
  "points": 1,
  "difficulty": "${difficulty}",
  "correctAnswer": true
}` : ''}
${questionTypes.includes('identification') ? `
For identification:
{
  "type": "identification",
  "question": "What is...?",
  "points": 3,
  "difficulty": "${difficulty}",
  "sampleAnswer": "Expected answer"
}` : ''}
${questionTypes.includes('essay') ? `
For essay:
{
  "type": "essay",
  "question": "Discuss or explain...?",
  "points": 10,
  "difficulty": "${difficulty}",
  "sampleAnswer": "Sample essay response with key points"
}` : ''}

CONTENT TO ANALYZE:
${contentToAnalyze}

Return ONLY the JSON array, nothing else.`;

    // Call Gemini API (using free tier model)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let generatedText = response.text();

    // Clean up the response - remove markdown code blocks if present
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', generatedText);
      return { error: 'Failed to parse AI response. Please try again.' };
    }

    // Validate and format questions
    const questions: Question[] = parsedQuestions.map((q: Question, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      type: q.type,
      question: q.question,
      points: q.points || (q.type === 'essay' ? 10 : q.type === 'identification' ? 3 : 2),
      difficulty: q.difficulty || difficulty,
      options: q.options,
      correctAnswer: q.correctAnswer,
      sampleAnswer: q.sampleAnswer,
      order: index + 1,
    }));

    return { success: true, questions };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate questions. Please try again.';
    console.error('Gemini AI Error:', error);
    return { error: errorMessage };
  }
}

export async function createAssessment(data: CreateAssessmentData) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Insert assessment
    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert({
        teacher_id: user.id,
        title: data.title,
        description: data.description,
        subject: data.subject,
        grade_level: data.grade_level,
        status: 'published',
        questions: data.questions,
        settings: data.settings,
        terms_accepted: data.terms_accepted,
        generation_method: data.generation_method,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to create assessment' };
    }

    revalidatePath('/teacher/assessment');
    
    return { success: true, assessmentId: assessment.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create assessment';
    console.error('Create assessment error:', error);
    return { error: errorMessage };
  }
}
