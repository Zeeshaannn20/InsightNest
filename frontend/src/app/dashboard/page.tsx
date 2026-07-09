"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    courseId: "" as string,
    courseTitle: "No Active Courses",
    progress: 0,
    nextLesson: null as any,
    upcomingSessions: [] as any[],
    pendingAssignments: [] as any[],
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboardData() {
      if (!profile) return;
      
      try {
        // Fetch active enrollment
        const { data: enrollmentData } = await supabase
          .from("enrollments")
          .select(`
            course_id,
            course:courses(title, description, duration_weeks)
          `)
          .eq("student_id", profile.id)
          .eq("status", "active")
          .limit(1)
          .single();

        if (enrollmentData) {
          const courseId = enrollmentData.course_id;
          
          // Get Progress
          const { data: progressData } = await supabase.rpc("calculate_progress", {
            p_student_id: profile.id,
            p_course_id: courseId
          });

          // Get next lesson (just the first module's first lesson for now as a placeholder)
          const { data: nextLessonData } = await supabase
            .from("modules")
            .select(`
              title,
              lessons(id, title)
            `)
            .eq("course_id", courseId)
            .order("sort_order", { ascending: true })
            .limit(1)
            .single();

          // Get upcoming sessions
          const { data: sessionsData } = await supabase
            .from("live_sessions")
            .select("*")
            .eq("course_id", courseId)
            .in("status", ["scheduled", "live"])
            .order("session_date", { ascending: true })
            .limit(2);

          // Get pending assignments
          const { data: assignmentsData } = await supabase
            .from("assignments")
            .select(`
              id,
              title,
              deadline,
              submissions!left(id, status)
            `)
            .eq("course_id", courseId);

          const pending = assignmentsData?.filter((a: any) => !a.submissions || a.submissions.length === 0) || [];

          setStats({
            courseId: courseId,
            courseTitle: (enrollmentData.course as any)?.title || "Unknown Course",
            progress: progressData || 0,
            nextLesson: nextLessonData?.lessons?.[0] || null,
            upcomingSessions: sessionsData || [],
            pendingAssignments: pending,
          });
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchDashboardData();
    }
  }, [profile, authLoading, supabase]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <span className="material-symbols-outlined animate-spin text-5xl text-secondary">progress_activity</span>
      </div>
    );
  }

  if (!stats.courseId) {
    return (
      <div className="animate-fade-in space-y-6">
        <header className="flex md:hidden justify-between items-center mb-8">
          <Logo variant="img2" className="h-14 w-auto" />
        </header>

        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-container mb-1 tracking-tight">Welcome, {profile?.full_name?.split(" ")[0]}!</h1>
            <p className="text-on-surface-variant text-base">
              You haven't enrolled in any courses yet.
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border-2 border-outline-variant/30 shadow-sm max-w-3xl mx-auto mt-12">
          <div className="w-24 h-24 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl">school</span>
          </div>
          <h2 className="text-2xl font-bold text-primary-container mb-4">Start Your Journey</h2>
          <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
            Browse our catalog of AI-powered data analytics courses and accelerate your career.
          </p>
          <Link href="/#courses" className="bg-secondary text-on-secondary px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-secondary/90 transition-all btn-press shadow-md inline-flex items-center gap-2">
            Browse Courses <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Mobile Header */}
      <header className="flex md:hidden justify-between items-center mb-8">
        <div className="flex items-center">
          <Logo variant="img2" className="h-14 w-auto" />
        </div>
      </header>

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-container mb-1 tracking-tight">Welcome back, {profile?.full_name?.split(" ")[0]}!</h1>
          <p className="text-on-surface-variant text-base">
            Class Timings: <strong className="text-secondary">Announcements will be made live prior to sessions</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
            <span className="material-symbols-outlined text-sm">verified_user</span>
          </div>
          <span className="text-sm font-semibold text-on-surface font-mono">{profile?.enrollment_id}</span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Current Course Widget */}
        <div className="bento-card md:col-span-8 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 shadow-card flex flex-col md:flex-row gap-8 items-center">
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-surface-container-high)" strokeWidth="10" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="var(--color-secondary)" strokeWidth="10" 
                strokeDasharray="283" strokeDashoffset={283 - (283 * stats.progress) / 100} className="progress-circle" strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-container">
              <span className="text-3xl font-extrabold tracking-tight">{stats.progress}%</span>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Done</span>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold tracking-wider uppercase border border-secondary/20">
              Active Enrollment
            </div>
            <h2 className="text-2xl font-bold text-primary-container leading-tight">{stats.courseTitle}</h2>
            
            <div className="flex gap-3 pt-4">
              <Link href={stats.courseId ? `/course/${stats.courseId}` : "/dashboard/courses"} className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all shadow-md btn-press flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">play_circle</span> Go to Course
              </Link>
            </div>
          </div>
        </div>

        {/* Live Classes Widget */}
        <div className="bento-card md:col-span-4 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-primary-container flex items-center gap-2">
              Upcoming Live <span className="material-symbols-outlined text-on-surface-variant text-xl">calendar_month</span>
            </h3>
          </div>
          <div className="space-y-3 flex-1">
            {stats.upcomingSessions.length > 0 ? stats.upcomingSessions.map((session, i) => (
              <div key={i} className={`p-4 rounded-xl border ${session.status === 'live' ? 'bg-red-50 border-red-200' : 'bg-surface border-outline-variant/30'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold ${session.status === 'live' ? 'text-red-600 animate-pulse' : 'text-secondary'}`}>
                    {session.status === 'live' ? '• LIVE NOW' : new Date(session.session_date).toLocaleDateString()}
                  </span>
                  <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">{session.start_time}</span>
                </div>
                <h4 className="font-bold text-sm text-on-surface leading-tight mb-2">{session.title}</h4>
                {session.status === 'live' ? (
                  <button className="w-full mt-2 bg-red-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-red-700 transition-colors">
                    <span className="material-symbols-outlined text-sm">videocam</span> Join Class
                  </button>
                ) : (
                  <button className="w-full mt-2 bg-surface-container-high text-on-surface text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1">
                    Scheduled
                  </button>
                )}
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">event_available</span>
                <p className="text-sm text-on-surface-variant">No upcoming sessions scheduled at the moment.</p>
              </div>
            )}
          </div>
          <Link href="/dashboard/live" className="mt-4 text-center text-sm font-bold text-secondary hover:underline">View Schedule</Link>
        </div>

        {/* Pending Tasks */}
        <div className="bento-card md:col-span-6 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary-container flex items-center gap-2">
              Pending Tasks <span className="material-symbols-outlined text-on-surface-variant">task_alt</span>
            </h3>
            <span className="bg-error-container text-on-error-container text-xs font-bold px-2 py-1 rounded-lg">{stats.pendingAssignments.length} Open</span>
          </div>
          <div className="space-y-3">
            {stats.pendingAssignments.length > 0 ? stats.pendingAssignments.slice(0, 3).map((assignment, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-colors border border-transparent hover:border-outline-variant/30 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">assignment_late</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface group-hover:text-secondary transition-colors">{assignment.title}</h4>
                    <p className="text-xs text-error font-medium">Due: {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'No deadline'}</p>
                  </div>
                </div>
                <Link href="/dashboard/assignments" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-secondary">arrow_forward</span>
                </Link>
              </div>
            )) : (
              <div className="text-center py-6 text-on-surface-variant">
                <p className="text-sm">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="bento-card md:col-span-6 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary-container flex items-center gap-2">
              Announcements <span className="material-symbols-outlined text-on-surface-variant">campaign</span>
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-secondary flex-shrink-0"></div>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Welcome to the Accelerator</h4>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">Ensure your environment is set up before the first live class. Check the syllabus for prerequisites.</p>
                <span className="text-[10px] font-semibold text-outline mt-2 block">System • Today</span>
              </div>
            </div>
          </div>
          <Link href="/dashboard/announcements" className="block mt-6 text-center text-sm font-bold text-secondary hover:underline">View All Updates</Link>
        </div>

      </div>
    </div>
  );
}
