"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type WaitlistStatus = "pending" | "invited" | "converted" | "declined";

type Entry = {
  id: string;
  email: string;
  course_slug: string | null;
  status: WaitlistStatus;
  notes: string | null;
  created_at: string;
  notified_at: string | null;
  course?: { title: string } | null;
};

const STATUSES: WaitlistStatus[] = ["pending", "invited", "converted", "declined"];

const STATUS_STYLES: Record<WaitlistStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  invited: "bg-blue-100 text-blue-700",
  converted: "bg-green-100 text-green-700",
  declined: "bg-surface-container-highest text-on-surface-variant",
};

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | WaitlistStatus>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const supabase = createClient();

  const fetchEntries = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("waitlist")
      .select("*, course:courses(title)")
      .order("created_at", { ascending: false });

    if (err) setError(err.message);
    else setEntries((data ?? []) as Entry[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const courseOptions = useMemo(
    () => [...new Set(entries.map((e) => e.course_slug).filter(Boolean))] as string[],
    [entries]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (courseFilter !== "all" && e.course_slug !== courseFilter) return false;
      if (!q) return true;
      return (
        e.email.toLowerCase().includes(q) ||
        e.course_slug?.toLowerCase().includes(q) ||
        e.course?.title?.toLowerCase().includes(q)
      );
    });
  }, [entries, search, statusFilter, courseFilter]);

  const updateStatus = async (entry: Entry, status: WaitlistStatus) => {
    const patch: Record<string, unknown> = { status };
    if (status === "invited" && !entry.notified_at) patch.notified_at = new Date().toISOString();

    const { error: err } = await supabase.from("waitlist").update(patch).eq("id", entry.id);
    if (err) setError(err.message);
    else
      setEntries((es) =>
        es.map((e) => (e.id === entry.id ? { ...e, ...(patch as Partial<Entry>) } : e))
      );
  };

  const remove = async (entry: Entry) => {
    if (!confirm(`Remove ${entry.email} from the waitlist?`)) return;
    const { error: err } = await supabase.from("waitlist").delete().eq("id", entry.id);
    if (err) setError(err.message);
    else setEntries((es) => es.filter((e) => e.id !== entry.id));
  };

  const exportCsv = () => {
    const headers = ["Email", "Course", "Status", "Joined", "Invited"];
    const rows = filtered.map((e) => [
      e.email,
      e.course?.title ?? e.course_slug ?? "",
      e.status,
      new Date(e.created_at).toISOString().slice(0, 10),
      e.notified_at ? new Date(e.notified_at).toISOString().slice(0, 10) : "",
    ]);

    const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `insightnest-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyEmails = async () => {
    await navigator.clipboard.writeText(filtered.map((e) => e.email).join(", "));
  };

  const pendingCount = entries.filter((e) => e.status === "pending").length;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-container tracking-tight mb-2">Waitlist</h1>
          <p className="text-on-surface-variant">
            {loading
              ? "People waiting for a seat."
              : `${filtered.length} of ${entries.length} · ${pendingCount} awaiting a decision`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={copyEmails}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">content_copy</span>
            Copy emails
          </button>
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
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or course…"
            className="pl-10 pr-3 py-2.5 w-64 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="py-2.5 px-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {courseOptions.length > 0 && (
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="py-2.5 px-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All courses</option>
            {courseOptions.map((slug) => (
              <option key={slug} value={slug}>
                {slug}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant">
              <tr>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Interested in</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-3xl">
                      progress_activity
                    </span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                    {entries.length === 0
                      ? "Nobody on the waitlist yet."
                      : "No entries match these filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-6 py-4">
                      <a
                        href={`mailto:${entry.email}`}
                        className="font-semibold text-primary-container hover:text-secondary hover:underline"
                      >
                        {entry.email}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface line-clamp-1">
                        {entry.course?.title ?? entry.course_slug ?? "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </div>
                      {entry.notified_at && (
                        <div className="text-xs text-on-surface-variant">
                          Invited {new Date(entry.notified_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          STATUS_STYLES[entry.status]
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={entry.status}
                          onChange={(e) => updateStatus(entry, e.target.value as WaitlistStatus)}
                          className="text-xs py-1.5 px-2 bg-surface-container border border-outline-variant/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => remove(entry)}
                          title="Remove from waitlist"
                          className="p-1.5 rounded-lg text-error hover:bg-error-container/20 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
