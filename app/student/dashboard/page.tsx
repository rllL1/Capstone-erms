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
      {/* Welcome Section with Soft Light Header */}
      <div className="mb-6 lg:mb-8 p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border border-purple-100 shadow-sm">
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Welcome back, {name ? name.split(' ')[0] : 'Student'}!
        </h1>
        <p className="text-gray-600 text-base lg:text-lg font-medium">Here&apos;s your learning progress at a glance</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Classes Enrolled */}
        <div className="group bg-white rounded-2xl shadow-md border border-purple-200 p-4 lg:p-6 hover:shadow-xl hover:border-purple-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Classes Enrolled</p>
              <p className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{stats.classesCount}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="group bg-white rounded-2xl shadow-md border border-green-200 p-4 lg:p-6 hover:shadow-xl hover:border-green-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Tasks Completed</p>
              <p className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.submittedAssessments}</p>
              <p className="text-xs text-green-600 font-bold mt-1.5">{completionRate}% complete</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="group bg-white rounded-2xl shadow-md border border-amber-200 p-4 lg:p-6 hover:shadow-xl hover:border-amber-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Pending Tasks</p>
              <p className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{stats.pendingAssessments}</p>
              <p className="text-xs text-amber-600 font-bold mt-1.5">{stats.pendingAssessments > 0 ? 'Action needed' : 'All set'}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all shrink-0">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average Grade */}
        <div className="group bg-white rounded-2xl shadow-md border border-blue-200 p-4 lg:p-6 hover:shadow-xl hover:border-blue-400 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs lg:text-sm font-semibold mb-2 uppercase tracking-wide">Average Grade</p>
              <p className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.averageGrade > 0 ? stats.averageGrade.toFixed(1) : 'N/A'}</p>
              <p className="text-xs text-blue-600 font-bold mt-1.5">{gradeLevel}</p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all shrink-0">
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
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <Link
              href="/student/class"
              className="group relative overflow-hidden rounded-2xl shadow-md border border-amber-200 p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white hover:border-amber-400"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg mb-4 lg:mb-5 group-hover:shadow-xl group-hover:scale-110 transition-all">
                  <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">View Pending Tasks</h3>
                <p className="text-sm text-gray-600 mb-3">{stats.pendingAssessments} tasks remaining</p>
                <div className="inline-block text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Start now →</div>
              </div>
            </Link>

            <Link
              href="/student/performance"
              className="group relative overflow-hidden rounded-2xl shadow-md border border-blue-200 p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white hover:border-blue-400"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg mb-4 lg:mb-5 group-hover:shadow-xl group-hover:scale-110 transition-all">
                  <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Check Performance</h3>
                <p className="text-sm text-gray-600 mb-3">View all scores and progress</p>
                <div className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">View →</div>
              </div>
            </Link>

            <Link
              href="/student/grades"
              className="group relative overflow-hidden rounded-2xl shadow-md border border-green-200 p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white hover:border-green-400"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg mb-4 lg:mb-5 group-hover:shadow-xl group-hover:scale-110 transition-all">
                  <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 12a5 5 0 1110 0 5 5 0 01-10 0z" />
                  </svg>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">View Final Grades</h3>
                <p className="text-sm text-gray-600 mb-3">All subjects and assessments</p>
                <div className="inline-block text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Check →</div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Learning Progress */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-purple-200 p-6 lg:p-8 hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Learning Progress</h2>
              </div>
            </div>
            <span className="text-2xl lg:text-3xl font-bold text-purple-600">{completionRate}%</span>
          </div>
          
          <div className="space-y-4 lg:space-y-6">
            {/* Main Progress Bar */}
            <div className="p-5 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-25 rounded-xl lg:rounded-2xl border border-purple-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 lg:mb-5">
                <h3 className="font-bold text-gray-900 text-base lg:text-lg">Task Completion</h3>
                <span className="text-sm lg:text-base font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">{stats.submittedAssessments}/{totalTasks} tasks</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-3 lg:h-4 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out" style={{ inlineSize: `${completionRate}%` }}></div>
              </div>
              <p className="mt-3 text-xs lg:text-sm text-gray-600 font-medium">{completionRate === 100 ? '🎉 All tasks completed!' : `${totalTasks - stats.submittedAssessments} tasks remaining`}</p>
            </div>

            {/* Summary Stats Grid */}
            <div className="grid grid-cols-3 gap-3 lg:gap-4">
              <div className="p-4 lg:p-5 bg-gradient-to-br from-purple-50 to-white rounded-xl lg:rounded-2xl border border-purple-200 text-center shadow-sm hover:shadow-md transition-all hover:border-purple-400">
                <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">{stats.classesCount}</p>
                <p className="text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wide">Classes</p>
              </div>
              <div className="p-4 lg:p-5 bg-gradient-to-br from-green-50 to-white rounded-xl lg:rounded-2xl border border-green-200 text-center shadow-sm hover:shadow-md transition-all hover:border-green-400">
                <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">{stats.submittedAssessments}</p>
                <p className="text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wide">Completed</p>
              </div>
              <div className="p-4 lg:p-5 bg-gradient-to-br from-amber-50 to-white rounded-xl lg:rounded-2xl border border-amber-200 text-center shadow-sm hover:shadow-md transition-all hover:border-amber-400">
                <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">{stats.pendingAssessments}</p>
                <p className="text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wide">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Performance Summary */}
        <div className="bg-white rounded-2xl shadow-md border border-blue-200 p-6 lg:p-8 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-6 lg:mb-8">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Performance</h2>
          </div>

          <div className="space-y-4 lg:space-y-5">
            {/* Average Grade Card */}
            <div className="p-5 lg:p-6 bg-gradient-to-br from-blue-50 to-blue-25 rounded-xl lg:rounded-2xl border border-blue-200 text-center shadow-sm">
              <p className="text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 lg:mb-4">Average Grade</p>
              <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">{stats.averageGrade > 0 ? stats.averageGrade.toFixed(1) : 'N/A'}</p>
              <div className="flex items-center justify-center gap-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs lg:text-sm font-bold ${
                  stats.averageGrade >= 90 ? 'bg-green-100 text-green-700' :
                  stats.averageGrade >= 80 ? 'bg-blue-100 text-blue-700' :
                  stats.averageGrade >= 70 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  <span className={stats.averageGrade >= 80 ? '✓' : stats.averageGrade > 0 ? '→' : '—'}></span>
                  {gradeLevel}
                </div>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="p-5 lg:p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-xl lg:rounded-2xl border border-purple-200 shadow-sm">
              <h3 className="text-sm lg:text-base font-bold text-gray-900 mb-4">Performance Distribution</h3>
              <div className="space-y-3 lg:space-y-4">
                {stats.averageGrade > 0 && (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg text-xs font-bold shadow-md">A+</span>
                      <div className="flex-1 bg-blue-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full" style={{ inlineSize: `${Math.min(stats.averageGrade / 100 * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Motivational Message */}
            <div className="p-4 lg:p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl lg:rounded-2xl border border-green-200 text-center shadow-sm">
              <p className="text-sm lg:text-base font-bold text-green-900">
                {stats.pendingAssessments === 0 ? '✨ Keep up the great work!' : `${stats.pendingAssessments} tasks to excel further!`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}