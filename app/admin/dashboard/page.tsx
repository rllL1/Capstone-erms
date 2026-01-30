import { createClient } from '@/lib/supabase/server';
import type { DashboardStats, Profile } from '@/types/database';

interface EnhancedDashboardStats extends DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalClasses: number;
  totalAssessments: number;
  inactiveTeachers: number;
  inactiveStudents: number;
}

async function getDashboardStats(): Promise<EnhancedDashboardStats> {
  const supabase = await createClient();

  // Fetch teacher stats
  const { data: teachers, error: teacherError } = await supabase
    .from('profiles')
    .select('status')
    .eq('role', 'teacher');

  if (teacherError) {
    console.error('Error fetching teacher stats:', teacherError);
  }

  // Fetch student stats
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('status');

  if (studentError) {
    console.error('Error fetching student stats:', studentError);
  }

  // Fetch classes count
  const { count: classesCount, error: classError } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true });

  if (classError) {
    console.error('Error fetching classes:', classError);
  }

  // Fetch assessments count
  const { count: assessmentsCount, error: assessError } = await supabase
    .from('assessments')
    .select('*', { count: 'exact' });

  if (assessError) {
    console.error('Error fetching assessments:', assessError);
  }

  const totalTeachers = teachers?.length || 0;
  const activeTeachers = teachers?.filter((t) => t.status === 'active').length || 0;
  const archivedTeachers = teachers?.filter((t) => t.status === 'archived').length || 0;
  const inactiveTeachers = totalTeachers - activeTeachers - archivedTeachers;

  const totalStudents = students?.length || 0;
  const activeStudents = students?.filter((s) => s.status === 'active').length || 0;
  const inactiveStudents = totalStudents - activeStudents;

  return {
    totalTeachers,
    activeTeachers,
    archivedTeachers,
    totalStudents,
    activeStudents,
    totalClasses: classesCount || 0,
    totalAssessments: assessmentsCount || 0,
    inactiveTeachers,
    inactiveStudents,
  };
}

