'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { shareMaterial } from './actions';

interface Assessment {
  id: string;
  title: string;
  type: string;
  course: string;
  subject: string;
  created_at: string;
}

interface Examination {
  id: string;
  title: string;
  course: string;
  subject: string;
  created_at: string;
}

export default function ShareMaterialPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [activeTab, setActiveTab] = useState<'assessment' | 'examination'>('assessment');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch group name
      const { data: groupData } = await supabase
        .from('groups')
        .select('name')
        .eq('id', groupId)
        .single();

      if (groupData) {
        setGroupName(groupData.name);
      }

      // Fetch assessments
      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      setAssessments(assessmentData || []);

      // Fetch examinations
      const { data: examinationData } = await supabase
        .from('examinations')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      setExaminations(examinationData || []);
      setLoading(false);
    }

    fetchData();
  }, [groupId, router]);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleShare = async () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one material to share');
      return;
    }

    const materials = activeTab === 'assessment' ? assessments : examinations;
    const selectedMaterials = materials.filter((m) => selectedItems.has(m.id));

    let successCount = 0;
    let errorCount = 0;

    for (const material of selectedMaterials) {
      const result = await shareMaterial(
        groupId,
        activeTab,
        material.id,
        material.title
      );

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        if (result.error !== 'Material already shared to this group') {
          console.error(`Failed to share ${material.title}:`, result.error);
        }
      }
    }

    if (successCount > 0) {
      alert(`Successfully shared ${successCount} material(s) to the group!`);
      setSelectedItems(new Set());
      router.push(`/teacher/group/${groupId}`);
    } else if (errorCount > 0) {
      alert('Some materials may already be shared or failed to share. Please check the group page.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading materials...</div>
      </div>
    );
  }

  const currentMaterials = activeTab === 'assessment' ? assessments : examinations;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/teacher/group/${groupId}`}
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Group
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Share Material</h1>
        <p className="text-gray-600 mt-2">Share assessments and examinations to: <strong>{groupName}</strong></p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => {
                setActiveTab('assessment');
                setSelectedItems(new Set());
              }}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'assessment'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assessments ({assessments.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('examination');
                setSelectedItems(new Set());
              }}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'examination'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Examinations ({examinations.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedItems.size > 0 && (
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg flex justify-between items-center">
              <span className="text-purple-700 font-semibold">
                {selectedItems.size} item(s) selected
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="px-4 py-2 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleShare}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Share Selected
                </button>
              </div>
            </div>
          )}

          {currentMaterials.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {activeTab === 'assessment' ? 'Assessments' : 'Examinations'} Available
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'assessment'
                  ? 'Create an assessment first to share it with your group'
                  : 'Create and get examinations approved first to share them with your group'}
              </p>
              <Link
                href={`/teacher/${activeTab}/create`}
                className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create {activeTab === 'assessment' ? 'Assessment' : 'Examination'}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMaterials.map((material) => (
                <div
                  key={material.id}
                  onClick={() => toggleSelection(material.id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedItems.has(material.id)
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          activeTab === 'assessment'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {activeTab === 'assessment'
                          ? (material as Assessment).type
                          : 'Examination'}
                      </span>
                    </div>
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        selectedItems.has(material.id)
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedItems.has(material.id) && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {material.title}
                  </h3>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <strong>Course:</strong> {material.course}
                    </p>
                    <p>
                      <strong>Subject:</strong> {material.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Created {new Date(material.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      {selectedItems.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <span className="text-gray-700 font-semibold">
              {selectedItems.size} item(s) selected
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-lg transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-colors"
              >
                Share to Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
