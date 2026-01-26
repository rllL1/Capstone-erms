'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { shareMaterial } from './actions';

interface ShareMaterialModalProps {
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Assessment {
  id: string;
  title: string;
  type: string;
}

interface Examination {
  id: string;
  title: string;
  course: string;
}

export default function ShareMaterialModal({
  groupId,
  onClose,
  onSuccess,
}: ShareMaterialModalProps) {
  const [materialType, setMaterialType] = useState<'assessment' | 'examination'>('assessment');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchMaterials() {
      const supabase = createClient();
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch assessments
        const { data: assessmentData } = await supabase
          .from('assessments')
          .select('id, title, type')
          .eq('teacher_id', user.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        setAssessments(assessmentData || []);

        // Fetch examinations
        const { data: examinationData } = await supabase
          .from('examinations')
          .select('id, title, course')
          .eq('teacher_id', user.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        setExaminations(examinationData || []);
      }
    }

    fetchMaterials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMaterial) {
      alert('Please select a material');
      return;
    }

    setLoading(true);

    const materials = materialType === 'assessment' ? assessments : examinations;
    const material = materials.find((m) => m.id === selectedMaterial);
    
    if (!material) {
      alert('Material not found');
      setLoading(false);
      return;
    }

    const title = materialType === 'assessment' 
      ? (material as Assessment).title 
      : (material as Examination).title;

    const result = await shareMaterial(
      groupId,
      materialType,
      selectedMaterial,
      title,
      description,
      dueDate
    );

    setLoading(false);

    if (result.error) {
      alert(result.error);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">Share Material to Group</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Material Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Material Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="assessment"
                  checked={materialType === 'assessment'}
                  onChange={(e) => {
                    setMaterialType(e.target.value as 'assessment');
                    setSelectedMaterial('');
                  }}
                  className="mr-2"
                />
                Assessment (Quiz/Assignment)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="examination"
                  checked={materialType === 'examination'}
                  onChange={(e) => {
                    setMaterialType(e.target.value as 'examination');
                    setSelectedMaterial('');
                  }}
                  className="mr-2"
                />
                Examination
              </label>
            </div>
          </div>

          {/* Select Material */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select {materialType === 'assessment' ? 'Assessment' : 'Examination'} <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select {materialType}</option>
              {materialType === 'assessment' ? (
                assessments.map((assessment) => (
                  <option key={assessment.id} value={assessment.id}>
                    {assessment.title} - {assessment.type}
                  </option>
                ))
              ) : (
                examinations.map((examination) => (
                  <option key={examination.id} value={examination.id}>
                    {examination.title} - {examination.course}
                  </option>
                ))
              )}
            </select>
            {materialType === 'assessment' && assessments.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">No published assessments available</p>
            )}
            {materialType === 'examination' && examinations.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">No approved examinations available</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Instructions/Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Add instructions or notes for students..."
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Sharing...' : 'Share Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
