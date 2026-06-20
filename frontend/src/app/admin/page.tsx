"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalCourses: 0,
    totalSessions: 0,
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
          { count: totalSessions },
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student").eq("is_active", true),
          supabase.from("courses").select("*", { count: "exact", head: true }),
          supabase.from("live_sessions").select("*", { count: "exact", head: true }),
        ]);

        setStats({
          totalStudents: totalStudents || 0,
          activeStudents: activeStudents || 0,
          totalCourses: totalCourses || 0,
          totalSessions: totalSessions || 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [supabase]);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-container tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-on-surface-variant">Overview of your LMS platform.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 h-32 animate-pulse flex flex-col justify-center">
              <div className="h-4 bg-surface-container w-1/2 rounded mb-4"></div>
              <div className="h-8 bg-surface-container w-1/3 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Students" value={stats.totalStudents} icon="groups" color="bg-blue-100 text-blue-600" />
          <StatCard title="Active Students" value={stats.activeStudents} icon="person_check" color="bg-green-100 text-green-600" />
          <StatCard title="Total Courses" value={stats.totalCourses} icon="library_books" color="bg-purple-100 text-purple-600" />
          <StatCard title="Live Sessions" value={stats.totalSessions} icon="video_camera_front" color="bg-orange-100 text-orange-600" />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number | string; icon: string; color: string }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex items-start justify-between hover:border-secondary transition-colors">
      <div>
        <p className="text-sm font-semibold text-on-surface-variant mb-2">{title}</p>
        <p className="text-3xl font-bold text-primary-container">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
    </div>
  );
}
