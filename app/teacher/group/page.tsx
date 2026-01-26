'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  subject: string;
  description: string;
  code: string;
  student_count: number;
  material_count: number;
  created_at: string;
}

export default function GroupPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      const supabase = createClient();
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('groups')
          .select('*')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });

        setGroups(data || []);
      }
      
      setLoading(false);
    }

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600 mt-2">Create and manage classroom groups for your students</p>
        </div>
        <Link
          href="/teacher/group/create"
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
          Create Group
        </Link>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-purple-600"
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No groups yet</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Create your first classroom group to start sharing assignments and quizzes with students
            </p>
            <Link
              href="/teacher/group/create"
              className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Group
            </Link>
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
                <h3 className="text-xl font-bold text-white mb-1">{group.name}</h3>
                <p className="text-purple-100 text-sm">{group.subject}</p>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {group.description || 'No description provided'}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Students</p>
                    <p className="text-2xl font-bold text-gray-900">{group.student_count || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Materials</p>
                    <p className="text-2xl font-bold text-gray-900">{group.material_count || 0}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Group Code</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-purple-50 text-purple-700 px-3 py-2 rounded font-mono text-sm font-semibold flex-1">
                      {group.code}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(group.code)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Copy code"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <Link
                  href={`/teacher/group/${group.id}`}
                  className="block w-full text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Manage Group
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
