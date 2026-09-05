"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";

type Announcement = {
  id: string;
  title: string;
  content: string;
  course_id: string | null;
  cohort_id: string | null;
  created_at: string | null;
};

type Cohort = { id: string; name: string; status: string };
type Course = { id: string; title: string };

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [reach, setReach] = useState<Map<string | null, number>>(new Map());

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({ title: "", content: "", course_id: "", cohort_id: "" });

  const supabase = createClient();
  const { user } = useAuth();

  const load = useCallback(async () => {
    const [{ data: anns }, { data: cohortRows }, { data: courseRows }, { data: enrolments }] =
      await Promise.all([
        supabase
          .from("announcements")
          .select("id, title, content, course_id, cohort_id, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.from("cohorts").select("id, name, status").order("start_date", { ascending: false }),
        supabase.from("courses").select("id, title").order("created_at", { ascending: false }),
        supabase.from("enrollments").select("cohort_id").eq("status", "active"),
      ]);

    setAnnouncements((anns ?? []) as Announcement[]);
    setCohorts((cohortRows ?? []) as Cohort[]);

    const courseList = (courseRows ?? []) as Course[];
    setCourses(courseList);
    setForm((f) => ({ ...f, course_id: f.course_id || courseList[0]?.id || "" }));

    // How many active students each target would reach, shown before sending.
    const map = new Map<string | null, number>();
    const rows = (enrolments ?? []) as { cohort_id: string | null }[];
    map.set(null, rows.length);
    for (const r of rows) {
      if (r.cohort_id) map.set(r.cohort_id, (map.get(r.cohort_id) ?? 0) + 1);
    }
    setReach(map);
  }, [supabase]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const recipientCount = useMemo(
    () => (form.cohort_id ? reach.get(form.cohort_id) ?? 0 : reach.get(null) ?? 0),
    [form.cohort_id, reach]
  );

  const cohortName = (id: string | null) =>
    id ? cohorts.find((c) => c.id === id)?.name ?? "Deleted cohort" : "Everyone on the course";

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    if (
      !confirm(
        `Send "${form.title.trim()}" to ${recipientCount} student${
          recipientCount === 1 ? "" : "s"
        } (${cohortName(form.cohort_id || null)})?\n\nThey will see it in their notification bell straight away.`
      )
    )
      return;

    setSending(true);
    setMessage(null);

    // One insert. A database trigger fans it out to every targeted student's
    // notifications, so delivery cannot drift from the announcement itself.
    const { error } = await supabase.from("announcements").insert({
      instructor_id: user?.id,
      course_id: form.course_id || null,
      cohort_id: form.cohort_id || null,
      title: form.title.trim(),
      content: form.content.trim(),
    });

    setSending(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setForm({ ...form, title: "", content: "" });
    await load();
    setMessage({
      type: "success",
      text: `Sent to ${recipientCount} student${recipientCount === 1 ? "" : "s"}.`,
    });
  };

  const remove = async (a: Announcement) => {
    if (!confirm(`Delete "${a.title}"? Notifications already delivered stay in students' bells.`)) return;

    const { error } = await supabase.from("announcements").delete().eq("id", a.id);
    if (error) setMessage({ type: "error", text: error.message });
    else setAnnouncements((xs) => xs.filter((x) => x.id !== a.id));
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
      <div>
        <h1 className="text-3xl font-bold text-primary-container">Announcements</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Send a message to everyone on a course, or to one cohort. It appears in the student&apos;s
          notification bell immediately.
        </p>
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

      <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
        {/* Compose */}
        <form
          onSubmit={send}
          className="bg-surface-container-lowest rounded-2xl p-7 border border-outline-variant/30 shadow-card space-y-5"
        >
          <h2 className="text-lg font-bold text-primary-container">New announcement</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
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
              <label className="block text-sm font-bold text-on-surface">Send to</label>
              <select
                value={form.cohort_id}
                onChange={(e) => setForm({ ...form, cohort_id: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary text-sm"
              >
                <option value="">Everyone on the course</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({reach.get(c.id) ?? 0})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="Saturday session moved to 4 PM"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface">Message</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              rows={7}
              placeholder="Write the message students will read in their notifications."
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm resize-y leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-sm text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">group</span>
              Reaches <strong className="text-primary-container">{recipientCount}</strong> student
              {recipientCount === 1 ? "" : "s"}
            </p>
            <button
              type="submit"
              disabled={sending || recipientCount === 0}
              className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all shadow-md btn-press flex items-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">
                {sending ? "progress_activity" : "send"}
              </span>
              {sending ? "Sending…" : "Send announcement"}
            </button>
          </div>

          {recipientCount === 0 && (
            <p className="text-xs text-on-surface-variant">
              No active students match this target, so there is nobody to notify.
            </p>
          )}
        </form>

        {/* History */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/20">
            <h2 className="font-bold text-primary-container">Sent</h2>
          </div>

          {announcements.length === 0 ? (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2 block">campaign</span>
              <p className="text-sm text-on-surface-variant">Nothing sent yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/20 max-h-[36rem] overflow-y-auto">
              {announcements.map((a) => (
                <li key={a.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-primary-container text-sm leading-snug">{a.title}</p>
                    <button
                      onClick={() => remove(a)}
                      aria-label="Delete announcement"
                      className="shrink-0 text-outline hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                    {a.content}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold ${
                        a.cohort_id
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-surface-container-highest text-on-surface"
                      }`}
                    >
                      {cohortName(a.cohort_id)}
                    </span>
                    {a.created_at && (
                      <span className="text-outline">
                        {new Date(a.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
