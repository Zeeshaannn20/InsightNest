"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  SUBMISSION_BUCKET,
  acceptAttribute,
  errorMessage,
  submissionFileUrl,
  submissionObjectPath,
  validateSubmissionFile,
} from "@/lib/submissions";
import type { Assignment, Submission } from "@/lib/types/database";

type AssignmentWithSubmission = Assignment & { submission?: Submission };

/**
 * Whether a brief has more to show than the two-line clamp reveals. The length
 * cut is a guess at where two lines end — erring low, since offering "Show
 * full assignment" on something already fully visible is a smaller annoyance
 * than hiding the rest of the question behind no affordance at all.
 */
function isTruncatable(description: string | null): boolean {
  return !!description && (description.includes("\n") || description.length > 110);
}

/**
 * A label wrapping a visually hidden file input: clicking it opens the picker,
 * and the input stays keyboard-focusable, which a plain styled button would not.
 */
function UploadButton({
  assignment,
  uploading,
  onSelect,
  resubmit = false,
}: {
  assignment: AssignmentWithSubmission;
  uploading: boolean;
  onSelect: (assignment: AssignmentWithSubmission, input: HTMLInputElement) => void;
  resubmit?: boolean;
}) {
  return (
    <label
      className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-bold text-sm transition-all btn-press flex items-center justify-center gap-2 focus-within:ring-2 focus-within:ring-secondary focus-within:ring-offset-2 ${
        uploading
          ? "bg-surface-container-high text-on-surface-variant cursor-wait"
          : resubmit
            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer"
            : "bg-secondary text-on-secondary hover:bg-secondary/90 shadow-sm cursor-pointer"
      }`}
    >
      <span className={`material-symbols-outlined text-[18px] ${uploading ? "animate-spin" : ""}`}>
        {uploading ? "progress_activity" : resubmit ? "refresh" : "upload_file"}
      </span>
      {uploading ? "Uploading…" : resubmit ? "Resubmit" : "Submit"}
      <input
        type="file"
        className="sr-only"
        accept={acceptAttribute(assignment.allowed_file_types)}
        disabled={uploading}
        onChange={(e) => onSelect(assignment, e.currentTarget)}
      />
    </label>
  );
}

export default function StudentAssignmentsPage() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
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

  const handleFileSelected = async (
    assignment: AssignmentWithSubmission,
    input: HTMLInputElement,
  ) => {
    const file = input.files?.[0];
    // Let the same file be picked again after a failure.
    input.value = "";
    if (!file || !profile) return;

    const problem = validateSubmissionFile(file, assignment);
    if (problem) {
      setErrors((e) => ({ ...e, [assignment.id]: problem }));
      return;
    }

    setErrors((e) => ({ ...e, [assignment.id]: null }));
    setUploadingId(assignment.id);

    try {
      const path = submissionObjectPath(profile.id, assignment.id, file.name);
      const { error: uploadError } = await supabase.storage
        .from(SUBMISSION_BUCKET)
        .upload(path, file, { contentType: file.type || undefined });

      if (uploadError) throw uploadError;

      // A resubmission replaces the row's file and clears the old review, so
      // stale feedback never reads as if it were about the new file.
      const record = {
        file_url: path,
        file_name: file.name,
        status: "submitted" as const,
        submitted_at: new Date().toISOString(),
        feedback: null,
        reviewed_by: null,
        reviewed_at: null,
      };

      const { data, error: saveError } = assignment.submission
        ? await supabase
            .from("submissions")
            .update(record)
            .eq("id", assignment.submission.id)
            .select()
            .single()
        : await supabase
            .from("submissions")
            .insert({ ...record, assignment_id: assignment.id, user_id: profile.id })
            .select()
            .single();

      // ponytail: a failed row write leaves the uploaded object behind. Students
      // deliberately have no delete rights on the bucket — that is what stops a
      // handed-in file from disappearing out from under a grader — so the orphan
      // stays. Sweep them server-side if they ever become more than a rarity.
      if (saveError) throw saveError;

      setAssignments((current) =>
        current.map((a) =>
          a.id === assignment.id ? { ...a, submission: data as unknown as Submission } : a,
        ),
      );
    } catch (err: unknown) {
      setErrors((e) => ({
        ...e,
        [assignment.id]: errorMessage(err, "Upload failed. Please try again."),
      }));
    } finally {
      setUploadingId(null);
    }
  };

  const handleOpenSubmission = async (assignment: AssignmentWithSubmission) => {
    if (!assignment.submission) return;
    try {
      const url = await submissionFileUrl(supabase, assignment.submission.file_url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err: unknown) {
      setErrors((e) => ({
        ...e,
        [assignment.id]: errorMessage(err, "Could not open that file."),
      }));
    }
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
                {assignment.description && (
                  <div className="space-y-1.5">
                    {/* Collapsed, line-clamp needs the text inline; expanded,
                        whitespace-pre-line keeps the line breaks the brief was
                        written with instead of running it into one blob. */}
                    <p
                      className={`text-sm text-on-surface-variant ${
                        expanded[assignment.id] ? "whitespace-pre-line leading-relaxed" : "line-clamp-2"
                      }`}
                    >
                      {assignment.description}
                    </p>
                    {isTruncatable(assignment.description) && (
                      <button
                        onClick={() =>
                          setExpanded((e) => ({ ...e, [assignment.id]: !e[assignment.id] }))
                        }
                        aria-expanded={!!expanded[assignment.id]}
                        className="inline-flex items-center gap-0.5 text-sm font-semibold text-secondary hover:underline"
                      >
                        {expanded[assignment.id] ? "Show less" : "Show full assignment"}
                        <span className="material-symbols-outlined text-[18px]">
                          {expanded[assignment.id] ? "expand_less" : "expand_more"}
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {assignment.submission && (
                  <button
                    onClick={() => handleOpenSubmission(assignment)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline max-w-full"
                  >
                    <span className="material-symbols-outlined text-[18px] flex-shrink-0">description</span>
                    <span className="truncate">{assignment.submission.file_name || "Submitted file"}</span>
                    <span className="material-symbols-outlined text-[14px] flex-shrink-0">open_in_new</span>
                  </button>
                )}

                {errors[assignment.id] && (
                  <p role="alert" className="flex items-start gap-2 text-sm bg-error-container text-on-error-container rounded-xl px-4 py-2.5">
                    <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>
                    {errors[assignment.id]}
                  </p>
                )}

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
                  <UploadButton
                    assignment={assignment}
                    uploading={uploadingId === assignment.id}
                    onSelect={handleFileSelected}
                  />
                ) : assignment.submission.status === 'approved' ? (
                  <button disabled className="w-full md:w-auto bg-green-100 text-green-700 px-6 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed text-center flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">done_all</span> Approved
                  </button>
                ) : assignment.submission.status === 'needs_revision' ? (
                  <UploadButton
                    assignment={assignment}
                    uploading={uploadingId === assignment.id}
                    onSelect={handleFileSelected}
                    resubmit
                  />
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
