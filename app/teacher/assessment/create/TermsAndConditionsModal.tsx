'use client';

interface TermsAndConditionsModalProps {
  onAccept: () => void;
  onDecline: () => void;
  isSaving?: boolean;
}

export default function TermsAndConditionsModal({
  onAccept,
  onDecline,
  isSaving = false,
}: TermsAndConditionsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Assessment Policy and Terms & Conditions
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Please read and accept the terms before publishing
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            {/* Academic Integrity */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                1. Academic Integrity and Anti-Cheating Rules
              </h3>
              <p className="text-sm leading-relaxed">
                By creating and publishing this assessment, I confirm that:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                <li>All questions are designed to fairly assess student knowledge</li>
                <li>The assessment promotes academic honesty and discourages cheating</li>
                <li>Appropriate measures will be taken to prevent unauthorized access</li>
                <li>Students will be informed of academic integrity expectations</li>
                <li>Violations of academic integrity will be reported and addressed</li>
              </ul>
            </section>

            {/* AI-Generated Content */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                2. Responsible Use of AI-Generated Content
              </h3>
              <p className="text-sm leading-relaxed">
                If using AI to generate questions, I agree to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                <li>Review all AI-generated questions for accuracy and appropriateness</li>
                <li>Edit or remove any questions that are unclear, biased, or incorrect</li>
                <li>Ensure AI-generated content aligns with learning objectives</li>
                <li>Take full responsibility for the final assessment content</li>
                <li>Not rely solely on AI without human oversight and validation</li>
              </ul>
            </section>

            {/* Accuracy and Fairness */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                3. Accuracy and Fairness of Questions
              </h3>
              <p className="text-sm leading-relaxed">
                I certify that:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                <li>All questions have been reviewed for factual accuracy</li>
                <li>Correct answers have been properly identified and verified</li>
                <li>Questions are appropriate for the specified grade level</li>
                <li>The assessment is fair and unbiased</li>
                <li>Questions are clear and free from ambiguity</li>
                <li>The difficulty level matches the stated expectations</li>
              </ul>
            </section>

            {/* Data Privacy */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                4. Data Privacy and Protection
              </h3>
              <p className="text-sm leading-relaxed">
                Regarding uploaded documents and student data:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                <li>Uploaded files do not contain sensitive or confidential information</li>
                <li>Student privacy will be protected at all times</li>
                <li>Assessment results will be handled in accordance with school policy</li>
                <li>Personal data will not be shared without proper authorization</li>
                <li>All data will be stored securely and deleted when no longer needed</li>
              </ul>
            </section>

            {/* Copyright Compliance */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                5. Copyright Compliance
              </h3>
              <p className="text-sm leading-relaxed">
                I confirm that:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                <li>I have the right to use all uploaded materials</li>
                <li>Content does not infringe on any copyrights or intellectual property</li>
                <li>Proper attribution has been given where required</li>
                <li>Fair use guidelines have been followed for educational purposes</li>
                <li>I will address any copyright concerns immediately if raised</li>
              </ul>
            </section>

            {/* Professional Responsibility */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                6. Professional Responsibility
              </h3>
              <p className="text-sm leading-relaxed">
                As an educator, I commit to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                <li>Using assessments as tools for learning and improvement</li>
                <li>Providing timely and constructive feedback to students</li>
                <li>Maintaining the confidentiality of assessment content before publication</li>
                <li>Ensuring assessments align with curriculum standards</li>
                <li>Acting in the best educational interest of students</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-start mb-4">
            <input
              type="checkbox"
              id="terms-checkbox"
              className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="terms-checkbox" className="ml-3 text-sm text-gray-700">
              <span className="font-medium">
                I have read and agree to the Assessment Policy and Terms & Conditions
              </span>
              <br />
              <span className="text-gray-500">
                By accepting, I confirm that I will comply with all stated policies and guidelines.
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onDecline}
              disabled={isSaving}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 font-medium rounded-lg transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => {
                const checkbox = document.getElementById('terms-checkbox') as HTMLInputElement;
                if (!checkbox.checked) {
                  alert('Please check the agreement box to proceed');
                  return;
                }
                onAccept();
              }}
              disabled={isSaving}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Publishing...
                </>
              ) : (
                'Accept & Publish Assessment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
