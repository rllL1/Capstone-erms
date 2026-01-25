'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ManualQuestionBuilder from './ManualQuestionBuilder';
import AIQuestionGenerator from './AIQuestionGenerator';
import AssessmentSettingsForm from './AssessmentSettingsForm';
import TermsAndConditionsModal from './TermsAndConditionsModal';
import { createAssessment } from './actions';
import type { Question, AssessmentSettings } from '@/types/assessment';

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [creationMethod, setCreationMethod] = useState<'ai' | 'manual' | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<AssessmentSettings>({
    totalPoints: 0,
    timeLimit: 60,
    randomizeQuestions: false,
    allowMultipleAttempts: false,
    availableFrom: '',
    availableUntil: '',
  });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');

  const handleQuestionsGenerated = (generatedQuestions: Question[]) => {
    setQuestions(generatedQuestions);
    const totalPoints = generatedQuestions.reduce((sum, q) => sum + q.points, 0);
    setSettings((prev) => ({ ...prev, totalPoints }));
    setStep(3);
  };

  const handleSettingsComplete = (newSettings: AssessmentSettings) => {
    setSettings(newSettings);
    setShowTermsModal(true);
  };

  const handleTermsAccept = async () => {
    setShowTermsModal(false);
    setIsSaving(true);

    try {
      const result = await createAssessment({
        title,
        description,
        subject,
        grade_level: gradeLevel,
        questions,
        settings,
        terms_accepted: true,
        generation_method: creationMethod || 'manual',
      });

      if (result.error) {
        alert(result.error);
        setIsSaving(false);
        return;
      }

      // Success - redirect to assessment list
      router.push('/teacher/assessment');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save assessment. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= s
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    step > s ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={step >= 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}>
            Basic Info
          </span>
          <span className={step >= 2 ? 'text-gray-900 font-medium' : 'text-gray-500'}>
            Questions
          </span>
          <span className={step >= 3 ? 'text-gray-900 font-medium' : 'text-gray-500'}>
            Settings
          </span>
          <span className={step >= 4 ? 'text-gray-900 font-medium' : 'text-gray-500'}>
            Review
          </span>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                placeholder="e.g., Math Quiz - Chapter 5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                placeholder="Brief description of the assessment"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level *
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                >
                  <option value="">Select level</option>
                  <option value="Grade 11">Grade 11 (Senior High)</option>
                  <option value="Grade 12">Grade 12 (Senior High)</option>
                  <option value="1st Year College">1st Year College</option>
                  <option value="2nd Year College">2nd Year College</option>
                  <option value="3rd Year College">3rd Year College</option>
                  <option value="4th Year College">4th Year College</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Link
                href="/teacher/assessment"
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={() => setStep(2)}
                disabled={!title || !subject || !gradeLevel}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-lg transition-colors"
              >
                Next: Choose Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Choose Creation Method */}
      {step === 2 && !creationMethod && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Creation Method</h2>
          <p className="text-gray-500 mb-8">How would you like to create questions?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Generation */}
            <button
              onClick={() => setCreationMethod('ai')}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-600">
                <svg
                  className="w-6 h-6 text-green-600 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Generated Questions</h3>
              <p className="text-sm text-gray-600">
                Upload documents or text and let AI generate questions automatically
              </p>
            </button>

            {/* Manual Input */}
            <button
              onClick={() => setCreationMethod('manual')}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-green-600">
                <svg
                  className="w-6 h-6 text-gray-600 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manual Input</h3>
              <p className="text-sm text-gray-600">
                Create questions manually with full control over content and format
              </p>
            </button>
          </div>

          <div className="flex justify-between pt-8">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 2: AI Generation */}
      {step === 2 && creationMethod === 'ai' && (
        <AIQuestionGenerator
          subject={subject}
          gradeLevel={gradeLevel}
          onQuestionsGenerated={handleQuestionsGenerated}
          onBack={() => setCreationMethod(null)}
        />
      )}

      {/* Step 2: Manual Input */}
      {step === 2 && creationMethod === 'manual' && (
        <ManualQuestionBuilder
          questions={questions}
          onQuestionsUpdated={(newQuestions: Question[]) => {
            setQuestions(newQuestions);
            const totalPoints = newQuestions.reduce((sum: number, q: Question) => sum + q.points, 0);
            setSettings((prev) => ({ ...prev, totalPoints }));
          }}
          onNext={() => setStep(3)}
          onBack={() => setCreationMethod(null)}
        />
      )}

      {/* Step 3: Settings */}
      {step === 3 && (
        <AssessmentSettingsForm
          settings={settings}
          totalPoints={settings.totalPoints}
          onComplete={handleSettingsComplete}
          onBack={() => setStep(2)}
        />
      )}

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <TermsAndConditionsModal
          onAccept={handleTermsAccept}
          onDecline={() => setShowTermsModal(false)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
