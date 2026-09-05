"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CohortStatus = "planned" | "active" | "completed" | "archived";

type Cohort = {
  id: string;
  name: string;
  course_id: string | null;
  start_date: string | null;
  end_date: string | null;
  status: CohortStatus;
  notes: string | null;
};

type Member = {
  enrollment_id: string;
  student_id: string;
  full_name: string;
  email: string;
  source: string | null;
  progress_pct: number | null;
  cohort_id: string | null;
};

const STATUS_STYLE: Record<CohortStatus, string> = {
  planned: "bg-surface-container-highest text-on-surface",
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  archived: "bg-surface-container text-on-surface-variant",
};

export default function AdminCohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", course_id: "", start_date: "", status: "planned" as CohortStatus });
  const [search, setSearch] = useState("");

  const supabase = createClient();

  /**
   * enrollments.student_id has no foreign key to profiles, so PostgREST
   * cannot embed the student. Fetch both and stitch, as the enrolments page
   * does.
   */
  const loadMembers = useCallback(async () => {
    const { data: enrolments, error } = await supabase
      .from("enrollments")
      .select("id, student_id, source, progress_pct, cohort_id")
      .eq("status", "active");

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    // The generated Supabase types do not yet know about cohort_id, so the
    // row shape is declared here rather than inferred.
    type EnrolmentRow = {
      id: string;
      student_id: string;
      source: string | null;
      progress_pct: number | null;
      cohort_id: string | null;
    };
    const rows = (enrolments ?? []) as EnrolmentRow[];
    const ids = [...new Set(rows.map((r) => r.student_id))];

    const byId = new Map<string, { full_name: string; email: string }>();
    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      for (const p of profiles ?? []) {
        byId.set(p.id, { full_name: p.full_name ?? "", email: p.email ?? "" });
      }
    }

    setMembers(
      rows.map((r) => ({
        enrollment_id: r.id,
        student_id: r.student_id,
        full_name: byId.get(r.student_id)?.full_name?.trim() || "Unknown student",
        email: byId.get(r.student_id)?.email ?? "",
        source: r.source,
        progress_pct: r.progress_pct,
        cohort_id: r.cohort_id,
      }))
    );
  }, [supabase]);

  const loadCohorts = useCallback(async () => {
    const { data, error } = await supabase
      .from("cohorts")
      .select("id, name, course_id, start_date, end_date, status, notes")
      .order("start_date", { ascending: false, nullsFirst: false });

    if (error) setMessage({ type: "error", text: error.message });
    else setCohorts((data ?? []) as Cohort[]);
  }, [supabase]);

  useEffect(() => {
    (async () => {
      const { data: courseRows } = await supabase
        .from("courses")
        .select("id, title")
        .order("created_at", { ascending: false });

      const list = courseRows ?? [];
      setCourses(list);
      if (list.length > 0) setForm((f) => ({ ...f, course_id: list[0].id }));

      await Promise.all([loadCohorts(), loadMembers()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = cohorts.find((c) => c.id === selectedId) ?? null;

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of members) {
      if (m.cohort_id) map.set(m.cohort_id, (map.get(m.cohort_id) ?? 0) + 1);
    }
    return map;
  }, [members]);

  const assigned = useMemo(
    () => members.filter((m) => m.cohort_id === selectedId),
    [members, selectedId]
  );

  const unassigned = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members
      .filter((m) => !m.cohort_id)
      .filter((m) => !q || m.full_name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }, [members, search]);

  const createCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setBusy(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("cohorts")
      .insert({
        name: form.name.trim(),
        course_id: form.course_id || null,
        start_date: form.start_date || null,
        status: form.status,
      })
      .select("id")
      .single();

    setBusy(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setForm({ name: "", course_id: courses[0]?.id ?? "", start_date: "", status: "planned" });
    setShowForm(false);
    await loadCohorts();
    setSelectedId(data.id);
    setMessage({ type: "success", text: "Cohort created." });
  };

  /** Setting cohortId to null removes the student from the batch. */
  const setCohort = async (enrollmentId: string, cohortId: string | null) => {
    setBusy(true);
    const { error } = await supabase
      .from("enrollments")
      .update({ cohort_id: cohortId })
      .eq("id", enrollmentId);
    setBusy(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMembers((ms) =>
      ms.map((m) => (m.enrollment_id === enrollmentId ? { ...m, cohort_id: cohortId } : m))
    );
  };

  const addAllVisible = async () => {
    if (!selectedId || unassigned.length === 0) return;
    if (!confirm(`Add all ${unassigned.length} unassigned students to "${selected?.name}"?`)) return;

    setBusy(true);
    const ids = unassigned.map((m) => m.enrollment_id);
    const { error } = await supabase.from("enrollments").update({ cohort_id: selectedId }).in("id", ids);
    setBusy(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMembers((ms) =>
      ms.map((m) => (ids.includes(m.enrollment_id) ? { ...m, cohort_id: selectedId } : m))
    );
  };

  const updateStatus = async (cohort: Cohort, status: CohortStatus) => {
    const { error } = await supabase.from("cohorts").update({ status }).eq("id", cohort.id);
    if (error) setMessage({ type: "error", text: error.message });
    else setCohorts((cs) => cs.map((c) => (c.id === cohort.id ? { ...c, status } : c)));
  };

  const removeCohort = async (cohort: Cohort) => {
    const n = counts.get(cohort.id) ?? 0;
    if (
      !confirm(
        `Delete "${cohort.name}"?${
          n > 0 ? ` ${n} student${n === 1 ? "" : "s"} will be unassigned but keep course access.` : ""
        }`
      )
    )
      return;

    const { error } = await supabase.from("cohorts").delete().eq("id", cohort.id);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setCohorts((cs) => cs.filter((c) => c.id !== cohort.id));
    setMembers((ms) => ms.map((m) => (m.cohort_id === cohort.id ? { ...m, cohort_id: null } : m)));
    if (selectedId === cohort.id) setSelectedId(null);
  };

  const exportCsv = () => {
    if (!selected) return;
    const rows = [
      ["Name", "Email", "Source", "Progress %"],
      ...assigned.map((m) => [
        m.full_name,
        m.email,
        m.source ?? "manual",
        String(Math.round(Number(m.progress_pct ?? 0))),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-students.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  const unbatched = members.filter((m) => !m.cohort_id).length;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-container">Cohorts</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {cohorts.length} cohort{cohorts.length === 1 ? "" : "s"} · {unbatched} student
            {unbatched === 1 ? "" : "s"} not yet assigned
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-on-secondary rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-base">{showForm ? "close" : "add"}</span>
          {showForm ? "Cancel" : "New cohort"}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-error-container text-on-error-container border border-error/20"
          }`}
        >
          <span className="material-symbols-outlined">
            {message.type === "success" ? "check_circle" : "error"}
          </span>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={createCohort}
          className="max-w-2xl bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 shadow-card animate-slide-down space-y-5"
        >
          <h2 className="text-lg font-bold text-primary-container">Create a cohort</h2>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="September 2026 Batch"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm font-bold text-on-surface">Course</label>
              <select
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary text-sm"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface">Start date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all shadow-md disabled:opacity-70"
          >
            Create cohort
          </button>
        </form>
      )}

      <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Cohort list */}
        <div className="space-y-3">
          {cohorts.length === 0 ? (
            <div className="border border-dashed border-outline-variant rounded-2xl py-14 text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2 block">groups</span>
              <p className="text-sm text-on-surface-variant px-6">
                No cohorts yet. Create one to start grouping your students by batch.
              </p>
            </div>
          ) : (
            cohorts.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                className={`w-full text-left rounded-2xl border p-5 transition-all ${
                  selectedId === c.id
                    ? "border-secondary bg-secondary-container/20 shadow-card"
                    : "border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-bold text-primary-container leading-snug">{c.name}</span>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold ${STATUS_STYLE[c.status]}`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-on-surface-variant flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">group</span>
                    {counts.get(c.id) ?? 0} students
                  </span>
                  {c.start_date && (
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">event</span>
                      {new Date(c.start_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Members panel */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden">
          {!selected ? (
            <div className="py-24 text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2 block">touch_app</span>
              <p className="text-sm text-on-surface-variant">
                Select a cohort to see and manage its students.
              </p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-primary-container text-lg">{selected.name}</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {assigned.length} student{assigned.length === 1 ? "" : "s"} in this cohort
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selected.status}
                    onChange={(e) => updateStatus(selected, e.target.value as CohortStatus)}
                    className="py-2 px-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm"
                  >
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button
                    onClick={exportCsv}
                    disabled={assigned.length === 0}
                    className="px-3 py-2 rounded-xl border border-outline-variant text-sm font-semibold hover:bg-surface-container-low transition-colors disabled:opacity-50"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => removeCohort(selected)}
                    className="px-3 py-2 rounded-xl bg-error/10 text-error text-sm font-semibold hover:bg-error/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Current members */}
              <div className="p-6 border-b border-outline-variant/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                  In this cohort
                </h3>
                {assigned.length === 0 ? (
                  <p className="text-sm text-on-surface-variant py-4">
                    Nobody assigned yet. Add students from the list below.
                  </p>
                ) : (
                  <ul className="divide-y divide-outline-variant/20">
                    {assigned.map((m) => (
                      <li key={m.enrollment_id} className="flex items-center justify-between gap-4 py-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-primary-container text-sm truncate">
                            {m.full_name}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate">{m.email}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs tabular-nums text-on-surface-variant">
                            {Math.round(Number(m.progress_pct ?? 0))}%
                          </span>
                          <button
                            onClick={() => setCohort(m.enrollment_id, null)}
                            disabled={busy}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Add students */}
              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Unassigned students ({unassigned.length})
                  </h3>
                  {unassigned.length > 0 && (
                    <button
                      onClick={addAllVisible}
                      disabled={busy}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-secondary-container text-on-secondary-container hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      Add all {unassigned.length}
                    </button>
                  )}
                </div>

                <div className="relative mb-4">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">
                    search
                  </span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or email…"
                    className="pl-10 pr-3 py-2.5 w-full bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {unassigned.length === 0 ? (
                  <p className="text-sm text-on-surface-variant py-4">
                    {search ? "No students match that search." : "Every active student is in a cohort."}
                  </p>
                ) : (
                  <ul className="divide-y divide-outline-variant/20 max-h-96 overflow-y-auto">
                    {unassigned.map((m) => (
                      <li key={m.enrollment_id} className="flex items-center justify-between gap-4 py-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-primary-container text-sm truncate">
                            {m.full_name}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate">{m.email}</p>
                        </div>
                        <button
                          onClick={() => setCohort(m.enrollment_id, selected.id)}
                          disabled={busy}
                          className="shrink-0 text-xs px-3 py-1.5 rounded-lg font-semibold bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors disabled:opacity-50"
                        >
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
