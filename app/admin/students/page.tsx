'use client';

import { useEffect, useState } from 'react';
import { approveStudent, rejectStudent, fetchStudents as fetchStudentsAction } from './actions';

interface Student {
  id: string;
  student_id: string;
  fullname: string;
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  course: string;
  status: string;
  created_at: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'inactive'>('all');

  const loadStudents = async () => {
    setLoading(true);
    const result = await fetchStudentsAction(filter);
    setStudents(result.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadStudents();
  }, [filter]);

  const handleApprove = async (studentId: string) => {
    const result = await approveStudent(studentId);
    if (result.success) {
      loadStudents();
    } else {
      alert(result.error || 'Failed to approve student');
    }
  };

  const handleReject = async (studentId: string) => {
    const result = await rejectStudent(studentId);
    if (result.success) {
      loadStudents();
    } else {
      alert(result.error || 'Failed to reject student');
    }
  };

  const pendingCount = students.filter((s) => s.status === 'pending').length;
  const approvedCount = students.filter((s) => s.status === 'approved').length;
  const inactiveCount = students.filter((s) => s.status === 'inactive').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600 mt-2">Approve or reject student registrations</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-purple-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Total Students</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">{students.length}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-yellow-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Pending Approval</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-green-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Approved</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">{approvedCount}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-red-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Inactive</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">{inactiveCount}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                filter === 'all'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All ({students.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                filter === 'pending'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                filter === 'approved'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                filter === 'inactive'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </nav>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">No students found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.student_id}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.fullname}</div>
                      {student.firstname && (
                        <div className="text-xs text-gray-500">
                          {student.firstname} {student.middlename} {student.lastname}
                        </div>
                      )}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{student.email}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{student.course || 'N/A'}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : student.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(student.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {student.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(student.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(student.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {student.status === 'approved' && (
                        <span className="text-green-600">Active</span>
                      )}
                      {student.status === 'inactive' && (
                        <button
                          onClick={() => handleApprove(student.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
