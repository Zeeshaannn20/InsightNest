"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export default function StudentCertificatesPage() {
  const { profile } = useAuth();
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCompletedCourses() {
      if (!profile) return;
      
      const { data } = await supabase
        .from("enrollments")
        .select(`
          id,
          enrolled_at,
          course:courses(title, instructor:profiles(full_name))
        `)
        .eq("student_id", profile.id)
        .eq("status", "completed");

      if (data) {
        setCompletedCourses(data);
      }
      setLoading(false);
    }
    
    fetchCompletedCourses();
  }, [profile, supabase]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span></div>;
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-primary-container mb-2 tracking-tight">Certificates</h1>
        <p className="text-on-surface-variant text-base">View and download your achievements.</p>
      </div>

      <div className="space-y-6">
        {completedCourses.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">workspace_premium</span>
            <h3 className="text-xl font-bold text-primary-container mb-2">No Certificates Yet</h3>
            <p className="text-on-surface-variant">Complete a course to earn your first certificate.</p>
          </div>
        ) : (
          completedCourses.map((course) => (
            <div key={course.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-card flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#D4AF37]"></div>
              
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">verified</span> Officially Verified
                </div>
                <h3 className="text-2xl font-bold text-primary-container">{course.course.title}</h3>
                <div className="space-y-1 text-sm text-on-surface-variant">
                  <p>Instructor: <strong className="text-on-surface">{course.course.instructor?.full_name}</strong></p>
                  <p>Issued: <strong className="text-on-surface">{new Date(course.enrolled_at || Date.now()).toLocaleDateString()}</strong></p>
                  <p>Credential ID: <strong className="font-mono text-on-surface">{course.id.split('-')[0].toUpperCase()}</strong></p>
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-col gap-3">
                <button className="w-full md:w-auto bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all btn-press shadow-sm flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">download</span> Download PDF
                </button>
                <button className="w-full md:w-auto bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">share</span> Share Credential
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
