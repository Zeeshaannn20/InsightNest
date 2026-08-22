"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Assignment, Submission } from "@/lib/types/database";

type AssignmentWithSubmission = Assignment & { submission?: Submission };

export default function StudentAssignmentsPage() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAssignments() {
      if (!profile) return;
      
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", profile.id);

      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map((e: any) => e.course_id);
        
        const { data: assignmentsData } = await supabase
          .from("assignments")
          .select("*, course:courses(title)")
          .in("course_id", courseIds)
          .order("due_date", { ascending: true });

        if (assignmentsData) {
          // Fetch submissions for this student
          const { data: submissionsData } = await supabase
            .from("submissions")
            .select("*")
            .eq("user_id", profile.id);
            
          const submissionMap = new Map(submissionsData?.map((s: any) => [s.assignment_id, s]) || []);
          
          const combined = assignmentsData.map((a: any) => ({
            ...a,
            submission: submissionMap.get(a.id)
          })) as unknown as AssignmentWithSubmission[];
          
          setAssignments(combined);
        }
      }
      setLoading(false);
    }
    
    fetchAssignments();
  }, [profile, supabase]);

  const handleUploadClick = () => {
    alert("In a full implementation, this would open a file picker and upload to the Supabase 'submissions' bucket.");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span></div>;
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-primary-container mb-2 tracking-tight">Assignments</h1>
        <p className="text-on-surface-variant text-base">Submit work and view grades.</p>
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">task</span>
            <h3 className="text-xl font-bold text-primary-container mb-2">No Assignments Yet</h3>
            <p className="text-on-surface-variant">There are no assignments posted for your courses.</p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:border-secondary transition-colors group">
              <div className="flex-shrink-0">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  assignment.submission?.status === 'approved' ? 'bg-green-100 text-green-600' :
                  assignment.submission?.status === 'needs_revision' ? 'bg-yellow-100 text-yellow-700' :
                  assignment.submission ? 'bg-blue-100 text-blue-600' :
                  'bg-surface-container-highest text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-3xl">
                    {assignment.submission?.status === 'approved' ? 'verified' :
                     assignment.submission?.status === 'needs_revision' ? 'rule' :
                     assignment.submission ? 'pending' : 'assignment'}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      assignment.submission?.status === 'approved' ? 'bg-green-100 text-green-700' :
                      assignment.submission?.status === 'needs_revision' ? 'bg-yellow-100 text-yellow-700' :
                      assignment.submission ? 'bg-blue-100 text-blue-700' :
                      'bg-error-container text-on-error-container'
                    }`}>
                      {assignment.submission ? assignment.submission.status.replace(/_/g, " ") : 'Pending'}
                    </span>
                    <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">
                      {(assignment as any).course?.title}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No deadline'}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-primary-container">{assignment.title}</h3>
                <p className="text-sm text-on-surface-variant line-clamp-2">{assignment.description}</p>

                {assignment.submission?.feedback && (
                  <div className={`mt-4 p-4 rounded-xl border ${
                    assignment.submission.status === 'approved'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <p className={`font-bold mb-1 ${
                      assignment.submission.status === 'approved' ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {assignment.submission.status === 'approved' ? 'Approved' : 'Feedback'}
                    </p>
                    <p className={`text-sm ${
                      assignment.submission.status === 'approved' ? 'text-green-700' : 'text-yellow-700'
                    }`}>{assignment.submission.feedback}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center md:items-end justify-end border-t md:border-t-0 md:border-l border-outline-variant/30 pt-4 md:pt-0 md:pl-6">
                {!assignment.submission ? (
                  <button onClick={handleUploadClick} className="w-full md:w-auto bg-secondary text-on-secondary px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all btn-press shadow-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">upload_file</span> Submit
                  </button>
                ) : assignment.submission.status === 'approved' ? (
                  <button disabled className="w-full md:w-auto bg-green-100 text-green-700 px-6 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed text-center flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">done_all</span> Approved
                  </button>
                ) : assignment.submission.status === 'needs_revision' ? (
                  <button onClick={handleUploadClick} className="w-full md:w-auto bg-yellow-100 text-yellow-800 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-200 transition-all btn-press flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">refresh</span> Resubmit
                  </button>
                ) : (
                  <button disabled className="w-full md:w-auto bg-surface-container-high text-on-surface px-6 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed text-center">
                    {assignment.submission.status === 'under_review' ? 'Under review' : 'Submitted'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
