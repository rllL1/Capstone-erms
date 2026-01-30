'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchTeacherGroups } from './actions';

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
      const result = await fetchTeacherGroups();
      
      if (result.success) {
        setGroups(result.groups || []);
      } else {
        console.error('Error fetching groups:', result.error);
        setGroups([]);
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
      <div className="mb-8">
        <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border border-purple-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">Groups</h1>
              <p className="text-gray-700 text-lg">Create and manage classroom groups for your students</p>
            </div>
            <Link
              href="/teacher/group/create"
              className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
            >
              <svg
                className="w-5 h-5"
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
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg text-6xl">
              👥
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">No groups yet</h3>
            <p className="text-gray-600 mb-8 text-center max-w-md text-lg leading-relaxed">
              Create your first classroom group to start sharing assignments and quizzes with students
            </p>
            <Link
              href="/teacher/group/create"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 text-lg"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Group
            </Link>
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-purple-300 transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              <div className="relative bg-gradient-to-br from-purple-600 to-indigo-600 p-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-300"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">{group.name}</h3>
                  <p className="text-purple-100 text-base font-semibold">{group.subject}</p>
                </div>
              </div>
              
              <div className="p-6 lg:p-7">
                <p className="text-gray-700 text-sm mb-5 line-clamp-2 leading-relaxed h-10">
                  {group.description || 'No description provided'}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-4 border border-green-200 group-hover:border-green-300 transition-colors">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">👥 Students</p>
                    <p className="text-3xl font-black text-green-600">{group.student_count || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 border border-blue-200 group-hover:border-blue-300 transition-colors">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">📚 Materials</p>
                    <p className="text-3xl font-black text-blue-600">{group.material_count || 0}</p>
                  </div>
                </div>

                <div className="mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-200">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">🔐 Group Code</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-white text-purple-600 px-4 py-2 rounded-lg font-mono text-sm font-bold flex-1 border border-purple-200">
                      {group.code}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(group.code)}
                      className="p-2 hover:bg-purple-100 rounded-lg transition-all text-purple-600 hover:text-purple-700 hover:shadow-md"
                      title="Copy code"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <Link
                  href={`/teacher/group/${group.id}`}
                  className="block w-full text-center px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
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
