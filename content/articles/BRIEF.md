# Article brief (shared by every writer)

InsightNest (https://insightnest.in) runs a live, weekend data analytics programme for learners in India:
Excel, SQL, Python, Statistics, Power BI and data storytelling, plus using Generative AI in analysis.
16 live sessions over 8 weekends (Sat & Sun, 10 AM – 1 PM IST, Hindi + English), 3 mini + 4 major
portfolio projects, career support (resume, LinkedIn, interview prep) run as live sessions.
Price ₹2,999. 487+ students taught. Programme page: `/` (pricing anchor `/#pricing`).

## Goal
Rank on Google India for the article's primary keyword, and be quotable by AI answer engines.
Write for a real reader first: a fresher, student or career-switcher in India.

## Hard rules
- Output ONE file per article at `content/articles/<slug>.md`, in exactly this format:

  ```
  ---
  title: <SEO title, 50–62 characters, primary keyword near the start>
  slug: <slug given below>
  category: <category given below>
  excerpt: <meta description, 140–158 characters, includes the keyword, ends with a reason to click>
  ---
  <markdown body>
  ```
- 1,400–2,200 words of body. Substance over padding: concrete examples, real function names, real SQL/Python, worked numbers.
- The page already renders the title as the H1 and the excerpt under it. **Do not start the body with an H1 or repeat the title.** Open with a 2–3 sentence direct answer to the search query (this is what featured snippets and AI engines quote), then use `##` and `###` headings.
- Include a `## Frequently asked questions` section near the end with 4–6 `###` questions phrased the way people search ("Is SQL enough to get a data analyst job?"), each answered in 2–4 sentences.
- Finish with a short `## Next steps` (or similar) section that naturally mentions the InsightNest programme ONCE with a link to `/`. Keep it helpful, not salesy. No other promotional copy.
- Link to 2–4 of the sibling articles below where genuinely relevant, as `[anchor text](/articles/<slug>)`. Descriptive anchor text, never "click here".
- India context: ₹ and LPA for salaries, Indian cities and employers types (IT services, GCCs, startups, BFSI, e-commerce), Naukri/LinkedIn/Instahyre.
- **No fabrication.** No invented statistics, surveys, testimonials, student stories, quotes or named sources you can't stand behind. Salary figures must be framed as typical ranges reported on salary portals (AmbitionBox, Glassdoor, Naukri), varying by city, company and skills — never a precise invented number. No "studies show". Don't promise jobs or placements.
- Date context: today is October 2026. Use "2026" in titles only where the topic is genuinely time-sensitive.

## The renderer is a minimal Markdown subset — respect it exactly
Supported: `##`/`###`/`####` headings, paragraphs, `**bold**`, `*italic*`, `` `inline code` ``,
fenced code blocks (```sql / ```python), `[links](/path)`, `- ` bullet lists, `1. ` numbered lists,
`> ` blockquotes, `---` rules.
NOT supported, so never use: tables (use bullet lists or "Label: value" lines instead), nested lists,
HTML tags, footnotes, images, multi-paragraph list items.
- A bare `*` in normal prose turns into italics. Never write `*` outside a code span/fence
  (write `SELECT *` only inside backticks or a code block; write "x" or "times" for multiplication).
- Each list item must be a single line.
- Code goes in fenced blocks; keep it correct and runnable (standard SQL, pandas).

## Style
Plain, confident, specific. Short paragraphs (2–4 sentences). No fluff intros ("In today's data-driven world…"),
no "delve", no "unlock", no "landscape", no emojis, no exclamation marks. Use "you". British/Indian spelling is fine.

## All 15 articles (for internal linking)
- how-to-become-a-data-analyst-in-india — How to become a data analyst in India (roadmap) — Careers
- data-analyst-salary-in-india — Data analyst salary in India — Careers
- data-analyst-vs-data-scientist-vs-business-analyst — Role differences — Careers
- become-a-data-analyst-without-tech-background — Career switch / non-tech background — Careers
- data-analyst-resume-for-freshers — Resume guide for freshers — Careers
- data-analyst-portfolio-project-ideas — Portfolio project ideas — Careers
- data-analyst-skills — Skills employers hire for — Skills & Tools
- sql-for-data-analysis — SQL for data analysis, beginner's guide — Skills & Tools
- excel-for-data-analysts — Excel functions and features analysts use — Skills & Tools
- python-pandas-for-data-analysis — Python and pandas for data analysis — Skills & Tools
- power-bi-vs-tableau — Power BI vs Tableau — Skills & Tools
- statistics-for-data-analysts — Statistics concepts analysts need — Skills & Tools
- chatgpt-for-data-analysis — Using ChatGPT / GenAI for data analysis — Skills & Tools
- data-analyst-interview-questions — Data analyst interview questions — Interview Prep
- sql-interview-questions-for-data-analysts — SQL interview questions — Interview Prep
