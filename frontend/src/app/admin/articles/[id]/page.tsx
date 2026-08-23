"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { renderMarkdown, readingMinutes, slugify } from "@/lib/markdown";

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  status: "draft" | "published";
  published_at: string | null;
};

export default function ArticleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, excerpt, content, cover_image_url, category, status, published_at")
        .eq("id", id)
        .single();

      if (error) setMessage({ type: "error", text: error.message });
      else setArticle(data as Article);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const preview = useMemo(() => renderMarkdown(article?.content ?? ""), [article?.content]);

  const set = <K extends keyof Article>(key: K, value: Article[K]) =>
    setArticle((a) => (a ? { ...a, [key]: value } : a));

  const save = async (overrides: Partial<Article> = {}) => {
    if (!article) return;
    setSaving(true);
    setMessage(null);

    const next = { ...article, ...overrides };

    if (!next.title.trim()) {
      setMessage({ type: "error", text: "Give the article a title before saving." });
      setSaving(false);
      return;
    }
    const slug = slugify(next.slug || next.title);
    if (!slug) {
      setMessage({ type: "error", text: "The slug is empty. Add a title with letters or numbers." });
      setSaving(false);
      return;
    }

    // Stamp published_at on the first publish only, so re-publishing an edit
    // does not reorder it to the top of the blog.
    const publishedAt =
      next.status === "published" && !next.published_at ? new Date().toISOString() : next.published_at;

    const { error } = await supabase
      .from("articles")
      .update({
        title: next.title.trim(),
        slug,
        excerpt: next.excerpt?.trim() || null,
        content: next.content,
        cover_image_url: next.cover_image_url?.trim() || null,
        category: next.category?.trim() || null,
        status: next.status,
        published_at: publishedAt,
        // Stored so the public index can show reading time without
        // transferring every article body. See src/app/articles/page.tsx.
        read_minutes: readingMinutes(next.content),
      })
      .eq("id", article.id);

    setSaving(false);

    if (error) {
      setMessage({
        type: "error",
        // 23505 is the unique-violation code; the only unique index here is the slug.
        text: error.code === "23505" ? `The slug "${slug}" is already used by another article.` : error.message,
      });
      return;
    }

    setArticle({ ...next, slug, published_at: publishedAt });
    setMessage({
      type: "success",
      text: next.status === "published" ? "Saved and published." : "Draft saved.",
    });
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

  if (!article) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant mb-4">Article not found.</p>
        <Link href="/admin/articles" className="text-secondary font-semibold hover:underline">
          Back to articles
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-secondary transition-colors mb-1"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            All articles
          </Link>
          <h1 className="text-2xl font-bold text-primary-container truncate">
            {article.title || "Untitled article"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              article.status === "published"
                ? "bg-green-100 text-green-700"
                : "bg-surface-container-highest text-on-surface"
            }`}
          >
            {article.status}
          </span>
          <button
            onClick={() => save()}
            disabled={saving}
            className="px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-colors disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => save({ status: article.status === "published" ? "draft" : "published" })}
            disabled={saving}
            className="px-4 py-2.5 bg-secondary text-on-secondary rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all shadow-sm disabled:opacity-70"
          >
            {article.status === "published" ? "Unpublish" : "Publish"}
          </button>
        </div>
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

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Editor */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden">
          <div className="p-6 space-y-5 border-b border-outline-variant/20">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5">Title</label>
              <input
                value={article.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="How to write a window function"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-lg font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5">Excerpt</label>
              <textarea
                value={article.excerpt ?? ""}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={2}
                placeholder="One or two sentences shown on the blog card and in Google results."
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm resize-y"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 px-6 pt-4">
            {(["write", "preview"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                  tab === t
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {t}
              </button>
            ))}
            <span className="ml-auto text-xs text-on-surface-variant">
              {readingMinutes(article.content)} min read
            </span>
          </div>

          <div className="p-6">
            {tab === "write" ? (
              <textarea
                value={article.content}
                onChange={(e) => set("content", e.target.value)}
                rows={26}
                spellCheck
                placeholder={"## A heading\n\nWrite in Markdown.\n\n**bold**, *italic*, `code`\n\n- a list item\n- another\n\n> A pull quote\n\n[a link](https://insightnest.in)"}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 font-mono text-sm leading-relaxed resize-y"
              />
            ) : (
              <div className="min-h-[400px]">
                {article.content.trim() ? (
                  <div
                    className="text-on-surface"
                    dangerouslySetInnerHTML={{ __html: preview }}
                  />
                ) : (
                  <p className="text-on-surface-variant text-sm py-20 text-center">
                    Nothing to preview yet. Switch to Write and start typing.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-primary-container">Settings</h2>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">URL slug</label>
            <input
              value={article.slug}
              onChange={(e) => set("slug", e.target.value)}
              onBlur={(e) => set("slug", slugify(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm font-mono"
            />
            <p className="text-xs text-on-surface-variant mt-1.5 break-all">
              insightnest.in/articles/{article.slug || "…"}
            </p>
            {article.title && slugify(article.slug) !== slugify(article.title) && (
              <button
                onClick={() => set("slug", slugify(article.title))}
                className="text-xs text-secondary font-semibold hover:underline mt-1"
              >
                Use slug from title
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">Category</label>
            <input
              value={article.category ?? ""}
              onChange={(e) => set("category", e.target.value)}
              placeholder="SQL, Python, Career…"
              className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">Cover image URL</label>
            <input
              value={article.cover_image_url ?? ""}
              onChange={(e) => set("cover_image_url", e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm"
            />
            {article.cover_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.cover_image_url}
                alt=""
                className="mt-3 w-full aspect-[16/10] object-cover rounded-xl border border-outline-variant/30"
              />
            )}
          </div>

          {article.published_at && (
            <p className="text-xs text-on-surface-variant pt-2 border-t border-outline-variant/20">
              First published{" "}
              {new Date(article.published_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          <div className="pt-2 border-t border-outline-variant/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Markdown cheatsheet
            </h3>
            <ul className="text-xs text-on-surface-variant space-y-1 font-mono">
              <li>## Heading</li>
              <li>**bold** *italic*</li>
              <li>- bullet list</li>
              <li>1. numbered list</li>
              <li>&gt; quote</li>
              <li>[text](url)</li>
              <li>![alt](image-url)</li>
              <li>`inline code`</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
