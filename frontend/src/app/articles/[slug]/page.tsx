import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import { renderMarkdown, readingMinutes } from "@/lib/markdown";
import { ArticleJsonLd } from "@/components/JsonLd";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  published_at: string | null;
  updated_at: string | null;
  read_minutes: number | null;
};

async function loadArticle(slug: string): Promise<Article | null> {
  // Returning null on failure sends the reader to the 404 page instead of a
  // 500. The error is logged so a real outage is still visible in the logs.
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("id, slug, title, excerpt, content, cover_image_url, category, published_at, updated_at, read_minutes")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    return (data as Article) ?? null;
  } catch (err) {
    console.error(`Article "${slug}" failed to load:`, err);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await loadArticle(slug);
  if (!article) return { title: "Article not found — InsightNest" };

  const description = article.excerpt ?? undefined;
  return {
    title: `${article.title} — InsightNest`,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await loadArticle(slug);
  if (!article) notFound();

  const published = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  // renderMarkdown escapes the source before emitting any tag, so the only
  // markup here is what that function produced. See src/lib/markdown.ts.
  const body = renderMarkdown(article.content);

  return (
    <div className="min-h-screen bg-surface">
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt}
        slug={article.slug}
        image={article.cover_image_url}
        publishedAt={article.published_at}
        updatedAt={article.updated_at}
      />
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

      <article className="max-w-3xl mx-auto px-6 py-14 md:py-20">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-secondary transition-colors mb-8"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          All articles
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-on-surface-variant mb-4">
          {article.category && (
            <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container">
              {article.category}
            </span>
          )}
          {published && <span>{published}</span>}
          <span>{article.read_minutes ?? readingMinutes(article.content)} min read</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-primary-container tracking-tight leading-[1.12] text-balance">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="mt-5 text-lg md:text-xl text-on-surface-variant leading-relaxed">{article.excerpt}</p>
        )}

        {article.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.cover_image_url}
            alt=""
            className="mt-10 w-full rounded-2xl border border-outline-variant/30"
          />
        )}

        <div
          className="mt-10 text-on-surface text-[1.0625rem]"
          dangerouslySetInnerHTML={{ __html: body }}
        />

        <div className="mt-16 rounded-2xl bg-primary-container text-white p-8 md:p-10">
          <h2 className="text-2xl font-bold tracking-tight">Want to learn this properly?</h2>
          <p className="mt-3 text-white/75 leading-relaxed">
            The Data Analytics with GenAI for Placement Bootcamp covers Excel, SQL, Python, Power BI and Statistics live over
            8 weekends, built on 7 real projects.
          </p>
          <Link
            href="/#pricing"
            className="mt-6 inline-block bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-all shadow-md"
          >
            See the programme
          </Link>
        </div>
      </article>

      <footer className="border-t border-outline-variant/30">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-on-surface-variant">
          <p>© {new Date().getFullYear()} InsightNest</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-secondary transition-colors">Course</Link>
            <Link href="/articles" className="hover:text-secondary transition-colors">Articles</Link>
            <Link href="/privacy" className="hover:text-secondary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
