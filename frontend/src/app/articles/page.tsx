import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import { BlogJsonLd } from "@/components/JsonLd";
import { BATCH } from "@/lib/landing-content";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "Data Analytics Career Guides & Tutorials",
  "Practical guides to SQL, Python, Power BI, Excel and analyst careers in India, with real examples, interview questions and salary information.",
  "/articles"
);

// Published articles change when the admin publishes, not when we deploy.
export const revalidate = 60;

const PER_PAGE = 12;

type ArticleCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string | null;
  published_at: string | null;
  read_minutes: number | null;
};

type Props = {
  searchParams: Promise<{ page?: string; category?: string }>;
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { page: pageParam, category } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PER_PAGE;

  let articles: ArticleCard[] = [];
  let total = 0;
  let categories: string[] = [];

  // A database problem should leave the reader on a tidy page rather than a
  // 500. The failure is still logged, so it stays diagnosable.
  try {
    const supabase = await createClient();

    // Note the absent `content` column. Reading time comes from read_minutes so
    // the index never transfers article bodies — at 100 posts that is the
    // difference between a fast page and a megabyte of unused text.
    let query = supabase
      .from("articles")
      .select(
        "id, slug, title, excerpt, cover_image_url, category, published_at, read_minutes",
        { count: "exact" }
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(from, from + PER_PAGE - 1);

    if (category) query = query.eq("category", category);

    const { data, error, count } = await query;
    if (error) throw error;

    articles = (data ?? []) as ArticleCard[];
    total = count ?? 0;

    // Category chips, so a reader (and a crawler) can move between topics.
    const { data: categoryRows } = await supabase
      .from("articles")
      .select("category")
      .eq("status", "published")
      .not("category", "is", null);

    categories = [
      ...new Set((categoryRows ?? []).map((r) => r.category as string).filter(Boolean)),
    ].sort();
  } catch (err) {
    console.error("Articles index failed to load:", err);
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  // The lead card only makes sense on an unfiltered first page.
  const showLead = page === 1 && !category && articles.length > 0;
  const lead = showLead ? articles[0] : null;
  const rest = showLead ? articles.slice(1) : articles;

  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return qs ? `/articles?${qs}` : "/articles";
  };

  return (
    <div className="min-h-screen bg-surface">
      <BlogJsonLd />
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
              href="/#courses"
              className="bg-secondary text-on-secondary px-5 py-2 rounded-full font-semibold hover:bg-secondary/90 transition-all shadow-sm"
            >
              Enroll Now
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary mb-3">Articles</p>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-container tracking-tight text-balance">
            {category ? `${category} articles` : "Notes on doing analytics well"}
          </h1>
          <p className="mt-5 text-lg text-on-surface-variant leading-relaxed">
            Practical writing on SQL, Python, Power BI, Excel and the career side of the job.
          </p>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12">
            <Link
              href="/articles"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                !category
                  ? "bg-secondary text-on-secondary"
                  : "bg-surface-container-low text-on-surface hover:bg-surface-container"
              }`}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c}
                href={`/articles?category=${encodeURIComponent(c)}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  category === c
                    ? "bg-secondary text-on-secondary"
                    : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        )}

        {articles.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-8 md:p-14 text-center shadow-card">
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-2xl mx-auto flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container/30 border border-secondary-container text-secondary text-xs font-bold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Coming soon
              </div>

              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6 shadow-sm">
                <span className="material-symbols-outlined text-3xl">auto_stories</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-primary-container tracking-tight">
                {category
                  ? `Articles on ${category} are on the way`
                  : "Practical data analytics guides, coming soon"}
              </h2>

              <p className="mt-4 text-on-surface-variant leading-relaxed text-base md:text-lg">
                We are writing hands-on guides, case studies and interview playbooks covering SQL, Python,
                Power BI, Excel and data storytelling.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-2.5 max-w-xl">
                {[
                  "SQL query optimisation and window functions",
                  "Python and Pandas on real datasets",
                  "Power BI DAX and executive dashboards",
                  "Advanced Excel formulas and modelling",
                  "Analyst interview prep and resume tips",
                ].map((topic) => (
                  <span
                    key={topic}
                    className="px-3.5 py-1.5 rounded-xl bg-surface-container-low text-xs font-medium text-on-surface border border-outline-variant/30"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/#curriculum"
                  className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all shadow-md btn-press flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  Explore the curriculum
                </Link>
                <a
                  href={BATCH.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-outline-variant/60 text-primary-container px-6 py-3 rounded-xl font-bold text-sm hover:bg-surface-container-low transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  Get updates on WhatsApp
                </a>
              </div>
            </div>
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
                  <span>{lead.read_minutes ?? 1} min read</span>
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
                    <span>{article.read_minutes ?? 1} min</span>
                  </div>
                  <h2 className="font-bold text-primary-container text-lg leading-snug group-hover:text-secondary transition-colors line-clamp-2">
                    {article.title}
                  </h2>
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

        {totalPages > 1 && (
          <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
            {page > 1 && (
              <Link
                href={pageHref(page - 1)}
                rel="prev"
                className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-semibold hover:bg-surface-container-low transition-colors"
              >
                Previous
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-on-surface-variant">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={pageHref(page + 1)}
                rel="next"
                className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-semibold hover:bg-surface-container-low transition-colors"
              >
                Next
              </Link>
            )}
          </nav>
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
