'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import EditGroupModal from './EditGroupModal';
import { deleteGroup, removeStudent, removeMaterial, fetchGroupStudents } from './actions';

interface Group {
  id: string;
  name: string;
  subject: string;
  description: string;
  code: string;
  year_level: string;
  semester: string;
  student_count: number;
  material_count: number;
  created_at: string;
}

interface Student {
  id: string;
  student_id: string;
  joined_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Material {
  id: string;
  material_type: string;
  material_id: string;
  title: string;
  description: string;
  due_date: string | null;
  posted_at: string;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchGroupData = async () => {
    const supabase = createClient();

    // Fetch group details
    const { data: groupData } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupData) {
      setGroup(groupData);
    }

    // Fetch students using server action
    const studentsResult = await fetchGroupStudents(groupId);
    
    if (studentsResult.success) {
      setStudents(studentsResult.students || []);
    } else {
      console.error('Error fetching students:', studentsResult.error);
      setStudents([]);
    }

    // Fetch materials
    const { data: materialsData } = await supabase
      .from('group_materials')
      .select('*')
      .eq('group_id', groupId)
      .order('posted_at', { ascending: false });

    setMaterials(materialsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const handleDeleteGroup = async () => {
    if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      const result = await deleteGroup(groupId);
      if (result.success) {
        router.push('/teacher/group');
      } else {
        alert(result.error || 'Failed to delete group');
      }
    }
  };

  const handleRemoveStudent = async (studentRecordId: string) => {
    if (confirm('Remove this student from the group?')) {
      const result = await removeStudent(studentRecordId);
      if (result.success) {
        setStudents(students.filter(s => s.id !== studentRecordId));
      } else {
        alert(result.error || 'Failed to remove student');
      }
    }
  };

  const handleRemoveMaterial = async (materialId: string) => {
    if (confirm('Remove this material from the group?')) {
      const result = await removeMaterial(materialId);
      if (result.success) {
        fetchGroupData();
      } else {
        alert(result.error || 'Failed to remove material');
      }
    }
  };

  const copyCode = () => {
    if (group) {
      navigator.clipboard.writeText(group.code);
      alert('Group code copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading group...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Group not found</h2>
        <Link href="/teacher/group" className="text-purple-600 hover:text-purple-700">
          Back to Groups
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/teacher/group"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 font-semibold transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Groups
        </Link>

        <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-purple-100 p-6 lg:p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">{group.name}</h1>
              <p className="text-xl font-semibold text-purple-700 mb-4">{group.subject}</p>
              <p className="text-gray-700 text-lg leading-relaxed">{group.description || 'No description available'}</p>
              
              <div className="flex flex-wrap gap-6 mt-6 text-sm">
                <div className="bg-white bg-opacity-60 rounded-lg px-4 py-2 shadow-sm">
                  <span className="font-semibold text-gray-700">📚 Year Level:</span>
                  <span className="text-purple-600 font-bold ml-2">{group.year_level}</span>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg px-4 py-2 shadow-sm">
                  <span className="font-semibold text-gray-700">📅 Semester:</span>
                  <span className="text-purple-600 font-bold ml-2">{group.semester}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="group px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={handleDeleteGroup}
                className="group px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>

          {/* Group Code */}
          <div className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">🔐 Group Code</p>
            <div className="flex items-center gap-4 mb-4">
              <code className="text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text tracking-widest">{group.code}</code>
              <button
                onClick={copyCode}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
            <p className="text-sm text-gray-600">📤 Share this code with students to join the group</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="group bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-sm border border-green-200 p-6 lg:p-8 hover:shadow-lg hover:border-green-400 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">👥 Students</p>
              <p className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{students.length}</p>
            </div>
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all flex items-center justify-center text-3xl">
              👥
            </div>
          </div>
        </div>
        <div className="group bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm border border-blue-200 p-6 lg:p-8 hover:shadow-lg hover:border-blue-400 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">📚 Materials</p>
              <p className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{materials.length}</p>
            </div>
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all flex items-center justify-center text-3xl">
              📚
            </div>
          </div>
        </div>
      </div>

      {/* Materials Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8 mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center text-2xl">
              📚
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Materials</h2>
          </div>
          <Link
            href={`/teacher/group/${groupId}/share`}
            className="group px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Share Material
          </Link>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-dashed border-blue-200">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md text-4xl">
              📚
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No materials shared yet</p>
            <p className="text-gray-600 mb-6">Start sharing assessments and examinations with your group</p>
            <Link
              href={`/teacher/group/${groupId}/share`}
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Share First Material
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map((material) => (
              <div
                key={material.id}
                className="group border-2 border-gray-200 rounded-2xl p-4 lg:p-6 hover:border-blue-400 hover:shadow-md transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        material.material_type === 'assessment' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {material.material_type === 'assessment' ? '✓ Assessment' : '✓ Examination'}
                      </span>
                      {material.due_date && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-orange-700 bg-orange-100">
                          📅 Due: {new Date(material.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-blue-600 transition-colors">{material.title}</h3>
                    <p className="text-gray-700 mb-3 leading-relaxed">{material.description || 'No description provided'}</p>
                    <p className="text-xs text-gray-500 font-semibold">
                      ⏱️ Posted {new Date(material.posted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveMaterial(material.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all flex-shrink-0"
                    title="Remove material"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Students Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg flex items-center justify-center text-2xl">
            👥
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Students</h2>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-dashed border-green-200">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md text-4xl">
              👥
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No students have joined yet</p>
            <p className="text-gray-600">Students can join this group using the group code</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-widest">
                    👤 Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-widest">
                    📧 Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-widest">
                    📅 Joined Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-widest">
                    ⚙️ Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {student.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {student.profiles?.full_name || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 font-medium">
                        {student.profiles?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-full text-xs">
                        {new Date(student.joined_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-all font-semibold text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditModal && group && (
        <EditGroupModal
          group={group}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchGroupData();
          }}
        />
      )}
    </div>
  );
}
