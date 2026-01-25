'use client';

import { useState } from 'react';
import type { Question, QuestionType, DifficultyLevel, MultipleChoiceOption } from '@/types/assessment';

interface ManualQuestionBuilderProps {
  questions: Question[];
  onQuestionsUpdated: (questions: Question[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ManualQuestionBuilder({
  questions,
  onQuestionsUpdated,
  onNext,
  onBack,
}: ManualQuestionBuilderProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: 'multiple_choice',
    question: '',
    points: 1,
    difficulty: 'medium',
    options: [
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false },
    ],
  });

  const addQuestion = () => {
    if (!currentQuestion.question) {
      alert('Please enter a question');
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      type: currentQuestion.type as QuestionType,
      question: currentQuestion.question,
      points: currentQuestion.points || 1,
      difficulty: currentQuestion.difficulty as DifficultyLevel,
      options: currentQuestion.options,
      correctAnswer: currentQuestion.correctAnswer,
      sampleAnswer: currentQuestion.sampleAnswer,
      order: questions.length + 1,
    };

    onQuestionsUpdated([...questions, newQuestion]);
    
    // Reset form
    setCurrentQuestion({
      type: 'multiple_choice',
      question: '',
      points: 1,
      difficulty: 'medium',
      options: [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
      ],
    });
  };

  const removeQuestion = (id: string) => {
    onQuestionsUpdated(questions.filter((q) => q.id !== id));
  };

  const addOption = () => {
    const newOptions = [
      ...(currentQuestion.options || []),
      { id: Date.now().toString(), text: '', isCorrect: false },
    ];
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const updateOption = (id: string, text: string) => {
    const newOptions = currentQuestion.options?.map((opt) =>
      opt.id === id ? { ...opt, text } : opt
    );
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const setCorrectOption = (id: string) => {
    const newOptions = currentQuestion.options?.map((opt) => ({
      ...opt,
      isCorrect: opt.id === id,
    }));
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const removeOption = (id: string) => {
    const newOptions = currentQuestion.options?.filter((opt) => opt.id !== id);
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  return (
    <div className="space-y-6">
      {/* Question Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Questions</h2>

        {/* Question Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 'multiple_choice', label: 'Multiple Choice' },
              { value: 'true_false', label: 'True or False' },
              { value: 'identification', label: 'Identification' },
              { value: 'essay', label: 'Essay Writing' },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    type: type.value as QuestionType,
                    options: type.value === 'multiple_choice' ? currentQuestion.options : undefined,
                  })
                }
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                  currentQuestion.type === type.value
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question *
          </label>
          <textarea
            value={currentQuestion.question}
            onChange={(e) =>
              setCurrentQuestion({ ...currentQuestion, question: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
            placeholder="Enter your question here..."
          />
        </div>

        {/* Points and Difficulty */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points
            </label>
            <input
              type="number"
              min="1"
              value={currentQuestion.points}
              onChange={(e) =>
                setCurrentQuestion({
                  ...currentQuestion,
                  points: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              value={currentQuestion.difficulty}
              onChange={(e) =>
                setCurrentQuestion({
                  ...currentQuestion,
                  difficulty: e.target.value as DifficultyLevel,
                })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Question Type Specific Fields */}
        {currentQuestion.type === 'multiple_choice' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <div key={option.id} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="correct-answer"
                    checked={option.isCorrect}
                    onChange={() => setCorrectOption(option.id)}
                    className="w-5 h-5 text-green-600"
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                    placeholder={`Option ${index + 1}`}
                  />
                  {currentQuestion.options!.length > 2 && (
                    <button
                      onClick={() => removeOption(option.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addOption}
              className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              + Add Option
            </button>
          </div>
        )}

        {currentQuestion.type === 'true_false' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: true })}
                className={`px-6 py-3 rounded-lg border-2 font-medium ${
                  currentQuestion.correctAnswer === true
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                True
              </button>
              <button
                onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: false })}
                className={`px-6 py-3 rounded-lg border-2 font-medium ${
                  currentQuestion.correctAnswer === false
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                False
              </button>
            </div>
          </div>
        )}

        {(currentQuestion.type === 'identification' || currentQuestion.type === 'essay') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sample Answer (Optional)
            </label>
            <textarea
              value={currentQuestion.sampleAnswer || ''}
              onChange={(e) =>
                setCurrentQuestion({ ...currentQuestion, sampleAnswer: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              placeholder="Provide a sample answer for reference..."
            />
          </div>
        )}

        <button
          onClick={addQuestion}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          Add Question
        </button>
      </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Questions ({questions.length})
          </h3>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">Q{index + 1}.</span>
                      <span className="px-2 py-1 bg-gray-200 rounded text-xs font-medium">
                        {question.type.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {question.points} pts
                      </span>
                    </div>
                    <p className="text-gray-700">{question.question}</p>
                  </div>
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={questions.length === 0}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-lg transition-colors"
        >
          Next: Settings
        </button>
      </div>
    </div>
  );
}
