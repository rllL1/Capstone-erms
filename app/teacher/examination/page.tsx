import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Examination } from '@/types/assessment';
import ExaminationActions from './ExaminationActions';

export default async function ExaminationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch examinations
  const { data: examinations } = await supabase
    .from('examinations')
    .select('*')
    .eq('teacher_id', user?.id)
    .order('created_at', { ascending: false });

  const exams = (examinations as Examination[]) || [];

  // Stats
  const totalExams = exams.length;
  const prelimExams = exams.filter((e) => e.exam_type === 'prelim').length;
  const midtermExams = exams.filter((e) => e.exam_type === 'midterm').length;
  const finalsExams = exams.filter((e) => e.exam_type === 'finals').length;
  const pendingExams = exams.filter((e) => e.status === 'pending').length;
  const approvedExams = exams.filter((e) => e.status === 'approved').length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Examinations</h1>
          <p className="text-gray-600 mt-2">Create and manage college examinations</p>
        </div>
        <Link
          href="/teacher/examination/create"
          className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Examination
        </Link>
      </div>

      {/* Examinations Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
          <h2 className="text-xl font-bold text-gray-900">All Examinations</h2>
          <p className="text-sm text-gray-600 mt-1">View and manage all your examinations</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Exam Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Year Level
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Questions
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-10 h-10 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No examinations yet</h3>
                      <p className="text-gray-500 mb-6">Create your first examination to get started</p>
                      <Link
                        href="/teacher/examination/create"
                        className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Examination
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          exam.exam_type === 'prelim'
                            ? 'bg-green-100 text-green-800'
                            : exam.exam_type === 'midterm'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {exam.exam_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{exam.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{exam.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-sm text-gray-700">{exam.subject}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{exam.year_level}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{exam.questions.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          exam.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : exam.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : exam.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : exam.status === 'draft'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {exam.status}
                      </span>
                      {exam.status === 'rejected' && exam.rejection_reason && (
                        <div className="mt-1 text-xs text-red-600 italic">
                          Reason: {exam.rejection_reason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ExaminationActions examination={exam} />
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
