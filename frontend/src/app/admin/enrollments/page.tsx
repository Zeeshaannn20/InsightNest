"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import type { EnrollmentStatus } from "@/lib/types/database";

type Row = {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  source: string | null;
  progress_pct: number | null;
  enrolled_at: string;
  purchased_at: string | null;
  razorpay_payment_id: string | null;
  course?: { title: string } | null;
  student?: { full_name: string; email: string; enrollment_id: string | null } | null;
};

export default function AdminEnrollmentsPage() {
  const [courses, setCourses] = useState<{ id: string; title: string; status: string }[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // grant form
  const [showGrant, setShowGrant] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [courseId, setCourseId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EnrollmentStatus>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "razorpay" | "manual">("all");

  const supabase = createClient();
  const { session } = useAuth();

  const fetchEnrollments = useCallback(async () => {
    setListError(null);

    // enrollments.student_id has no foreign key to profiles, so PostgREST
    // cannot embed the student. Fetch the profiles separately and stitch.
    const { data, error } = await supabase
      .from("enrollments")
      .select("*, course:courses(title)")
      .order("enrolled_at", { ascending: false });

    if (error) {
      setListError(error.message);
      setRows([]);
      return;
    }

    const enrollments = (data ?? []) as Row[];
    const studentIds = [...new Set(enrollments.map((e) => e.student_id))];

    let byId = new Map<string, Row["student"]>();
    if (studentIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, enrollment_id")
        .in("id", studentIds);

      byId = new Map(
        (profiles ?? []).map((p: any) => [
          p.id,
          { full_name: p.full_name, email: p.email, enrollment_id: p.enrollment_id },
        ])
      );
    }

    setRows(enrollments.map((e) => ({ ...e, student: byId.get(e.student_id) ?? null })));
  }, [supabase]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("courses")
        .select("id, title, status")
        .order("created_at", { ascending: false });

      if (data) {
        setCourses(data);
        if (data.length > 0) setCourseId(data[0].id);
      }
      await fetchEnrollments();
      setLoading(false);
    }
    load();
  }, [supabase, fetchEnrollments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (sourceFilter !== "all" && (r.source ?? "manual") !== sourceFilter) return false;
      if (!q) return true;
      return (
        r.student?.full_name?.toLowerCase().includes(q) ||
        r.student?.email?.toLowerCase().includes(q) ||
        r.student?.enrollment_id?.toLowerCase().includes(q) ||
        r.course?.title?.toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter, sourceFilter]);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail || !courseId) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/admin/grant-access",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ studentEmail, courseId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message || "Access granted successfully" });
        setStudentEmail("");
        fetchEnrollments();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to grant access" });
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setSubmitting(false);
    }
  };

  const setStatus = async (row: Row, status: EnrollmentStatus) => {
    if (
      status === "dropped" &&
      !confirm(
        `Revoke access to "${row.course?.title ?? "this course"}" for ${
          row.student?.email ?? "this student"
        }? They will lose access immediately.`
      )
    )
      return;

    const { error } = await supabase.from("enrollments").update({ status }).eq("id", row.id);
    if (error) setListError(error.message);
    else setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status } : r)));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <span className="material-symbols-outlined animate-spin text-5xl text-secondary">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-container">Enrollments</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {filtered.length} of {rows.length} enrollment{rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={() => setShowGrant(!showGrant)}
          className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-on-secondary rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-base">{showGrant ? "close" : "person_add"}</span>
          {showGrant ? "Cancel" : "Grant access"}
        </button>
      </div>

      {message && (
        <div
          className={`max-w-xl p-4 rounded-xl text-sm flex items-start gap-3 ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-error-container text-on-error-container border border-error/20"
          }`}
        >
          <span className="material-symbols-outlined mt-0.5">
            {message.type === "success" ? "check_circle" : "error"}
          </span>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {showGrant && (
        <div className="max-w-xl bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 shadow-card animate-slide-down">
          <h2 className="text-lg font-bold text-primary-container mb-1">Grant student access</h2>
          <p className="text-xs text-on-surface-variant mb-6">
            For students who paid through social media or offline channels.
          </p>

          <form onSubmit={handleGrantAccess} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface">Student Email Address</label>
              <input
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm"
              />
              <p className="text-xs text-on-surface-variant">
                If the student does not have an account, one will be created and they will receive an
                invite email.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface">Select Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm text-on-surface"
                required
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                    {course.status === "closed"
                      ? " (Closed)"
                      : course.status === "coming_soon"
                        ? " (Coming Soon)"
                        : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-secondary text-on-secondary py-3.5 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {submitting ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Grant Dashboard Access
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or course…"
            className="pl-10 pr-3 py-2.5 w-64 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="py-2.5 px-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
          className="py-2.5 px-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All sources</option>
          <option value="razorpay">Razorpay</option>
          <option value="manual">Manual grant</option>
        </select>
      </div>

      {listError && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="font-medium">{listError}</p>
        </div>
      )}

      {/* List */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant">
              <tr>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Source</th>
                <th className="px-6 py-4 font-semibold">Progress</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant">
                    {rows.length === 0
                      ? "No enrollments yet. Grant access or wait for a Razorpay payment."
                      : "No enrollments match these filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const source = row.source ?? "manual";
                  const pct = Math.round(Number(row.progress_pct ?? 0));
                  return (
                    <tr key={row.id} className="hover:bg-surface-container/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-primary-container">
                          {row.student?.full_name ?? "Unknown student"}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {row.student?.email ?? row.student_id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-on-surface line-clamp-1">
                          {row.course?.title ?? "—"}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {new Date(row.enrolled_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            source === "razorpay"
                              ? "bg-secondary-container text-on-secondary-container"
                              : "bg-surface-container-highest text-on-surface"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {source === "razorpay" ? "payments" : "handshake"}
                          </span>
                          {source === "razorpay" ? "Razorpay" : "Manual"}
                        </span>
                        {row.razorpay_payment_id && (
                          <div className="text-[10px] font-mono text-outline mt-1">
                            {row.razorpay_payment_id}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div
                              className="h-full bg-secondary rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-on-surface-variant">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            row.status === "active"
                              ? "bg-green-100 text-green-700"
                              : row.status === "completed"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-error-container text-on-error-container"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {row.status === "dropped" ? (
                          <button
                            onClick={() => setStatus(row, "active")}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => setStatus(row, "dropped")}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-error/10 text-error hover:bg-error/20 transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
