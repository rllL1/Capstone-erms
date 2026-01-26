'use client';

import { useState } from 'react';
import type { Examination } from '@/types/assessment';

interface ExaminationActionsProps {
  examination: Examination;
}

export default function ExaminationActions({ examination }: ExaminationActionsProps) {
  const [showViewModal, setShowViewModal] = useState(false);

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${examination.title}</title>
          <style>
            @page { margin: 1in; }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
            }
            .header {
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .header-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
            }
            .header-field {
              flex: 1;
              padding-right: 20px;
            }
            .header-field label {
              font-weight: bold;
              margin-right: 5px;
            }
            .header-field .line {
              border-bottom: 1px solid #000;
              display: inline-block;
              min-width: 200px;
            }
            .title {
              text-align: center;
              font-size: 16pt;
              font-weight: bold;
              margin: 20px 0;
              text-transform: uppercase;
            }
            .question {
              margin: 20px 0;
              page-break-inside: avoid;
            }
            .question-header {
              font-weight: bold;
              font-size: 11pt;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            .question-text {
              margin-bottom: 10px;
              margin-left: 10px;
            }
            .options {
              margin-left: 30px;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-row">
              <div class="header-field">
                <label>Name:</label>
                <span class="line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </div>
              <div class="header-field">
                <label>Date:</label>
                <span class="line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </div>
            </div>
            <div class="header-row">
              <div class="header-field">
                <label>Course:</label>
                <span class="line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </div>
              <div class="header-field">
                <label>Subject:</label>
                <span class="line">${examination.subject}</span>
              </div>
            </div>
          </div>

          <div class="title">${examination.title}</div>

          ${examination.questions.map((question, index) => `
            <div class="question">
              <div class="question-header">
                Test${index + 1}. ${
                  question.type === 'multiple_choice' ? 'Multiple Choice' :
                  question.type === 'true_false' ? 'True or False' :
                  question.type === 'identification' ? 'Identification' :
                  question.type === 'essay' ? 'Essay' : 'Question'
                } (${question.points || 0} points)
              </div>
              <div class="question-text"><strong>Q${index + 1}.</strong> ${question.question}</div>
              ${question.type === 'multiple_choice' && question.options ? `
                <div class="options">
                  ${question.options.map((opt, i) => `
                    <div>${String.fromCharCode(65 + i)}. ${opt.text}</div>
                  `).join('')}
                </div>
              ` : question.type === 'true_false' ? `
                <div class="options">
                  <div>A. True</div>
                  <div>B. False</div>
                </div>
              ` : `<div style="border-bottom: 1px solid #000; min-height: 50px; margin-top: 10px;"></div>`}
            </div>
          `).join('')}

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 14pt; cursor: pointer;">Print / Save as PDF</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <>
      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={() => setShowViewModal(true)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </button>

        <button
          onClick={handlePrintPDF}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print PDF
        </button>

        {examination.status === 'rejected' && (
          <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Revise
          </button>
        )}
      </div>

      {showViewModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">{examination.title}</h3>
              <button onClick={() => setShowViewModal(false)} className="text-white hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <div className="mb-8 grid grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Exam Type</label>
                  <p className="text-lg font-bold text-gray-900 mt-2">{examination.exam_type.toUpperCase()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Subject</label>
                  <p className="text-lg font-bold text-gray-900 mt-2">{examination.subject}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Year Level</label>
                  <p className="text-lg font-bold text-gray-900 mt-2">{examination.year_level}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Semester</label>
                  <p className="text-lg font-bold text-gray-900 mt-2">{examination.semester}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                  <p className="mt-2">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      examination.status === 'approved' ? 'bg-green-100 text-green-800' :
                      examination.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      examination.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {examination.status.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Questions</label>
                  <p className="text-lg font-bold text-gray-900 mt-2">{examination.questions.length}</p>
                </div>
              </div>

              {examination.description && (
                <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <label className="text-sm font-semibold text-blue-900">Description</label>
                  <p className="text-gray-800 mt-2">{examination.description}</p>
                </div>
              )}

              <div className="border-t-2 border-gray-200 pt-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6">Questions</h4>
                <div className="space-y-6">
                  {examination.questions.map((question, index) => (
                    <div key={question.id} className="bg-white border-2 border-gray-200 rounded-lg p-6">
                      <div className="mb-3">
                        <span className="text-sm font-bold text-purple-700 uppercase">
                          Test{index + 1}. {question.type === 'multiple_choice' ? 'Multiple Choice' : 
                             question.type === 'true_false' ? 'True or False' :
                             question.type === 'identification' ? 'Identification' :
                             question.type === 'essay' ? 'Essay' : 'Question'}
                        </span>
                        <span className="ml-3 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {question.points} pts
                        </span>
                      </div>
                      <div className="flex items-start mb-4">
                        <span className="bg-purple-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3 text-sm flex-shrink-0">
                          {index + 1}
                        </span>
                        <p className="text-gray-800 flex-1">
                          <span className="font-semibold">Q{index + 1}.</span> {question.question}
                        </p>
                      </div>
                      
                      <div className="pl-11">
                        {question.type === 'multiple_choice' && question.options && (
                          <div className="space-y-3">
                            {question.options.map((option, i) => (
                              <div key={option.id} className={`p-3 rounded-lg border-2 ${
                                option.isCorrect ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200'
                              }`}>
                                <span className="font-bold mr-3">{String.fromCharCode(65 + i)}.</span>
                                <span>{option.text}</span>
                                {option.isCorrect && (
                                  <span className="ml-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs">✓ Correct</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {question.type === 'true_false' && (
                          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                            <span className="font-semibold">Correct Answer: </span>
                            <span className="text-lg font-bold text-green-700">
                              {question.correctAnswer ? 'TRUE' : 'FALSE'}
                            </span>
                          </div>
                        )}
                        
                        {(question.type === 'identification' || question.type === 'essay') && question.sampleAnswer && (
                          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                            <div className="font-semibold text-blue-900 mb-2">Sample Answer</div>
                            <p className="text-blue-900">{question.sampleAnswer}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
