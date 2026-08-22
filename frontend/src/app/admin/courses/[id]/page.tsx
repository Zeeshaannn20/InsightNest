"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Course, CourseStatus, Lesson, Module } from "@/lib/types/database";

const STATUSES: CourseStatus[] = [
  "draft",
  "coming_soon",
  "open",
  "published",
  "closed",
  "archived",
];

/** Postgres interval ("00:45:00") -> minutes, for editing. */
function intervalToMinutes(v: string | null): string {
  if (!v) return "";
  const parts = String(v).split(":");
  if (parts.length < 2) return "";
  return String(Number(parts[0]) * 60 + Number(parts[1]));
}

const field =
  "w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-all";
const label =
  "block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5";

type ModuleWithLessons = Module & { lessons: Lesson[] };

export default function CourseBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const supabase = createClient();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // settings form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<CourseStatus>("draft");
  const [priceRupees, setPriceRupees] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // curriculum drafts
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [lessonDraft, setLessonDraft] = useState<
    Record<string, { title: string; video_url: string; minutes: string; free: boolean }>
  >({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [{ data: courseData, error: courseErr }, { data: moduleData, error: moduleErr }] =
      await Promise.all([
        supabase.from("courses").select("*").eq("id", id).single(),
        supabase
          .from("modules")
          .select("*, lessons(*)")
          .eq("course_id", id)
          .order("order_index", { ascending: true }),
      ]);

    if (courseErr) {
      setError(courseErr.message);
      setLoading(false);
      return;
    }

    const c = courseData as Course;
    setCourse(c);
    setTitle(c.title ?? "");
    setDescription(c.description ?? "");
    setSlug(c.slug ?? "");
    setStatus((c.status as CourseStatus) ?? "draft");
    setPriceRupees(c.price_paise != null ? String(c.price_paise / 100) : "");
    setThumbnailUrl(c.thumbnail_url ?? "");
    setCategory(c.category ?? "");
    setDurationWeeks(c.duration_weeks != null ? String(c.duration_weeks) : "");
    setIsPublished(Boolean(c.is_published));

    if (moduleErr) {
      setError(moduleErr.message);
    } else {
      const mods = (moduleData ?? []) as ModuleWithLessons[];
      mods.forEach((m) =>
        m.lessons?.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      );
      setModules(mods);
    }
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  };

  // ---------------- settings ----------------

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setError(null);

    const paise = priceRupees.trim() === "" ? null : Math.round(Number(priceRupees) * 100);

    const { error: err } = await supabase
      .from("courses")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        slug: slug.trim() || null,
        status,
        // price_paise is what checkout reads; keep the legacy rupee column in step
        price_paise: paise,
        price: paise == null ? null : paise / 100,
        thumbnail_url: thumbnailUrl.trim() || null,
        category: category.trim() || null,
        duration_weeks: durationWeeks.trim() === "" ? null : Number(durationWeeks),
        is_published: isPublished,
      })
      .eq("id", id);

    if (err) setError(err.message);
    else flash("Course settings saved.");
    setSavingSettings(false);
  };

  // ---------------- modules ----------------

  const addModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setAddingModule(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("modules")
      .insert({
        course_id: id,
        title: newModuleTitle.trim(),
        order_index: modules.length,
      })
      .select("*, lessons(*)")
      .single();

    if (err) setError(err.message);
    else {
      setModules([...modules, { ...(data as ModuleWithLessons), lessons: [] }]);
      setNewModuleTitle("");
    }
    setAddingModule(false);
  };

  const renameModule = async (moduleId: string, value: string) => {
    setModules((ms) => ms.map((m) => (m.id === moduleId ? { ...m, title: value } : m)));
    const { error: err } = await supabase
      .from("modules")
      .update({ title: value })
      .eq("id", moduleId);
    if (err) setError(err.message);
  };

  const deleteModule = async (moduleId: string, lessonCount: number) => {
    if (
      !confirm(
        lessonCount > 0
          ? `Delete this module and its ${lessonCount} lesson(s)? This cannot be undone.`
          : "Delete this module?"
      )
    )
      return;

    const { error: err } = await supabase.from("modules").delete().eq("id", moduleId);
    if (err) setError(err.message);
    else setModules(modules.filter((m) => m.id !== moduleId));
  };

  /** Swap order_index with the neighbour in the given direction. */
  const moveModule = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= modules.length) return;

    const reordered = [...modules];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setModules(reordered);

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("modules").update({ order_index: target }).eq("id", modules[index].id),
      supabase.from("modules").update({ order_index: index }).eq("id", modules[target].id),
    ]);
    if (e1 || e2) setError((e1 || e2)!.message);
  };

  // ---------------- lessons ----------------

  const draftFor = (moduleId: string) =>
    lessonDraft[moduleId] ?? { title: "", video_url: "", minutes: "", free: false };

  const setDraft = (moduleId: string, patch: Partial<ReturnType<typeof draftFor>>) =>
    setLessonDraft((d) => ({ ...d, [moduleId]: { ...draftFor(moduleId), ...patch } }));

  const addLesson = async (e: React.FormEvent, mod: ModuleWithLessons) => {
    e.preventDefault();
    const draft = draftFor(mod.id);
    if (!draft.title.trim()) return;
    setError(null);

    const { data, error: err } = await supabase
      .from("lessons")
      .insert({
        module_id: mod.id,
        title: draft.title.trim(),
        video_url: draft.video_url.trim() || null,
        duration: draft.minutes.trim() ? `${Number(draft.minutes)} minutes` : null,
        is_free_preview: draft.free,
        order_index: mod.lessons?.length ?? 0,
      })
      .select()
      .single();

    if (err) {
      setError(err.message);
      return;
    }

    setModules((ms) =>
      ms.map((m) =>
        m.id === mod.id ? { ...m, lessons: [...(m.lessons ?? []), data as Lesson] } : m
      )
    );
    setLessonDraft((d) => ({ ...d, [mod.id]: { title: "", video_url: "", minutes: "", free: false } }));
  };

  const updateLesson = async (
    moduleId: string,
    lessonId: string,
    patch: Partial<Lesson>
  ) => {
    setModules((ms) =>
      ms.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...patch } : l)),
            }
          : m
      )
    );
    const { error: err } = await supabase.from("lessons").update(patch).eq("id", lessonId);
    if (err) setError(err.message);
  };

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    const { error: err } = await supabase.from("lessons").delete().eq("id", lessonId);
    if (err) setError(err.message);
    else
      setModules((ms) =>
        ms.map((m) =>
          m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
        )
      );
  };

  const moveLesson = async (mod: ModuleWithLessons, index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= mod.lessons.length) return;

    const reordered = [...mod.lessons];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setModules((ms) => ms.map((m) => (m.id === mod.id ? { ...m, lessons: reordered } : m)));

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("lessons").update({ order_index: target }).eq("id", mod.lessons[index].id),
      supabase.from("lessons").update({ order_index: index }).eq("id", mod.lessons[target].id),
    ]);
    if (e1 || e2) setError((e1 || e2)!.message);
  };

  // ---------------- render ----------------

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm">
          {error || "Course not found."}
        </div>
        <Link href="/admin/courses" className="text-secondary text-sm mt-4 inline-block">
          ← Back to courses
        </Link>
      </div>
    );
  }

  const lessonTotal = modules.reduce((n, m) => n + (m.lessons?.length ?? 0), 0);

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in space-y-8">
      <div>
        <Link
          href="/admin/courses"
          className="text-sm text-on-surface-variant hover:text-secondary inline-flex items-center gap-1 mb-3"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          All courses
        </Link>
        <h1 className="text-3xl font-bold text-primary-container tracking-tight">{course.title}</h1>
        <p className="text-on-surface-variant mt-1">
          {modules.length} module{modules.length === 1 ? "" : "s"} · {lessonTotal} lesson
          {lessonTotal === 1 ? "" : "s"}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="font-medium">{error}</p>
        </div>
      )}

      {notice && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <p className="font-medium">{notice}</p>
        </div>
      )}

      {/* ---------------- settings ---------------- */}
      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low">
          <h2 className="text-lg font-bold text-primary-container">Course settings</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Pricing, availability and artwork.
          </p>
        </div>

        <form onSubmit={saveSettings} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={label}>Title *</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label className={label}>URL slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="data-analyst"
                className={field}
              />
            </div>
          </div>

          <div>
            <label className={label}>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={field}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={label}>Price (₹)</label>
              <input
                type="number"
                min={0}
                step="1"
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
                placeholder="2999"
                className={field}
              />
              <p className="text-[11px] text-on-surface-variant mt-1">
                Stored in paise. Leave blank for free.
              </p>
            </div>
            <div>
              <label className={label}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CourseStatus)}
                className={field}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Checkout only opens when status is <code>open</code>.
              </p>
            </div>
            <div>
              <label className={label}>Duration (weeks)</label>
              <input
                type="number"
                min={0}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                className={field}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={label}>Thumbnail URL</label>
              <input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://…"
                className={field}
              />
            </div>
            <div>
              <label className={label}>Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Data Analytics"
                className={field}
              />
            </div>
          </div>

          {thumbnailUrl.trim() && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={thumbnailUrl}
              alt="Course thumbnail preview"
              className="h-32 w-auto rounded-xl border border-outline-variant/30 object-cover"
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-outline-variant/20">
            <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              Visible in listings
            </label>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {savingSettings && (
                <span className="material-symbols-outlined animate-spin text-base">
                  progress_activity
                </span>
              )}
              Save settings
            </button>
          </div>
        </form>
      </section>

      {/* ---------------- curriculum ---------------- */}
      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low">
          <h2 className="text-lg font-bold text-primary-container">Curriculum</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Modules hold lessons. Students watch these in order.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {modules.length === 0 && (
            <div className="py-10 text-center border border-dashed border-outline-variant/40 rounded-xl bg-surface-container-low/20">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/50 mb-1">
                library_books
              </span>
              <p className="text-sm text-on-surface-variant">
                No modules yet. Add the first one below.
              </p>
            </div>
          )}

          {modules.map((mod, mIndex) => {
            const draft = draftFor(mod.id);
            return (
              <div
                key={mod.id}
                className="border border-outline-variant/30 rounded-xl overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low/50">
                  <span className="text-xs font-mono text-on-surface-variant w-6 shrink-0">
                    {mIndex + 1}
                  </span>
                  <input
                    value={mod.title}
                    onChange={(e) => renameModule(mod.id, e.target.value)}
                    className="flex-1 bg-transparent font-bold text-primary-container text-sm focus:outline-none focus:bg-surface px-2 py-1 rounded-lg min-w-0"
                  />
                  <button
                    onClick={() => moveModule(mIndex, -1)}
                    disabled={mIndex === 0}
                    title="Move module up"
                    className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                  <button
                    onClick={() => moveModule(mIndex, 1)}
                    disabled={mIndex === modules.length - 1}
                    title="Move module down"
                    className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                  </button>
                  <button
                    onClick={() => deleteModule(mod.id, mod.lessons?.length ?? 0)}
                    title="Delete module"
                    className="p-1 rounded-lg text-error hover:bg-error-container/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                <div className="divide-y divide-outline-variant/10">
                  {(mod.lessons ?? []).map((lesson, lIndex) => (
                    <div key={lesson.id} className="px-4 py-3 flex items-start gap-2">
                      <span className="material-symbols-outlined text-[18px] text-outline mt-1.5">
                        {lesson.video_url ? "play_circle" : "lock"}
                      </span>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <input
                          value={lesson.title}
                          onChange={(e) =>
                            updateLesson(mod.id, lesson.id, { title: e.target.value })
                          }
                          className="w-full bg-transparent text-sm text-on-surface font-medium focus:outline-none focus:bg-surface-container-low px-2 py-1 rounded-lg"
                        />
                        <input
                          value={lesson.video_url ?? ""}
                          onChange={(e) =>
                            updateLesson(mod.id, lesson.id, { video_url: e.target.value || null })
                          }
                          placeholder="Video URL — lesson stays locked without one"
                          className="w-full bg-transparent text-xs text-on-surface-variant focus:outline-none focus:bg-surface-container-low px-2 py-1 rounded-lg"
                        />
                        <div className="flex items-center gap-4 px-2">
                          <span className="text-[11px] text-outline">
                            {intervalToMinutes(lesson.duration) || "—"} min
                          </span>
                          <label className="flex items-center gap-1.5 text-[11px] text-on-surface-variant cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(lesson.is_free_preview)}
                              onChange={(e) =>
                                updateLesson(mod.id, lesson.id, {
                                  is_free_preview: e.target.checked,
                                })
                              }
                              className="w-3.5 h-3.5 accent-primary"
                            />
                            Free preview
                          </label>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveLesson(mod, lIndex, -1)}
                          disabled={lIndex === 0}
                          title="Move lesson up"
                          className="p-0.5 rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-30"
                        >
                          <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                        </button>
                        <button
                          onClick={() => moveLesson(mod, lIndex, 1)}
                          disabled={lIndex === (mod.lessons?.length ?? 0) - 1}
                          title="Move lesson down"
                          className="p-0.5 rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-30"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            arrow_downward
                          </span>
                        </button>
                      </div>
                      <button
                        onClick={() => deleteLesson(mod.id, lesson.id)}
                        title="Delete lesson"
                        className="p-1 rounded-lg text-error hover:bg-error-container/20 mt-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={(e) => addLesson(e, mod)}
                  className="px-4 py-3 bg-surface-container-low/20 border-t border-outline-variant/20 grid grid-cols-1 sm:grid-cols-[2fr_2fr_auto_auto_auto] gap-2 items-center"
                >
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft(mod.id, { title: e.target.value })}
                    placeholder="New lesson title"
                    className="px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    value={draft.video_url}
                    onChange={(e) => setDraft(mod.id, { video_url: e.target.value })}
                    placeholder="Video URL"
                    className="px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="number"
                    min={0}
                    value={draft.minutes}
                    onChange={(e) => setDraft(mod.id, { minutes: e.target.value })}
                    placeholder="Min"
                    className="w-20 px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-on-surface-variant cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={draft.free}
                      onChange={(e) => setDraft(mod.id, { free: e.target.checked })}
                      className="w-3.5 h-3.5 accent-primary"
                    />
                    Free
                  </label>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-secondary/15 hover:bg-secondary/25 text-secondary rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    Add lesson
                  </button>
                </form>
              </div>
            );
          })}

          <form onSubmit={addModule} className="flex gap-2 pt-2">
            <input
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              placeholder="New module title"
              className={field}
            />
            <button
              type="submit"
              disabled={addingModule || !newModuleTitle.trim()}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-colors whitespace-nowrap disabled:opacity-50"
            >
              Add module
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
