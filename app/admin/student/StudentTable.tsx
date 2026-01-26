'use client';

import { useState } from 'react';
import type { Profile } from '@/types/database';
import { approveStudent, rejectStudent, archiveStudent } from './actions';

interface StudentTableProps {
  students: (Profile & { email?: string })[];
}

export default function StudentTable({ students }: StudentTableProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleApprove = async (studentId: string) => {
    if (!confirm('Are you sure you want to approve this student?')) return;
    
    setIsLoading(studentId);
    const result = await approveStudent(studentId);
    setIsLoading(null);
    
    if (result.error) {
      alert(result.error);
    } else {
      window.location.reload();
    }
  };

  const handleReject = async (studentId: string) => {
    if (!confirm('Are you sure you want to reject this student?')) return;
    
    setIsLoading(studentId);
    const result = await rejectStudent(studentId);
    setIsLoading(null);
    
    if (result.error) {
      alert(result.error);
    } else {
      window.location.reload();
    }
  };

  const handleArchive = async (studentId: string) => {
    if (!confirm('Are you sure you want to archive this student?')) return;
    
    setIsLoading(studentId);
    const result = await archiveStudent(studentId);
    setIsLoading(null);
    
    if (result.error) {
      alert(result.error);
    } else {
      window.location.reload();
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, student ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registered On
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.student_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.fullname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(student.status)}`}>
                      {student.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {student.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(student.id)}
                            disabled={isLoading === student.id}
                            className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(student.id)}
                            disabled={isLoading === student.id}
                            className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {student.status === 'active' && (
                        <button
                          onClick={() => handleArchive(student.id)}
                          disabled={isLoading === student.id}
                          className="text-gray-600 hover:text-gray-900 disabled:text-gray-400"
                        >
                          Archive
                        </button>
                      )}
                      {student.status === 'rejected' && (
                        <button
                          onClick={() => handleApprove(student.id)}
                          disabled={isLoading === student.id}
                          className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total Students: {students.length}</span>
          <div className="flex gap-4">
            <span>Pending: {students.filter(s => s.status === 'pending').length}</span>
            <span>Active: {students.filter(s => s.status === 'active').length}</span>
            <span>Rejected: {students.filter(s => s.status === 'rejected').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
