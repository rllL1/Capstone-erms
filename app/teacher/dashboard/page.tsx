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
      {/* Welcome Section with Soft Light Header */}
      <div className="mb-6 lg:mb-8 p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border border-purple-100 shadow-sm">
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Welcome back, {profile?.fullname}!
        </h1>
        <p className="text-gray-600 text-base lg:text-lg font-medium">Here&apos;s what&apos;s happening with your classes today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Assessments */}
        <div className="group bg-white rounded-2xl shadow-md border border-purple-200 p-4 lg:p-6 hover:shadow-xl hover:border-purple-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Assessments</p>
              <p className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{assessmentCount || 0}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Examinations */}
        <div className="group bg-white rounded-2xl shadow-md border border-blue-200 p-4 lg:p-6 hover:shadow-xl hover:border-blue-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Examinations</p>
              <p className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{examinationCount || 0}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        {/* Groups */}
        <div className="group bg-white rounded-2xl shadow-md border border-green-200 p-4 lg:p-6 hover:shadow-xl hover:border-green-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Groups</p>
              <p className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{groupCount || 0}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Students */}
        <div className="group bg-white rounded-2xl shadow-md border border-orange-200 p-4 lg:p-6 hover:shadow-xl hover:border-orange-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Students</p>
              <p className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{totalStudents}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <Link
            href="/teacher/assessment/create"
            className="group relative overflow-hidden rounded-2xl shadow-md border border-purple-200 p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white hover:border-purple-400"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg mb-4 lg:mb-5 group-hover:shadow-xl group-hover:scale-110 transition-all">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">Create Assessment</h3>
              <p className="text-sm text-gray-600 mb-3">Quiz or Assignment</p>
              <div className="inline-block text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Create →</div>
            </div>
          </Link>

          <Link
            href="/teacher/examination/create"
            className="group relative overflow-hidden rounded-2xl shadow-md border border-blue-200 p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white hover:border-blue-400"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg mb-4 lg:mb-5 group-hover:shadow-xl group-hover:scale-110 transition-all">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Create Examination</h3>
              <p className="text-sm text-gray-600 mb-3">Formal Test</p>
              <div className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Create →</div>
            </div>
          </Link>

          <Link
            href="/teacher/group/create"
            className="group relative overflow-hidden rounded-2xl shadow-md border border-green-200 p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white hover:border-green-400"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg mb-4 lg:mb-5 group-hover:shadow-xl group-hover:scale-110 transition-all">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">Create Group</h3>
              <p className="text-sm text-gray-600 mb-3">New Classroom</p>
              <div className="inline-block text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Create →</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Assessments */}
        <div className="bg-white rounded-2xl shadow-md border border-purple-200 p-6 lg:p-8 hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Recent Assessments</h2>
              </div>
            </div>
            <Link href="/teacher/assessment" className="text-purple-600 hover:text-purple-700 text-xs lg:text-sm font-semibold hover:underline shrink-0">
              View All →
            </Link>
          </div>
          
          {recentAssessments && recentAssessments.length > 0 ? (
            <div className="space-y-3 lg:space-y-4">
              {recentAssessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-4 lg:p-5 bg-gradient-to-br from-purple-50 to-white rounded-xl lg:rounded-2xl border border-purple-200 shadow-sm hover:shadow-md hover:border-purple-400 transition-all">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md shrink-0">
                      <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base lg:text-lg">{assessment.title}</p>
                      <p className="text-sm text-purple-600 font-semibold">{assessment.type}</p>
                    </div>
                  </div>
                  <span className="text-xs lg:text-sm font-semibold text-gray-600 bg-purple-100 px-3 py-1.5 rounded-full shrink-0">
                    {new Date(assessment.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 lg:py-16 bg-gradient-to-br from-purple-50 to-white rounded-xl lg:rounded-2xl border border-purple-200">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-5">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-700 font-bold mb-2 text-lg">No assessments yet</p>
              <p className="text-gray-600 text-sm mb-5 lg:mb-6">Start creating quizzes and assignments for your students</p>
              <Link
                href="/teacher/assessment/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm lg:text-base font-bold rounded-lg lg:rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Assessment
              </Link>
            </div>
          )}
        </div>

        {/* My Groups */}
        <div className="bg-white rounded-2xl shadow-md border border-green-200 p-6 lg:p-8 hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">My Groups</h2>
              </div>
            </div>
            <Link href="/teacher/group" className="text-green-600 hover:text-green-700 text-xs lg:text-sm font-semibold hover:underline shrink-0">
              View All →
            </Link>
          </div>
          
          {recentGroups && recentGroups.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 lg:gap-4">
              {recentGroups.map((group) => (
                <Link
                  key={group.id}
                  href={`/teacher/group/${group.id}`}
                  className="p-4 lg:p-5 bg-gradient-to-br from-green-50 to-white rounded-xl lg:rounded-2xl border border-green-200 hover:border-green-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3 lg:gap-4">
                    <div className="flex items-center gap-3 lg:gap-4 flex-1">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md shrink-0">
                        <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base lg:text-lg">{group.name}</h3>
                        <p className="text-sm text-green-600 font-semibold">{group.subject}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-gray-700 mt-4 flex-wrap">
                    <span className="flex items-center gap-1.5 bg-green-100 px-3 py-1.5 rounded-full font-semibold text-green-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {group.student_count || 0} students
                    </span>
                    <span className="flex items-center gap-1.5 bg-blue-100 px-3 py-1.5 rounded-full font-semibold text-blue-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {group.material_count || 0} materials
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 lg:py-16 bg-gradient-to-br from-green-50 to-white rounded-xl lg:rounded-2xl border border-green-200">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-5">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-700 font-bold mb-2 text-lg">No groups yet</p>
              <p className="text-gray-600 text-sm mb-5 lg:mb-6">Create classroom groups to manage your students effectively</p>
              <Link
                href="/teacher/group/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm lg:text-base font-bold rounded-lg lg:rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Group
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