async function getRecentActivity(): Promise<Profile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }

  return data || [];
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const recentActivity = await getRecentActivity();

  // Calculate percentages for progress indicators
  const teacherActivePercentage = stats.totalTeachers > 0 ? Math.round((stats.activeTeachers / stats.totalTeachers) * 100) : 0;
  const studentActivePercentage = stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      {/* Welcome Header */}
      <div className="mb-6 lg:mb-8 p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border border-purple-100 shadow-sm">
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          System Overview
        </h1>
        <p className="text-gray-600 text-base lg:text-lg font-medium">Monitor your institution&apos;s key metrics and activities</p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Total Teachers Card */}
        <div className="group bg-white rounded-2xl shadow-md border border-blue-200 p-4 lg:p-6 hover:shadow-xl hover:border-blue-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Total Teachers</p>
              <p className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.totalTeachers}</p>
              <p className="text-xs lg:text-sm text-blue-600 font-semibold mt-2">{stats.activeTeachers} active • {teacherActivePercentage}%</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </div>
          </div>
          {stats.totalTeachers > 0 && (
            <div className="mt-4 bg-blue-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: `${teacherActivePercentage}%` }}></div>
            </div>
          )}
        </div>

        {/* Total Students Card */}
        <div className="group bg-white rounded-2xl shadow-md border border-green-200 p-4 lg:p-6 hover:shadow-xl hover:border-green-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Total Students</p>
              <p className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.totalStudents}</p>
              <p className="text-xs lg:text-sm text-green-600 font-semibold mt-2">{stats.activeStudents} active • {studentActivePercentage}%</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          {stats.totalStudents > 0 && (
            <div className="mt-4 bg-green-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: `${studentActivePercentage}%` }}></div>
            </div>
          )}
        </div>

        {/* Total Classes Card */}
        <div className="group bg-white rounded-2xl shadow-md border border-purple-200 p-4 lg:p-6 hover:shadow-xl hover:border-purple-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Classes</p>
              <p className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{stats.totalClasses}</p>
              <p className="text-xs lg:text-sm text-purple-600 font-semibold mt-2">Group Classes</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Assessments Card */}
        <div className="group bg-white rounded-2xl shadow-md border border-orange-200 p-4 lg:p-6 hover:shadow-xl hover:border-orange-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Assessments</p>
              <p className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{stats.totalAssessments}</p>
              <p className="text-xs lg:text-sm text-orange-600 font-semibold mt-2">Created</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Active Teachers */}
        <div className="group bg-white rounded-2xl shadow-md border border-green-200 p-4 lg:p-6 hover:shadow-xl hover:border-green-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Active Teachers</p>
              <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.activeTeachers}</p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-br from-green-100 to-green-50 rounded-xl border border-green-200 flex items-center justify-center shrink-0">
              <span className="text-sm lg:text-base font-bold text-green-700">{teacherActivePercentage}%</span>
            </div>
          </div>
          <p className="text-xs lg:text-sm text-gray-500 mt-3">Of total teachers</p>
        </div>

        {/* Inactive/Pending Teachers */}
        <div className="group bg-white rounded-2xl shadow-md border border-yellow-200 p-4 lg:p-6 hover:shadow-xl hover:border-yellow-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Inactive/Pending</p>
              <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">{stats.inactiveTeachers}</p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl border border-yellow-200 flex items-center justify-center shrink-0">
              <span className="text-sm lg:text-base font-bold text-yellow-700">{stats.archivedTeachers} archived</span>
            </div>
          </div>
          <p className="text-xs lg:text-sm text-gray-500 mt-3">Requires attention</p>
        </div>

        {/* Inactive Students */}
        <div className="group bg-white rounded-2xl shadow-md border border-red-200 p-4 lg:p-6 hover:shadow-xl hover:border-red-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Inactive Students</p>
              <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{stats.inactiveStudents}</p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-br from-red-100 to-red-50 rounded-xl border border-red-200 flex items-center justify-center shrink-0">
              <span className="text-sm lg:text-base font-bold text-red-700">{stats.inactiveStudents > 0 ? Math.round((stats.inactiveStudents / stats.totalStudents) * 100) : 0}%</span>
            </div>
          </div>
          <p className="text-xs lg:text-sm text-gray-500 mt-3">Not enrolled</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-2xl shadow-md border border-purple-200 overflow-hidden mb-6 lg:mb-8">
        <div className="p-6 lg:p-8 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Recent Activity</h2>
                <p className="text-xs lg:text-sm text-gray-600 mt-1">Latest account registrations</p>
              </div>
            </div>
            <div className="px-3 lg:px-4 py-1.5 lg:py-2 bg-white rounded-lg border border-purple-200 text-xs lg:text-sm font-bold text-purple-600 shrink-0">
              {recentActivity.length} accounts
            </div>
          </div>
        </div>

        <div className="divide-y divide-purple-200">
          {recentActivity.length === 0 ? (
            <div className="p-12 lg:p-16 text-center">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-5">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700 font-bold mb-2 text-lg">No recent activity</p>
              <p className="text-gray-600 text-sm">New registrations will appear here</p>
            </div>
          ) : (
            recentActivity.map((user, index) => (
              <div key={user.id} className="p-4 lg:p-6 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-colors flex items-center justify-between">
                <div className="flex items-center space-x-3 lg:space-x-4 flex-1 min-w-0">
                  <div className={`w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center font-bold text-white text-sm lg:text-base flex-shrink-0 shadow-md ${
                    user.role === 'teacher' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-green-400 to-green-600'
                  }`}>
                    {user.fullname?.charAt(0).toUpperCase() || user.role?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-base lg:text-lg truncate">{user.fullname || 'Unknown User'}</p>
                    <p className="text-xs lg:text-sm text-gray-600 truncate">
                      {user.role === 'teacher' ? '👨‍🏫 Teacher' : '👤 Admin'} • {user.department || user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0 ml-4">
                  <span className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-bold whitespace-nowrap ${
                    user.status === 'active'
                      ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200'
                      : user.status === 'archived'
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 border border-gray-200'
                      : 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}>
                    {user.status || 'pending'}
                  </span>
                  <span className="text-xs lg:text-sm font-semibold text-gray-500 whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6 lg:p-8 hover:shadow-lg hover:border-blue-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start space-x-3 lg:space-x-4">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-blue-900 text-base lg:text-lg">System Health</h3>
              <p className="text-sm text-blue-700 mt-1">All systems operational and running smoothly</p>
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-6 lg:p-8 hover:shadow-lg hover:border-purple-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start space-x-3 lg:space-x-4">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-purple-900 text-base lg:text-lg">System Utilization</h3>
              <p className="text-sm text-purple-700 mt-1">Active users: {Math.round(((stats.activeTeachers + stats.activeStudents) / (stats.totalTeachers + stats.totalStudents || 1)) * 100)}% of total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
