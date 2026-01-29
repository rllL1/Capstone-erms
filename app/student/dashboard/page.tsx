'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface DashboardStats {
  classesCount: number;
  submittedAssessments: number;
  pendingAssessments: number;
  averageGrade: number;
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    classesCount: 0,
    submittedAssessments: 0,
    pendingAssessments: 0,
    averageGrade: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    (async () => {
      try {
        console.debug('Dashboard: Starting data fetch');
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.warn('Dashboard: No user session');
          setError('Not authenticated');
          if (mounted) setLoading(false);
          return;
        }

        console.debug('Dashboard: User authenticated:', user.id);

        // Fetch student name from students table
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('fullname')
          .eq('user_id', user.id)
          .single();

        if (studentError) {
          console.warn('Dashboard: Student query error:', studentError);
        }

        if (mounted && student) {
          console.debug('Dashboard: Student name loaded:', student.fullname);
          setName(student.fullname || null);
        }

        // Fetch classes count (group_members)
        const { data: groupMembers, error: groupError } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('student_id', user.id);

        if (groupError) {
          console.warn('Dashboard: Group members query error:', groupError);
        } else {
          console.debug('Dashboard: Group members found:', groupMembers?.length || 0);
        }

        // Fetch assessment submissions
        const { data: submissions, error: subError } = await supabase
          .from('assessment_submissions')
          .select('id, score, max_score')
          .eq('student_id', user.id);

        if (subError) {
          console.warn('Dashboard: Submissions query error:', subError);
        } else {
          console.debug('Dashboard: Submissions found:', submissions?.length || 0);
        }

        // Fetch final grades for average
        const { data: grades, error: gradeError } = await supabase
          .from('final_grades')
          .select('final_grade')
          .eq('student_id', user.id);

        if (gradeError) {
          console.warn('Dashboard: Grades query error:', gradeError);
        } else {
          console.debug('Dashboard: Grades found:', grades?.length || 0);
        }

        if (mounted) {
          const classesCount = groupMembers?.length || 0;
          const submittedCount = submissions?.length || 0;
          const averageGrade =
            grades && grades.length > 0
              ? grades.reduce((sum, g) => sum + g.final_grade, 0) / grades.length
              : 0;

          console.debug('Dashboard: Stats computed', { classesCount, submittedCount, averageGrade });

          setStats({
            classesCount,
            submittedAssessments: submittedCount,
            pendingAssessments: Math.max(0, classesCount * 2 - submittedCount),
            averageGrade: averageGrade,
          });
        }
      } catch (err: unknown) {
        console.error('Dashboard error:', err);
        if (mounted) {
          setError('Failed to load dashboard data');
        }
      } finally {
        if (mounted) {
          console.debug('Dashboard: Loading complete');
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate completion rate
  const totalTasks = stats.submittedAssessments + stats.pendingAssessments;
  const completionRate = totalTasks > 0 ? Math.round((stats.submittedAssessments / totalTasks) * 100) : 0;

  // Determine grade performance level
  const gradeLevel = stats.averageGrade >= 90 ? 'Excellent' : 
                     stats.averageGrade >= 80 ? 'Very Good' : 
                     stats.averageGrade >= 70 ? 'Good' : 
                     stats.averageGrade >= 60 ? 'Satisfactory' : 
                     stats.averageGrade > 0 ? 'Needs Improvement' : 'No Grades';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {name ? name.split(' ')[0] : 'Student'}!
        </h1>
        <p className="text-gray-600 mt-2">Here&apos;s your learning progress at a glance</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Classes Enrolled */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-purple-200 p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Classes Enrolled</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">{stats.classesCount}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-green-200 p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Tasks Completed</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">{stats.submittedAssessments}</p>
              <p className="text-xs text-green-600 font-medium mt-1">{completionRate}% complete</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-linear-to-br from-green-500 to-green-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-amber-200 p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Pending Tasks</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">{stats.pendingAssessments}</p>
              <p className="text-xs text-amber-600 font-medium mt-1">{stats.pendingAssessments > 0 ? 'Action needed' : 'All set'}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-linear-to-br from-amber-500 to-amber-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average Grade */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-blue-200 p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Average Grade</p>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900">{stats.averageGrade > 0 ? stats.averageGrade.toFixed(1) : 'N/A'}</p>
              <p className="text-xs text-blue-600 font-medium mt-1">{gradeLevel}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {stats.pendingAssessments > 0 && (
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
            <Link
              href="/student/class"
              className="bg-linear-to-br from-amber-50 to-amber-100 rounded-lg lg:rounded-xl shadow-sm border border-amber-200 p-4 lg:p-6 hover:shadow-lg transition-all hover:border-amber-400 hover:from-amber-100 hover:to-amber-200 group"
            >
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-linear-to-br from-amber-500 to-amber-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0">
                  <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm lg:text-base font-bold text-gray-900">View Pending Tasks</h3>
                  <p className="text-xs lg:text-sm text-amber-700">{stats.pendingAssessments} tasks remaining</p>
                </div>
              </div>
            </Link>

            <Link
              href="/student/performance"
              className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg lg:rounded-xl shadow-sm border border-blue-200 p-4 lg:p-6 hover:shadow-lg transition-all hover:border-blue-400 hover:from-blue-100 hover:to-blue-200 group"
            >
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0">
                  <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm lg:text-base font-bold text-gray-900">Check Performance</h3>
                  <p className="text-xs lg:text-sm text-blue-700">View all scores</p>
                </div>
              </div>
            </Link>

            <Link
              href="/student/grades"
              className="bg-linear-to-br from-green-50 to-green-100 rounded-lg lg:rounded-xl shadow-sm border border-green-200 p-4 lg:p-6 hover:shadow-lg transition-all hover:border-green-400 hover:from-green-100 hover:to-green-200 group"
            >
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-linear-to-br from-green-500 to-green-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0">
                  <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 12a5 5 0 1110 0 5 5 0 01-10 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm lg:text-base font-bold text-gray-900">View Final Grades</h3>
                  <p className="text-xs lg:text-sm text-green-700">All subjects</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Left Column - Assignments */}
        <div className="lg:col-span-2 bg-linear-to-br from-purple-50 via-white to-purple-50 rounded-lg lg:rounded-xl shadow-md border border-purple-200 p-4 lg:p-6">
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-purple-500 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-base lg:text-xl font-bold text-gray-900">Learning Progress</h2>
            </div>
            <span className="text-sm lg:text-base font-bold text-purple-600">{completionRate}%</span>
          </div>
          
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Task Completion</h3>
                <span className="text-sm font-medium text-purple-600">{stats.submittedAssessments}/{totalTasks}</span>
              </div>
              <div className="w-full bg-purple-100 rounded-full h-2.5">
                <div className="bg-linear-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all" style={{ inlineSize: `${completionRate}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 lg:p-4 bg-white rounded-lg border border-purple-100 text-center shadow-sm">
                <p className="text-2xl lg:text-3xl font-bold text-purple-600">{stats.classesCount}</p>
                <p className="text-xs lg:text-sm text-gray-600 font-medium">Classes</p>
              </div>
              <div className="p-3 lg:p-4 bg-white rounded-lg border border-green-100 text-center shadow-sm">
                <p className="text-2xl lg:text-3xl font-bold text-green-600">{stats.submittedAssessments}</p>
                <p className="text-xs lg:text-sm text-gray-600 font-medium">Completed</p>
              </div>
              <div className="p-3 lg:p-4 bg-white rounded-lg border border-amber-100 text-center shadow-sm">
                <p className="text-2xl lg:text-3xl font-bold text-amber-600">{stats.pendingAssessments}</p>
                <p className="text-xs lg:text-sm text-gray-600 font-medium">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Performance Summary */}
        <div className="bg-linear-to-br from-blue-50 via-white to-blue-50 rounded-lg lg:rounded-xl shadow-md border border-blue-200 p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4 lg:mb-6">
            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-base lg:text-xl font-bold text-gray-900">Performance</h2>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-white rounded-lg border border-blue-100 text-center shadow-sm">
              <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1">Average Grade</p>
              <p className="text-3xl lg:text-4xl font-bold text-blue-600">{stats.averageGrade > 0 ? stats.averageGrade.toFixed(1) : 'N/A'}</p>
              <p className="text-xs lg:text-sm text-blue-600 font-semibold mt-2">{gradeLevel}</p>
            </div>

            <Link href="/student/performance" className="w-full inline-flex items-center justify-center px-4 py-2.5 lg:py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Details
            </Link>

            <Link href="/student/profile" className="w-full inline-flex items-center justify-center px-4 py-2.5 lg:py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold rounded-lg transition-all">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}