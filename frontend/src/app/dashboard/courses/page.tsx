"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import type { Enrollment } from "@/lib/types/database";

export default function StudentCoursesPage() {
  const { profile } = useAuth();
  const [enrollments, setEnrollments] = useState<(Enrollment & { progress?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCourses() {
      if (!profile) return;
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          *,
          course:courses(*)
        `)
        .eq("student_id", profile.id);

      if (!error && data) {
        // Fetch progress for each
        const withProgress = await Promise.all(
          data.map(async (e) => {
            const { data: progress } = await supabase.rpc("calculate_progress", {
              p_student_id: profile.id,
              p_course_id: e.course_id
            });
            return { ...e, progress: progress || 0 } as Enrollment & { progress?: number };
          })
        );
        setEnrollments(withProgress);
      }
      setLoading(false);
    }
    
    fetchCourses();
  }, [profile, supabase]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span></div>;
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-primary-container mb-2 tracking-tight">My Courses</h1>
        <p className="text-on-surface-variant text-base font-medium">Access your active learning programs.</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline mb-4">school</span>
          <h3 className="text-xl font-bold text-primary-container mb-2">No Courses Yet</h3>
          <p className="text-on-surface-variant">You are not enrolled in any courses currently.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 shadow-card hover:border-secondary transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    enrollment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    'bg-secondary/15 text-secondary'
                  }`}>
                    {enrollment.status}
                  </span>
                  <span className="text-xs text-outline font-semibold">{enrollment.course?.duration_weeks} Weeks</span>
                </div>
                
                <h3 className="text-xl font-bold text-primary-container">{enrollment.course?.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                  {enrollment.course?.description}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-secondary">{enrollment.progress}% Complete</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-outline-variant/20 flex items-center justify-between">
                <div className="text-xs text-outline font-medium">Click to resume</div>
                <Link href={`/course/${enrollment.course_id}`} className="bg-secondary text-on-secondary px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-secondary/90 transition-colors shadow-sm btn-press">
                  Open Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
