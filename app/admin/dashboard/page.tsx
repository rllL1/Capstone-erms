import { createClient } from '@/lib/supabase/server';
import type { DashboardStats, Profile } from '@/types/database';

async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data: teachers, error } = await supabase
    .from('profiles')
    .select('status')
    .eq('role', 'teacher');

  if (error) {
    console.error('Error fetching stats:', error);
    return { totalTeachers: 0, activeTeachers: 0, archivedTeachers: 0 };
  }

  const totalTeachers = teachers?.length || 0;
  const activeTeachers = teachers?.filter((t) => t.status === 'active').length || 0;
  const archivedTeachers = teachers?.filter((t) => t.status === 'archived').length || 0;

  return { totalTeachers, activeTeachers, archivedTeachers };
}

async function getRecentActivity(): Promise<Profile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'teacher')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }

  return data || [];
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const recentActivity = await getRecentActivity();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">System overview and analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Teachers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Teachers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTeachers}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Teachers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Teachers</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeTeachers}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Archived Teachers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Archived Teachers</p>
              <p className="text-3xl font-bold text-gray-400 mt-2">{stats.archivedTeachers}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Account Activity</h2>
          <p className="text-sm text-gray-500 mt-1">Latest teacher accounts created</p>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No teacher accounts created yet
            </div>
          ) : (
            recentActivity.map((teacher) => (
              <div key={teacher.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-medium">
                      {teacher.fullname?.charAt(0).toUpperCase() || 'T'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{teacher.fullname}</p>
                    <p className="text-sm text-gray-500">
                      {teacher.department} • {teacher.employee_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      teacher.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {teacher.status}
                  </span>
                  <span className="text-sm text-gray-400">
                    {new Date(teacher.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
