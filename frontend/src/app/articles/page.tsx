import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import { readingMinutes } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Articles — InsightNest",
  description:
    "Practical writing on data analytics: SQL, Python, Power BI, Excel and the career side of becoming an analyst.",
};

// Published articles change when the admin publishes, not when we deploy.
export const revalidate = 60;

type ArticleCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  published_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ArticlesPage() {
  const supabase = await createClient();

  // RLS already restricts anonymous readers to published rows; the explicit
  // filter keeps the intent obvious and covers staff, who can see drafts.
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, content, cover_image_url, category, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const articles = (data ?? []) as ArticleCard[];
  const [lead, ...rest] = articles;

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo variant="img2" className="h-9 w-auto" />
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-on-surface hover:text-secondary font-medium transition-colors">
              Course
            </Link>
            <Link href="/articles" className="text-secondary font-semibold">
              Articles
            </Link>
            <Link
              href="/#pricing"
              className="bg-secondary text-on-secondary px-5 py-2 rounded-full font-semibold hover:bg-secondary/90 transition-all shadow-sm"
            >
              Enroll Now
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="max-w-3xl mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary mb-3">Articles</p>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-container tracking-tight text-balance">
            Notes on doing analytics well
          </h1>
          <p className="mt-5 text-lg text-on-surface-variant leading-relaxed">
            Practical writing on SQL, Python, Power BI, Excel and the career side of the job.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm flex items-start gap-3">
            <span className="material-symbols-outlined">error</span>
            <p className="font-medium">Could not load articles: {error.message}</p>
          </div>
        )}

        {!error && articles.length === 0 && (
          <div className="border border-dashed border-outline-variant rounded-2xl py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-3 block">draft</span>
            <p className="text-on-surface-variant">No articles published yet. Check back soon.</p>
          </div>
        )}

        {lead && (
          <Link
            href={`/articles/${lead.slug}`}
            className="group block mb-12 rounded-3xl overflow-hidden border border-outline-variant/40 bg-surface-container-lowest hover:shadow-card transition-shadow"
          >
            <div className="grid md:grid-cols-2">
              <div className="aspect-[16/10] md:aspect-auto md:min-h-[300px] bg-surface-container-low overflow-hidden">
                {lead.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={lead.cover_image_url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/15 to-primary-container/10">
                    <span className="material-symbols-outlined text-6xl text-secondary/40">article</span>
                  </div>
                )}
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-xs font-semibold text-on-surface-variant mb-3">
                  {lead.category && (
                    <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container">
                      {lead.category}
                    </span>
                  )}
                  <span>{formatDate(lead.published_at)}</span>
                  <span>{readingMinutes(lead.content)} min read</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary-container tracking-tight leading-snug group-hover:text-secondary transition-colors">
                  {lead.title}
                </h2>
                {lead.excerpt && (
                  <p className="mt-4 text-on-surface-variant leading-relaxed line-clamp-3">{lead.excerpt}</p>
                )}
                <span className="mt-6 inline-flex items-center gap-1.5 text-secondary font-semibold text-sm">
                  Read article
                  <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </span>
              </div>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden border border-outline-variant/40 bg-surface-container-lowest hover:shadow-card transition-shadow"
              >
                <div className="aspect-[16/10] bg-surface-container-low overflow-hidden">
                  {article.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.cover_image_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/12 to-primary-container/8">
                      <span className="material-symbols-outlined text-4xl text-secondary/40">article</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-on-surface-variant mb-2.5">
                    {article.category && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                        {article.category}
                      </span>
                    )}
                    <span>{readingMinutes(article.content)} min</span>
                  </div>
                  <h3 className="font-bold text-primary-container text-lg leading-snug group-hover:text-secondary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="mt-2.5 text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                  <span className="mt-auto pt-4 text-xs text-outline">{formatDate(article.published_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-outline-variant/30 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-on-surface-variant">
          <p>© {new Date().getFullYear()} InsightNest</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-secondary transition-colors">Course</Link>
            <Link href="/privacy" className="hover:text-secondary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-secondary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
