"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/markdown";

type Row = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
};

export default function AdminArticlesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");

  const supabase = createClient();
  const router = useRouter();

  const load = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("id, slug, title, category, status, published_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) setError(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        (r.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const createArticle = async () => {
    setCreating(true);
    setError(null);

    // A unique placeholder slug, so two "Untitled" drafts never collide.
    const stamp = Date.now().toString(36);
    const { data, error } = await supabase
      .from("articles")
      .insert({ title: "Untitled article", slug: `untitled-${stamp}`, status: "draft", content: "" })
      .select("id")
      .single();

    setCreating(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/admin/articles/${data.id}`);
  };

  const remove = async (row: Row) => {
    if (!confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("articles").delete().eq("id", row.id);
    if (error) setError(error.message);
    else setRows((rs) => rs.filter((r) => r.id !== row.id));
  };

  const togglePublish = async (row: Row) => {
    const next = row.status === "published" ? "draft" : "published";
    const patch: Record<string, unknown> = { status: next };
    // Stamp the first publish; keep the original date on re-publish.
    if (next === "published" && !row.published_at) patch.published_at = new Date().toISOString();

    const { error } = await supabase.from("articles").update(patch).eq("id", row.id);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((rs) =>
      rs.map((r) =>
        r.id === row.id
          ? { ...r, status: next, published_at: (patch.published_at as string) ?? r.published_at }
          : r
      )
    );
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
          <h1 className="text-3xl font-bold text-primary-container">Articles</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {filtered.length} of {rows.length} article{rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/articles"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-base">open_in_new</span>
            View blog
          </Link>
          <button
            onClick={createArticle}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-on-secondary rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all shadow-sm disabled:opacity-70"
          >
            <span className="material-symbols-outlined text-base">
              {creating ? "progress_activity" : "add"}
            </span>
            New article
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, slug or category…"
            className="pl-10 pr-3 py-2.5 w-72 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="py-2.5 px-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Updated</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    {rows.length === 0
                      ? "No articles yet. Click “New article” to write your first one."
                      : "No articles match these filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/articles/${row.id}`}
                        className="font-semibold text-primary-container hover:text-secondary transition-colors"
                      >
                        {row.title}
                      </Link>
                      <div className="text-xs text-on-surface-variant font-mono mt-0.5">/{row.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{row.category || "—"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          row.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-surface-container-highest text-on-surface"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-xs">
                      {new Date(row.updated_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {row.status === "published" && (
                          <Link
                            href={`/articles/${row.slug}`}
                            target="_blank"
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors"
                          >
                            View
                          </Link>
                        )}
                        <button
                          onClick={() => togglePublish(row)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                            row.status === "published"
                              ? "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {row.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <Link
                          href={`/admin/articles/${row.id}`}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-secondary-container text-on-secondary-container hover:opacity-90 transition-opacity"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => remove(row)}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-error/10 text-error hover:bg-error/20 transition-colors"
                        >
                          Delete
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

      <p className="text-xs text-on-surface-variant">
        Tip: a new article gets a placeholder slug like <code className="font-mono">untitled-abc123</code>.
        Set a real one in the editor before publishing — it becomes the public URL, and changing it later
        breaks any links already shared. Suggested from your title:{" "}
        <code className="font-mono">{slugify("Your Article Title Here") || "your-article-title-here"}</code>
      </p>
    </div>
  );
}
