"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";

type StudentDetail = {
  enrollments: any[];
  attendance: any[];
  submissions: any[];
};

/** Quote a CSV field only when it needs it. */
function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending">("all");

  const [selected, setSelected] = useState<Profile | null>(null);
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchStudents();
  }, [supabase]);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setStudents(data as Profile[]);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      alert("Failed to update status.");
    } else {
      setStudents(students.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (statusFilter === "active" && !s.is_active) return false;
      if (statusFilter === "pending" && s.is_active) return false;
      if (!q) return true;
      return (
        s.full_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.enrollment_id?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q)
      );
    });
  }, [students, search, statusFilter]);

  const openStudent = async (student: Profile) => {
    setSelected(student);
    setDetail(null);
    setDetailLoading(true);

    const [enrollments, attendance, submissions] = await Promise.all([
      supabase
        .from("enrollments")
        .select("id, status, progress_pct, enrolled_at, last_accessed, source, course:courses(title)")
        .eq("student_id", student.id),
      supabase
        .from("attendance")
        .select("id, status, join_timestamp, session:live_sessions(title, session_date)")
        .eq("student_id", student.id)
        .order("join_timestamp", { ascending: false })
        .limit(25),
      supabase
        .from("submissions")
        .select("id, status, submitted_at, feedback, assignment:assignments(title)")
        .eq("user_id", student.id)
        .order("submitted_at", { ascending: false })
        .limit(25),
    ]);

    setDetail({
      enrollments: enrollments.data ?? [],
      attendance: attendance.data ?? [],
      submissions: submissions.data ?? [],
    });
    setDetailLoading(false);
  };

  const exportCsv = () => {
    const headers = ["Name", "Email", "Phone", "Enrollment ID", "Status", "Joined"];
    const rows = filtered.map((s) => [
      s.full_name,
      s.email,
      s.phone ?? "",
      s.enrollment_id ?? "",
      s.is_active ? "Active" : "Pending",
      new Date(s.created_at).toISOString().slice(0, 10),
    ]);

    const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `insightnest-students-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAssignEnrollmentId = async (id: string) => {
    const newId = `DA${new Date().getFullYear()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const { error } = await supabase
      .from("profiles")
      .update({ enrollment_id: newId, is_active: true })
      .eq("id", id);

    if (error) {
      alert("Failed to assign enrollment ID. It might already be in use.");
    } else {
      setStudents(students.map(s => s.id === id ? { ...s, enrollment_id: newId, is_active: true } : s));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-container tracking-tight mb-2">Students</h1>
          <p className="text-on-surface-variant">
            {loading
              ? "Manage enrollments and user access."
              : `${filtered.length} of ${students.length} student${students.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, ID…"
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
            <option value="pending">Pending</option>
          </select>

          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Enrollment ID</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    {students.length === 0 ? "No students found." : "No students match this search."}
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openStudent(student)}
                        className="font-semibold text-primary-container hover:text-secondary hover:underline text-left"
                      >
                        {student.full_name}
                      </button>
                      <div className="text-xs text-on-surface-variant">Joined {new Date(student.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface">{student.email}</div>
                      <div className="text-xs text-on-surface-variant">{student.phone || "No phone"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {student.enrollment_id ? (
                        <span className="font-mono bg-surface-container px-2 py-1 rounded text-xs border border-outline-variant/30">
                          {student.enrollment_id}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAssignEnrollmentId(student.id)}
                          className="text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1.5 rounded-lg hover:bg-secondary/20 transition-colors"
                        >
                          Assign ID
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        student.is_active ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {student.is_active ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openStudent(student)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleToggleStatus(student.id, student.is_active)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          student.is_active 
                            ? "bg-error/10 text-error hover:bg-error/20" 
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {student.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student drill-down */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-end"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-surface w-full max-w-2xl h-full shadow-2xl overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-surface-container-low border-b border-outline-variant/20 px-6 py-4 flex justify-between items-start z-10">
              <div>
                <h2 className="text-xl font-bold text-primary-container">{selected.full_name}</h2>
                <p className="text-sm text-on-surface-variant">{selected.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selected.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selected.is_active ? "Active" : "Pending"}
                  </span>
                  {selected.enrollment_id && (
                    <span className="font-mono bg-surface-container px-2 py-0.5 rounded text-xs border border-outline-variant/30">
                      {selected.enrollment_id}
                    </span>
                  )}
                  {selected.phone && (
                    <span className="text-xs text-on-surface-variant">{selected.phone}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {detailLoading || !detail ? (
              <div className="py-20 text-center text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin text-3xl">
                  progress_activity
                </span>
              </div>
            ) : (
              <div className="p-6 space-y-8">
                {/* Courses & progress */}
                <section>
                  <h3 className="text-sm font-bold text-primary-container mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">school</span>
                    Courses ({detail.enrollments.length})
                  </h3>
                  {detail.enrollments.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">Not enrolled in any course.</p>
                  ) : (
                    <div className="space-y-3">
                      {detail.enrollments.map((e: any) => {
                        const pct = Math.round(Number(e.progress_pct ?? 0));
                        return (
                          <div
                            key={e.id}
                            className="border border-outline-variant/30 rounded-xl p-4 space-y-2"
                          >
                            <div className="flex justify-between items-start gap-3">
                              <span className="font-semibold text-on-surface text-sm">
                                {e.course?.title ?? "Unknown course"}
                              </span>
                              <span className="text-xs text-on-surface-variant whitespace-nowrap">
                                {e.status} · {e.source ?? "manual"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-secondary rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-on-surface-variant tabular-nums">
                                {pct}%
                              </span>
                            </div>
                            <p className="text-[11px] text-outline">
                              Enrolled {new Date(e.enrolled_at).toLocaleDateString()}
                              {e.last_accessed &&
                                ` · last seen ${new Date(e.last_accessed).toLocaleDateString()}`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Attendance */}
                <section>
                  <h3 className="text-sm font-bold text-primary-container mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">event_available</span>
                    Attendance ({detail.attendance.length})
                  </h3>
                  {detail.attendance.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">No sessions attended yet.</p>
                  ) : (
                    <div className="border border-outline-variant/20 rounded-xl divide-y divide-outline-variant/10">
                      {detail.attendance.map((a: any) => (
                        <div key={a.id} className="px-4 py-2.5 flex justify-between items-center gap-3">
                          <span className="text-sm text-on-surface truncate">
                            {a.session?.title ?? "Session"}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                              a.status === "present"
                                ? "bg-green-100 text-green-700"
                                : a.status === "late"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-error-container text-on-error-container"
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Submissions */}
                <section>
                  <h3 className="text-sm font-bold text-primary-container mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">assignment_turned_in</span>
                    Submissions ({detail.submissions.length})
                  </h3>
                  {detail.submissions.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">Nothing submitted yet.</p>
                  ) : (
                    <div className="border border-outline-variant/20 rounded-xl divide-y divide-outline-variant/10">
                      {detail.submissions.map((s: any) => (
                        <div key={s.id} className="px-4 py-3 space-y-1">
                          <div className="flex justify-between items-center gap-3">
                            <span className="text-sm text-on-surface truncate">
                              {s.assignment?.title ?? "Assignment"}
                            </span>
                            <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">
                              {String(s.status).replace(/_/g, " ")}
                            </span>
                          </div>
                          {s.feedback && (
                            <p className="text-xs text-on-surface-variant">{s.feedback}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
