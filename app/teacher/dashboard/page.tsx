import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function TeacherDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch statistics
  const { count: assessmentCount } = await supabase
    .from('assessments')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id);

  const { count: examinationCount } = await supabase
    .from('examinations')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id);

  const { count: groupCount } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id);

  // Get total students across all groups
  const { data: groups } = await supabase
    .from('groups')
    .select('student_count')
    .eq('teacher_id', user.id);

  const totalStudents = groups?.reduce((sum, group) => sum + (group.student_count || 0), 0) || 0;

  // Fetch recent assessments
  const { data: recentAssessments } = await supabase
    .from('assessments')
    .select('id, title, type, created_at')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch recent groups
  const { data: recentGroups } = await supabase
    .from('groups')
    .select('id, name, subject, student_count, material_count')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })
    .limit(4);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.fullname}!
        </h1>
        <p className="text-gray-600 mt-2">Here&apos;s what&apos;s happening with your classes today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Assessments */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-purple-200 p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Total Assessments</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">{assessmentCount || 0}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Examinations */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-blue-200 p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Total Examinations</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">{examinationCount || 0}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        {/* Groups */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-green-200 p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Active Groups</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">{groupCount || 0}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Students */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-orange-200 p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Total Students</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">{totalStudents}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
          <Link
            href="/teacher/assessment/create"
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg lg:rounded-xl shadow-sm border border-purple-200 p-4 lg:p-6 hover:shadow-lg transition-all hover:border-purple-400 hover:from-purple-100 hover:to-purple-200 group"
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm lg:text-base font-bold text-gray-900">Create Assessment</h3>
                <p className="text-xs lg:text-sm text-purple-700">Quiz or Assignment</p>
              </div>
            </div>
          </Link>

          <Link
            href="/teacher/examination/create"
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg lg:rounded-xl shadow-sm border border-blue-200 p-4 lg:p-6 hover:shadow-lg transition-all hover:border-blue-400 hover:from-blue-100 hover:to-blue-200 group"
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm lg:text-base font-bold text-gray-900">Create Examination</h3>
                <p className="text-xs lg:text-sm text-blue-700">Formal Test</p>
              </div>
            </div>
          </Link>

          <Link
            href="/teacher/group/create"
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg lg:rounded-xl shadow-sm border border-green-200 p-4 lg:p-6 hover:shadow-lg transition-all hover:border-green-400 hover:from-green-100 hover:to-green-200 group"
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm lg:text-base font-bold text-gray-900">Create Group</h3>
                <p className="text-xs lg:text-sm text-green-700">New Classroom</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        {/* Recent Assessments */}
        <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-lg lg:rounded-xl shadow-md border border-purple-200 p-4 lg:p-6">
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-base lg:text-xl font-bold text-gray-900">Recent Assessments</h2>
            </div>
            <Link href="/teacher/assessment" className="text-purple-600 hover:text-purple-700 text-xs lg:text-sm font-semibold hover:underline flex-shrink-0">
              View All →
            </Link>
          </div>
          
          {recentAssessments && recentAssessments.length > 0 ? (
            <div className="space-y-3">
              {recentAssessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-purple-50 transition-all shadow-sm border border-purple-100 hover:border-purple-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{assessment.title}</p>
                      <p className="text-sm text-purple-600 font-medium">{assessment.type}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {new Date(assessment.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-purple-100">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-2">No assessments yet</p>
              <p className="text-gray-500 text-sm mb-4">Start creating quizzes and assignments</p>
              <Link
                href="/teacher/assessment/create"
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Assessment
              </Link>
            </div>
          )}
        </div>

        {/* My Groups */}
        <div className="bg-gradient-to-br from-green-50 via-white to-green-50 rounded-lg lg:rounded-xl shadow-md border border-green-200 p-4 lg:p-6">
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-base lg:text-xl font-bold text-gray-900">My Groups</h2>
            </div>
            <Link href="/teacher/group" className="text-green-600 hover:text-green-700 text-xs lg:text-sm font-semibold hover:underline flex-shrink-0">
              View All →
            </Link>
          </div>
          
          {recentGroups && recentGroups.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {recentGroups.map((group) => (
                <Link
                  key={group.id}
                  href={`/teacher/group/${group.id}`}
                  className="p-4 bg-white rounded-lg hover:bg-green-50 transition-all shadow-sm border border-green-100 hover:border-green-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{group.name}</h3>
                        <p className="text-sm text-green-600 font-medium">{group.subject}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                    <span className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="font-semibold">{group.student_count || 0}</span> students
                    </span>
                    <span className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-semibold">{group.material_count || 0}</span> materials
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-green-100">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-2">No groups yet</p>
              <p className="text-gray-500 text-sm mb-4">Create classroom groups for your students</p>
              <Link
                href="/teacher/group/create"
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Group
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
