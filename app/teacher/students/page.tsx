import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface Student {
  id: string;
  student_id: string;
  fullname: string;
  email: string;
  course: string;
  status: string;
  created_at: string;
}

export default async function TeacherStudentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all students
  const { data: students } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false });

  const allStudents: Student[] = students || [];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-600 mt-2">Monitor student registrations and login activity</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-green-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Total Students</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">{allStudents.length}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-blue-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Approved</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">
                {allStudents.filter((s) => s.status === 'approved').length}
              </p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-yellow-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Pending</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">
                {allStudents.filter((s) => s.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-red-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Inactive</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">
                {allStudents.filter((s) => s.status === 'inactive').length}
              </p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h2 className="text-lg lg:text-xl font-bold text-gray-900">All Students</h2>
        </div>

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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">No students registered yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                allStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.student_id}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.fullname}</div>
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
