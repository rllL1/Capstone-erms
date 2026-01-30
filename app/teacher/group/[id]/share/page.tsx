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
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 font-semibold transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Group
        </Link>

        <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border border-purple-100 shadow-sm">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Share Material
          </h1>
          <p className="text-gray-700 text-lg">
            Share assessments and examinations to: <span className="font-semibold text-purple-600">{groupName}</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <nav className="flex -mb-px">
            <button
              onClick={() => {
                setActiveTab('assessment');
                setSelectedItems(new Set());
              }}
              className={`px-6 lg:px-8 py-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'assessment'
                  ? 'border-purple-600 text-purple-600 bg-white bg-opacity-50'
                  : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-purple-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Assessments ({assessments.length})
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab('examination');
                setSelectedItems(new Set());
              }}
              className={`px-6 lg:px-8 py-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'examination'
                  ? 'border-purple-600 text-purple-600 bg-white bg-opacity-50'
                  : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-purple-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Examinations ({examinations.length})
              </span>
            </button>
          </nav>
        </div>

        <div className="p-6 lg:p-8">
          {selectedItems.size > 0 && (
            <div className="mb-6 p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl flex justify-between items-center shadow-sm">
              <span className="text-purple-700 font-semibold text-lg">
                ✓ {selectedItems.size} item(s) selected
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="px-4 py-2 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors font-medium"
                >
                  Clear
                </button>
                <button
                  onClick={handleShare}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Share Selected
                </button>
              </div>
            </div>
          )}

          {currentMaterials.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No {activeTab === 'assessment' ? 'Assessments' : 'Examinations'} Available
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                {activeTab === 'assessment'
                  ? 'Create an assessment first to share it with your group'
                  : 'Create and get examinations approved first to share them with your group'}
              </p>
              <Link
                href={`/teacher/${activeTab}/create`}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create {activeTab === 'assessment' ? 'Assessment' : 'Examination'}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {currentMaterials.map((material) => (
                <div
                  key={material.id}
                  onClick={() => toggleSelection(material.id)}
                  className={`group rounded-2xl p-4 lg:p-6 cursor-pointer transition-all border-2 ${
                    selectedItems.has(material.id)
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg'
                      : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-purple-300 hover:shadow-lg hover:-translate-y-1'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold transition-all ${
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
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        selectedItems.has(material.id)
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-600'
                          : 'border-gray-300 group-hover:border-purple-400'
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

                  <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 text-lg group-hover:text-purple-600 transition-colors">
                    {material.title}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-700 bg-white bg-opacity-50 rounded-lg p-3 lg:p-4">
                    <p>
                      <span className="font-semibold text-gray-600">Course:</span> {material.course}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">Subject:</span> {material.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-purple-200 shadow-2xl p-4 lg:p-6 z-10 bg-gradient-to-r from-white via-white to-purple-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <span className="text-gray-700 font-bold text-lg">
              ✓ {selectedItems.size} item(s) selected
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-6 py-3 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 font-semibold rounded-lg transition-all"
              >
                Clear Selection
              </button>
              <button
                onClick={handleShare}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
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
