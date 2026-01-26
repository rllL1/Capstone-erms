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
              {file ? (
                <div className="flex items-center justify-center space-x-3">
                  {/* File Type Icon */}
                  {file.name.endsWith('.pdf') && (
                    <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M6,20V4H12V10H18V20H6M10.1,11.4C10.08,11.44 9.81,13.16 8,16.09C8,16.09 4.5,17.91 5.33,19.27C6,20.35 7.65,19.23 9.07,16.59C9.07,16.59 10.89,15.95 13.31,15.77C13.31,15.77 17.17,17.5 17.7,15.66C18.22,13.8 14.64,14.22 14,14.41C14,14.41 12,13.06 11.5,11.2C11.5,11.2 12.64,7.25 10.89,7.3C9.14,7.35 9.8,10.43 10.1,11.4M10.91,12.44C10.94,12.45 11.38,13.65 12.8,14.9C12.8,14.9 10.47,15.36 9.41,15.8C9.41,15.8 10.41,14.07 10.91,12.44M14.84,15.16C15.42,15 17.17,15.31 17.1,15.64C17.04,15.97 14.84,15.16 14.84,15.16M7.77,17C7.24,18.24 6.33,19.2 6.1,19C5.87,18.8 6.8,17.39 7.77,17M10.91,10.07C10.91,10 10.55,7.87 10.91,7.92C11.45,8 10.91,10 10.91,10.07Z" />
                    </svg>
                  )}
                  {(file.name.endsWith('.doc') || file.name.endsWith('.docx')) && (
                    <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M15.2,10H14.8L14,14.8L13,10H11.5L10.5,14.8L9.8,10H9.3L10.3,16H11.3L12.3,12.3L13.3,16H14.3L15.2,10Z" />
                    </svg>
                  )}
                  {(file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) && (
                    <svg className="w-12 h-12 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M15,11H13V13H15C15.6,13 16,12.6 16,12C16,11.4 15.6,11 15,11M14,14H10V9H14C15.1,9 16,9.9 16,11V12C16,13.1 15.1,14 14,14Z" />
                    </svg>
                  )}
                  {file.name.endsWith('.txt') && (
                    <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19H12V18H13C13.6,18 14,17.6 14,17V15C14,14.4 13.6,14 13,14H10V19M12,16H11V15H12V16Z" />
                    </svg>
                  )}
                  <div className="text-left">
                    <p className="text-green-600 font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
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
