'use client';

import { useState } from 'react';
import type { Question, QuestionType, DifficultyLevel } from '@/types/assessment';
import { generateQuestionsWithAI } from './actions';

interface AIQuestionGeneratorProps {
  subject: string;
  gradeLevel: string;
  onQuestionsGenerated: (questions: Question[]) => void;
  onBack: () => void;
}

export default function AIQuestionGenerator({
  subject,
  gradeLevel,
  onQuestionsGenerated,
  onBack,
}: AIQuestionGeneratorProps) {
  const [inputMethod, setInputMethod] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['multiple_choice']);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const toggleQuestionType = (type: QuestionType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleGenerate = async () => {
    if (inputMethod === 'file' && !file) {
      alert('Please upload a file');
      return;
    }
    if (inputMethod === 'text' && !textContent.trim()) {
      alert('Please enter some text content');
      return;
    }
    if (selectedTypes.length === 0) {
      alert('Please select at least one question type');
      return;
    }

    setIsGenerating(true);

    try {
      // Create FormData for server action
      const formData = new FormData();
      
      if (inputMethod === 'file' && file) {
        formData.append('file', file);
      } else if (inputMethod === 'text') {
        formData.append('text', textContent);
      }
      
      formData.append('numberOfQuestions', numberOfQuestions.toString());
      formData.append('questionTypes', JSON.stringify(selectedTypes));
      formData.append('difficulty', difficulty);
      formData.append('subject', subject);
      formData.append('gradeLevel', gradeLevel);

      // Call server action with Gemini AI
      const result = await generateQuestionsWithAI(formData);

      if (result.error) {
        alert(result.error);
        setIsGenerating(false);
        return;
      }

      if (result.questions) {
        onQuestionsGenerated(result.questions);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Question Generator</h2>

      {/* Input Method */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Input Method
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setInputMethod('file')}
            className={`p-4 border-2 rounded-lg font-medium transition-colors ${
              inputMethod === 'file'
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-700'
            }`}
          >
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload File
          </button>
          <button
            onClick={() => setInputMethod('text')}
            className={`p-4 border-2 rounded-lg font-medium transition-colors ${
              inputMethod === 'text'
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-700'
            }`}
          >
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Enter Text
          </button>
        </div>
      </div>

      {/* File Upload */}
      {inputMethod === 'file' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Document
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {file ? (
                <p className="text-green-600 font-medium">{file.name}</p>
              ) : (
                <>
                  <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">PDF, Word, PowerPoint, or Text files</p>
                </>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Text Input */}
      {inputMethod === 'text' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Content
          </label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
            placeholder="Paste your content here... AI will analyze this and generate relevant questions."
          />
        </div>
      )}

      {/* Number of Questions */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Questions
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={numberOfQuestions}
          onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 1)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
        />
      </div>

      {/* Question Types */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Types (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'multiple_choice', label: 'Multiple Choice' },
            { value: 'true_false', label: 'True or False' },
            { value: 'identification', label: 'Identification' },
            { value: 'essay', label: 'Essay Writing' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => toggleQuestionType(type.value as QuestionType)}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                selectedTypes.includes(type.value as QuestionType)
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Difficulty Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['easy', 'medium', 'hard'].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level as DifficultyLevel)}
              className={`px-4 py-3 rounded-lg border-2 font-medium capitalize transition-colors ${
                difficulty === level
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium">AI will analyze your content and generate questions automatically.</p>
            <p className="mt-1">You can edit all generated questions before publishing the assessment.</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isGenerating}
          className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 font-medium rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Questions...
            </>
          ) : (
            'Generate Questions with AI'
          )}
        </button>
      </div>
    </div>
  );
}
