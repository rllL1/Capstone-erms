'use client';

import { useState } from 'react';
import { approveExamination, rejectExamination } from './actions';
import type { Examination } from '@/types/assessment';

interface ApprovalActionsProps {
  examination: Examination;
}

export default function ApprovalActions({ examination }: ApprovalActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this examination?')) return;

    setIsProcessing(true);
    const result = await approveExamination(examination.id);

    if (result.error) {
      alert(result.error);
    } else {
      alert('Examination approved successfully!');
    }
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    const result = await rejectExamination(examination.id, rejectionReason);

    if (result.error) {
      alert(result.error);
    } else {
      alert('Examination rejected.');
      setShowRejectModal(false);
      setRejectionReason('');
    }
    setIsProcessing(false);
  };

  if (examination.status === 'approved') {
    return (
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm text-gray-500">Approved</span>
      </div>
    );
  }

  if (examination.status === 'rejected') {
    return (
      <div className="text-sm text-gray-500">
        <div className="flex items-center space-x-2 mb-1">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Rejected</span>
        </div>
        {examination.rejection_reason && (
          <p className="text-xs text-gray-400 italic">&quot;{examination.rejection_reason}&quot;</p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleApprove}
          disabled={isProcessing}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm rounded-lg transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Approve'}
        </button>
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={isProcessing}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm rounded-lg transition-colors"
        >
          Reject
        </button>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Examination</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this examination. The teacher will be notified.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 mb-4"
              placeholder="Enter reason for rejection..."
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                disabled={isProcessing}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
