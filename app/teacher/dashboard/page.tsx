import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

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

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {profile?.fullname}
        </h1>
        <p className="text-gray-500 mt-1">Teacher Dashboard</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Full Name
            </label>
            <p className="text-gray-900">{profile?.fullname}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Employee ID
            </label>
            <p className="text-gray-900">{profile?.employee_id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Department
            </label>
            <p className="text-gray-900">{profile?.department}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Email
            </label>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Status
            </label>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                profile?.status === 'active'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {profile?.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Member Since
            </label>
            <p className="text-gray-900">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-purple-900">Need Help?</h3>
            <p className="text-sm text-purple-700 mt-1">
              If you need to update your profile information or have any questions,
              please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
