"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";

export default function InstructorDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: totalStudents },
          { count: activeStudents },
          { count: totalCourses },
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student").eq("is_active", true),
          supabase.from("courses").select("*", { count: "exact", head: true }).eq("instructor_id", profile?.id),
        ]);

        setStats({
          totalStudents: totalStudents || 0,
          activeStudents: activeStudents || 0,
          totalCourses: totalCourses || 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }

    if (profile) {
      fetchStats();
    }
  }, [profile, supabase]);

  return (
    <div className="animate-fade-in pb-24">
      {/* Sticky Top App Bar */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md px-6 md:px-10 py-4 border-b border-outline-variant/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-container">Instructor Overview</h1>
          <p className="text-on-surface-variant text-sm">Welcome back, {profile?.full_name}.</p>
        </div>
        <div className="flex items-center gap-4 self-end sm:self-auto">
          <Link href="/instructor/live" className="bg-secondary text-on-secondary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all shadow-md btn-press flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">videocam</span> Go Live
          </Link>
        </div>
      </header>

      <div className="p-6 md:p-10 space-y-6 max-w-[1600px] mx-auto">
        
        {/* Analytics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card bento-card relative overflow-hidden">
            <p className="text-xs font-bold text-on-surface-variant tracking-wider uppercase mb-1">Total Students</p>
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="text-4xl font-extrabold text-primary-container tracking-tight">{stats.totalStudents}</h2>
            </div>
            <p className="text-xs font-bold text-green-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> Platform Wide
            </p>
            <div className="absolute top-6 right-6 w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card bento-card relative overflow-hidden">
            <p className="text-xs font-bold text-on-surface-variant tracking-wider uppercase mb-1">Active Students</p>
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="text-4xl font-extrabold text-primary-container tracking-tight">{stats.activeStudents}</h2>
            </div>
            <p className="text-xs font-bold text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">bolt</span> High engagement
            </p>
            <div className="absolute top-6 right-6 w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">vital_signs</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card bento-card relative overflow-hidden">
            <p className="text-xs font-bold text-on-surface-variant tracking-wider uppercase mb-1">My Courses</p>
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="text-4xl font-extrabold text-primary-container tracking-tight">{stats.totalCourses}</h2>
            </div>
            <p className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">library_books</span> Active courses
            </p>
            <div className="absolute top-6 right-6 w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">auto_stories</span>
            </div>
          </div>
        </section>

        {/* Quick Actions & Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card bento-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-primary-container">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/instructor/announcements" className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-outline-variant/30 hover:border-secondary transition-colors group bg-surface">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                    <span className="material-symbols-outlined">campaign</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface">Announce</span>
                </Link>
                <Link href="/instructor/assignments" className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-outline-variant/30 hover:border-secondary transition-colors group bg-surface">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                    <span className="material-symbols-outlined">assignment_add</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface">Assignment</span>
                </Link>
                <Link href="/instructor/quizzes" className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-outline-variant/30 hover:border-secondary transition-colors group bg-surface">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                    <span className="material-symbols-outlined">quiz</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface">Quiz</span>
                </Link>
                <Link href="/instructor/analytics" className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-outline-variant/30 hover:border-secondary transition-colors group bg-surface">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                    <span className="material-symbols-outlined">bar_chart</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface">Reports</span>
                </Link>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card bento-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-primary-container">Recent Submissions</h3>
                <Link href="/instructor/assignments" className="text-sm font-bold text-secondary hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                <div className="text-center py-8 text-on-surface-variant bg-surface rounded-xl">
                  <p>Check the Assignments tab to grade recent submissions.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card bento-card">
              <h3 className="text-lg font-bold text-primary-container mb-6 flex items-center gap-2">
                Upcoming Schedule
              </h3>
              <div className="space-y-4">
                <div className="text-center py-8 text-on-surface-variant bg-surface rounded-xl">
                  <p>Manage your classes in the Live Classes tab.</p>
                </div>
              </div>
              <Link href="/instructor/live" className="block w-full mt-6 bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-all text-center">
                Manage Schedule
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
