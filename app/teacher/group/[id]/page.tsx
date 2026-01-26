'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import EditGroupModal from './EditGroupModal';
import { deleteGroup, removeStudent, removeMaterial } from './actions';

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

    // Fetch students
    const { data: studentsData } = await supabase
      .from('group_students')
      .select('*, profiles(full_name, email)')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: false });

    setStudents(studentsData || []);

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
        fetchGroupData();
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
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Groups
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{group.subject}</p>
              <p className="text-gray-700">{group.description || 'No description'}</p>
              
              <div className="flex gap-6 mt-4 text-sm text-gray-600">
                <span><strong>Year Level:</strong> {group.year_level}</span>
                <span><strong>Semester:</strong> {group.semester}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteGroup}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Group Code */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Group Code</p>
            <div className="flex items-center gap-3">
              <code className="text-2xl font-bold text-purple-700 tracking-wider">{group.code}</code>
              <button
                onClick={copyCode}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">Share this code with students to join</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
          <p className="text-4xl font-bold text-purple-600">{group.student_count}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Materials</h3>
          <p className="text-4xl font-bold text-purple-600">{group.material_count}</p>
        </div>
      </div>

      {/* Materials Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Materials</h2>
          <Link
            href={`/teacher/group/${groupId}/share`}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Share Material
          </Link>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No materials shared yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map((material) => (
              <div
                key={material.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        material.material_type === 'assessment' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {material.material_type === 'assessment' ? 'Assessment' : 'Examination'}
                      </span>
                      {material.due_date && (
                        <span className="text-xs text-gray-600">
                          Due: {new Date(material.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{material.title}</h3>
                    <p className="text-sm text-gray-600">{material.description || 'No description'}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Posted {new Date(material.posted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveMaterial(material.id)}
                    className="text-red-600 hover:text-red-700 p-2"
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Students</h2>

        {students.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No students have joined yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.profiles?.full_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {student.profiles?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(student.joined_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
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
