// ============================================================
// Builds the SQL that publishes content/articles/*.md to the articles table.
//
//   node content/build-articles-seed.mjs
//
// Each .md file is the source of truth for one post: YAML-ish front matter
// (title, slug, category, excerpt) followed by the Markdown body. The output
// is an idempotent INSERT ... ON CONFLICT DO NOTHING, so re-running it never
// overwrites a post that has since been edited in /admin/articles.
//
// Before writing anything it checks each post against what the site's
// renderer (frontend/src/lib/markdown.ts) can actually display, and against
// the SEO limits for titles and descriptions. Any failure aborts the build.
// ============================================================

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderMarkdown, readingMinutes } from "../frontend/src/lib/markdown.ts";

const root = dirname(fileURLToPath(import.meta.url));
const dir = join(root, "articles");
const out = join(root, "..", "backend/supabase/migrations/20261012120000_seed_seo_articles.sql");

// Listed newest-first: the first slug gets the latest published_at, so it
// leads the /articles index.
const ORDER = [
  "how-to-become-a-data-analyst-in-india",
  "data-analyst-salary-in-india",
  "data-analyst-skills",
  "sql-for-data-analysis",
  "data-analyst-interview-questions",
  "excel-for-data-analysts",
  "python-pandas-for-data-analysis",
  "power-bi-vs-tableau",
  "data-analyst-portfolio-project-ideas",
  "sql-interview-questions-for-data-analysts",
  "become-a-data-analyst-without-tech-background",
  "data-analyst-resume-for-freshers",
  "statistics-for-data-analysts",
  "chatgpt-for-data-analysis",
  "data-analyst-vs-data-scientist-vs-business-analyst",
];

function parse(file) {
  const raw = readFileSync(join(dir, file), "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = Object.fromEntries(
    m[1].split("\n").filter(Boolean).map((l) => {
      const i = l.indexOf(":");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
  );
  return { file, ...meta, content: m[2].trim() + "\n" };
}

function problems(a, slugs) {
  const p = [];
  const body = a.content;
  if (a.title.length < 30 || a.title.length > 65) p.push(`title is ${a.title.length} chars`);
  if (a.excerpt.length < 120 || a.excerpt.length > 160) p.push(`excerpt is ${a.excerpt.length} chars`);
  if (!["Careers", "Skills & Tools", "Interview Prep"].includes(a.category)) p.push(`category "${a.category}"`);
  if (!/^## Frequently asked questions/m.test(body)) p.push("no FAQ section");

  // Strip code before looking for prose that the renderer would mangle.
  const prose = body.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  if (/^#\s/m.test(prose)) p.push("body has an H1");
  if (/^\s*\|.*\|\s*$/m.test(prose)) p.push("contains a table");
  if (/<[a-z][^>]*>/i.test(prose)) p.push("contains raw HTML");
  if (/^\s{2,}[-*\d]/m.test(prose)) p.push("contains a nested list");
  const stray = prose.replace(/\*\*[^*\n]+\*\*/g, "").replace(/(^|[^*])\*[^*\n]+\*/g, "$1").replace(/^\s*\*\s/gm, "");
  if (stray.includes("*")) p.push("stray * in prose");

  for (const [, href] of body.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const s = href.match(/^\/articles\/([^/#?]+)/);
    if (s && !slugs.has(s[1])) p.push(`links to missing article ${href}`);
  }
  if (!/\]\(\/(#pricing)?\)/.test(body)) p.push("no link to the programme");

  const html = renderMarkdown(body);
  if (html.includes("&lt;") && /&lt;[a-z]/i.test(html.replace(/<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>/g, "")))
    p.push("renders escaped tags in prose");
  return p;
}

const files = readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "BRIEF.md");
const articles = files.map(parse);
const slugs = new Set(articles.map((a) => a.slug));

let failed = false;
for (const a of articles) {
  if (`${a.slug}.md` !== a.file) console.error(`${a.file}: slug "${a.slug}" does not match filename`), (failed = true);
  if (!ORDER.includes(a.slug)) console.error(`${a.file}: not in ORDER`), (failed = true);
  const p = problems(a, slugs);
  if (p.length) console.error(`${a.file}:\n  - ${p.join("\n  - ")}`), (failed = true);
}
const missing = ORDER.filter((s) => !slugs.has(s));
if (missing.length) console.error(`missing: ${missing.join(", ")}`), (failed = true);
if (failed) process.exit(1);

articles.sort((x, y) => ORDER.indexOf(x.slug) - ORDER.indexOf(y.slug));

// Dollar quoting means the body needs no escaping, provided the tag never
// appears inside it.
const q = (s) => {
  if (s.includes("$md$")) throw new Error("body contains $md$");
  return `$md$${s}$md$`;
};

const rows = articles.map((a, i) =>
  `  (${q(a.slug)}, ${q(a.title)}, ${q(a.excerpt)}, ${q(a.content)}, ${q(a.category)}, 'published', now() - interval '${i * 3} hours', ${readingMinutes(a.content)})`
);

const sql = `-- ============================================================
-- Publishes ${articles.length} SEO articles. Generated by content/build-articles-seed.mjs
-- from content/articles/*.md — edit the Markdown and regenerate, don't edit
-- this file by hand.
--
-- ON CONFLICT DO NOTHING: a slug that already exists is left alone, so
-- re-running this never overwrites a post edited in /admin/articles.
-- ============================================================

insert into public.articles
  (slug, title, excerpt, content, category, status, published_at, read_minutes)
values
${rows.join(",\n")}
on conflict ((lower(slug))) do nothing;
`;

writeFileSync(out, sql);
for (const a of articles)
  console.log(`${String(readingMinutes(a.content)).padStart(2)} min  ${a.title.length}c  ${a.excerpt.length}c  ${a.slug}`);
console.log(`\nwrote ${out}`);
