'use client';

import { useState } from 'react';
import type { AssessmentSettings } from '@/types/assessment';

interface AssessmentSettingsFormProps {
  settings: AssessmentSettings;
  totalPoints: number;
  onComplete: (settings: AssessmentSettings) => void;
  onBack: () => void;
}

export default function AssessmentSettingsForm({
  settings,
  totalPoints,
  onComplete,
  onBack,
}: AssessmentSettingsFormProps) {
  const [formData, setFormData] = useState<AssessmentSettings>({
    ...settings,
    totalPoints,
  });

  const handleSubmit = () => {
    if (!formData.availableFrom || !formData.availableUntil) {
      alert('Please set availability dates');
      return;
    }

    onComplete(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Assessment Settings</h2>

      <div className="space-y-6">
        {/* Total Points (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Points
          </label>
          <input
            type="number"
            value={formData.totalPoints}
            readOnly
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">
            Calculated from question points
          </p>
        </div>

        {/* Time Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Limit (minutes)
          </label>
          <input
            type="number"
            min="1"
            value={formData.timeLimit}
            onChange={(e) =>
              setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 0 })
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
          />
        </div>

        {/* Passing Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passing Score (Optional)
          </label>
          <input
            type="number"
            min="0"
            max={formData.totalPoints}
            value={formData.passingScore || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                passingScore: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
            placeholder={`e.g., ${Math.floor(formData.totalPoints * 0.75)}`}
          />
        </div>

        {/* Availability Dates */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available From *
            </label>
            <input
              type="datetime-local"
              value={formData.availableFrom}
              onChange={(e) =>
                setFormData({ ...formData, availableFrom: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Until *
            </label>
            <input
              type="datetime-local"
              value={formData.availableUntil}
              onChange={(e) =>
                setFormData({ ...formData, availableUntil: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
            />
          </div>
        </div>

        {/* Randomize Questions */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-900">
              Randomize Questions
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Questions will appear in random order for each student
            </p>
          </div>
          <button
            onClick={() =>
              setFormData({
                ...formData,
                randomizeQuestions: !formData.randomizeQuestions,
              })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.randomizeQuestions ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.randomizeQuestions ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Multiple Attempts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Allow Multiple Attempts
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Students can retake the assessment
              </p>
            </div>
            <button
              onClick={() =>
                setFormData({
                  ...formData,
                  allowMultipleAttempts: !formData.allowMultipleAttempts,
                  maxAttempts: formData.allowMultipleAttempts ? undefined : 3,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.allowMultipleAttempts ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.allowMultipleAttempts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {formData.allowMultipleAttempts && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Attempts
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxAttempts || 3}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxAttempts: parseInt(e.target.value) || 3,
                  })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          Review & Publish
        </button>
      </div>
    </div>
  );
}
