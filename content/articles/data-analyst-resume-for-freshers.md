---
title: Data Analyst Resume for Freshers (Template and Examples)
slug: data-analyst-resume-for-freshers
category: Careers
excerpt: Build a data analyst resume for freshers section by section, with a plain-text template, ATS keywords and before-and-after project bullets you can copy.
---
A strong data analyst resume for freshers is one page long, lists Excel, SQL, Python and Power BI in a clearly grouped skills section, and leads with two to four projects whose bullets show a tool, an action and a measurable finding. Recruiters and ATS software look for role keywords first and evidence second. Everything below is about making both easy to find.

## How your resume actually gets read

Most applications on Naukri, LinkedIn, Instahyre and company career pages pass through two filters. First, an applicant tracking system (ATS) parses your resume into fields and matches it against the job description. Then a recruiter or hiring manager skims what's left, usually quickly and usually on a screen.

That leads to three practical rules:

- Use a simple single-column layout that software can parse: no tables, text boxes, icons or skill bars.
- Use the same words the job description uses, wherever they are true for you.
- Put your strongest evidence, which for a fresher is usually projects, in the top half of page one.

## A plain-text resume skeleton

Copy this structure, then replace every line with your own details. Keep the final version to one page.

```text
FULL NAME
Data Analyst | Excel, SQL, Python, Power BI
City, India | +91 XXXXX XXXXX | name@email.com
linkedin.com/in/yourname | github.com/yourname

SUMMARY
Two lines: who you are, the tools you use, and the kind of
business problems you want to work on.

SKILLS
Querying & Programming: SQL (MySQL, PostgreSQL), Python (pandas, NumPy, Matplotlib)
Spreadsheets: Excel (XLOOKUP, SUMIFS, Pivot Tables, Power Query)
BI & Visualisation: Power BI (DAX, data modelling), Tableau
Statistics: descriptive statistics, hypothesis testing, A/B test basics

PROJECTS
Project Name | Tools used | GitHub or dashboard link
- What you analysed, with which tool, and what you found (with a number)
- One recommendation, backed by a number from the data
- Optional: a technical detail such as data size, cleaning steps or model

Project Name | Tools used | Link
- ...
- ...

EXPERIENCE / INTERNSHIPS
Role, Company, City | Mon YYYY - Mon YYYY
- Analytical or reporting work first, with honest numbers

EDUCATION
Degree, College, University | Year | CGPA or percentage

CERTIFICATIONS (optional)
Course name, Provider | Year
```

This order suits most freshers. If you have a relevant analytics internship, move Experience above Projects.

## Section by section

### Header

Name, city, phone, a professional email address, LinkedIn and GitHub. Leave out date of birth, marital status, father's name, full postal address and a photo: analyst roles at most companies don't need them, and they use space you need for projects. Check that your GitHub link opens to repositories with READMEs, not an empty profile.

### Headline and summary

The line under your name should state the target role and core tools, such as `Data Analyst | Excel, SQL, Python, Power BI`. The summary is two lines, not a paragraph about being hardworking and passionate. Here is the shape to aim for:

> Commerce graduate who analyses sales and customer data in SQL and Power BI. Built four end-to-end projects on e-commerce, HR and banking datasets; looking for an entry-level analyst role in BFSI or e-commerce.

### Skills

Group skills by category, as in the skeleton, and list only what you could be questioned on in an interview. If Python is on your resume, expect at least one pandas question. Skip percentage bars and star ratings; they tell a recruiter nothing and ATS software can't read them.

### Projects

For a fresher this is the most important section. Include two to four projects, each with a title, the tools used, a working link, and two or three bullets. Match projects to the jobs you are applying for: a customer cohort analysis reads well for an e-commerce role, and an attrition analysis reads well for HR analytics. The [data analyst portfolio project ideas](/articles/data-analyst-portfolio-project-ideas) article lists ten that suit Indian employers.

### Experience and internships

Include internships, part-time work and non-analytics jobs, but rewrite the bullets to surface any data work. "Maintained a daily sales tracker in Excel for 14 stores" is relevant; "Handled customer queries" on its own is not. If you are moving from a non-tech job, the guide to [becoming a data analyst without a tech background](/articles/become-a-data-analyst-without-tech-background) covers how to reframe that experience. If you have no work experience at all, drop the section rather than padding it.

### Education and certifications

Degree, college, year and score. Keep certifications to one line each. A certificate supports your skills section but doesn't replace projects, because it shows you attended something, not what you can do.

## ATS keywords for data analyst roles

Read five to ten job descriptions for roles you want and note the terms that repeat. For entry-level analyst roles in India, these come up often:

- Tools: SQL, MySQL, PostgreSQL, Excel, Power BI, Tableau, Python, pandas, Power Query, Google Sheets
- Excel: XLOOKUP, VLOOKUP, pivot tables, SUMIFS, conditional formatting, data validation
- SQL concepts: joins, subqueries, CTEs, window functions, aggregation
- Analysis: data cleaning, exploratory data analysis (EDA), KPI reporting, dashboards, trend analysis, cohort analysis
- Statistics: descriptive statistics, hypothesis testing, correlation, regression, A/B testing
- Business: stakeholder communication, data storytelling, MIS reporting, ad hoc analysis

Use the job description's exact spelling ("Power BI", not "PowerBI") and write the acronym with its full form once where both are common, such as "exploratory data analysis (EDA)". Don't paste a hidden block of keywords in white text: it shows up when the ATS converts your resume to plain text, and recruiters notice. The better approach is to weave keywords into project bullets, where they double as evidence.

For which skills deserve the most space, see [the skills employers hire data analysts for](/articles/data-analyst-skills).

## Writing project bullets with real metrics

Freshers often say they have no metrics because they haven't worked anywhere yet. But every project contains numbers: the size of the dataset, the share of something, the gap between two groups, the trend over time. Those numbers come from your own analysis, so they are honest to use.

A reliable pattern is **action verb + what you analysed + tool + finding with a number + so what**.

### Before

- Did sales analysis using SQL and Power BI.
- Made a dashboard to show insights.
- Cleaned the data in Python.

These name the tools you touched but say nothing about what you found or how much work it took.

### After

The numbers below are placeholders to show the shape. Yours must come from your own query results.

- Analysed about 100,000 e-commerce orders across 6 joined tables in PostgreSQL to build monthly revenue, average order value and repeat-purchase metrics.
- Found that late deliveries averaged a review score 1.5 points lower than on-time deliveries; recommended reviewing courier SLAs in the 2 states with the highest late-delivery share.
- Built a 3-page Power BI dashboard with DAX measures for month-on-month growth and category share, published and linked from the GitHub README.

Each "after" bullet tells the reader the scale, the method, the finding and what you would do about it. In an interview, every number is an invitation for the question "How did you get that?", which is exactly the conversation you want.

### Where the numbers come from

Here is the kind of query that produces the second bullet. It labels each order as late or on time, then compares counts and average review scores.

```sql
WITH labelled AS (
  SELECT order_id,
         review_score,
         CASE WHEN delivered_date > promised_date THEN 'Late'
              ELSE 'On time' END AS delivery_status
  FROM orders
  WHERE delivered_date IS NOT NULL
)
SELECT delivery_status,
       COUNT(order_id) AS orders,
       ROUND(AVG(review_score), 2) AS avg_review
FROM labelled
GROUP BY delivery_status;
```

The output gives you two rows. The difference between the two `avg_review` values is your metric, and the `orders` column tells you how much of the business is affected.

### What not to claim

A portfolio project didn't run inside a real business, so it can't have "increased revenue by 15%" or "reduced churn by 10%". Use verbs that match what actually happened: analysed, found, identified, estimated, recommended, built. An honest "estimated ₹X of monthly revenue at risk from churned customers", calculated from the dataset, is stronger than an invented impact claim that falls apart under one follow-up question.

## Common mistakes

- Two or three pages for a fresher, when one page is enough.
- An objective statement about "a challenging position in a reputed organisation" instead of a two-line summary.
- Listing every tool you have heard of; if you can't answer two questions on it, remove it.
- Using only tutorial projects that many other applicants also submit, with the same titles and bullets.
- Claiming business impact a practice project couldn't have had.
- Two-column design templates with icons and skill bars that ATS software can't parse.
- Broken, private or empty GitHub and dashboard links.
- Misspelt tool names such as "My SQL", "Power Bi" or "Pyhton".
- Sending the same resume everywhere instead of adjusting the headline, summary and project order for each type of role.
- An image-based PDF; export a text-based PDF named something like "Firstname-Lastname-Data-Analyst.pdf".

## Frequently asked questions

### Should a fresher's data analyst resume be one page?

Yes. A fresher rarely has enough relevant material for a second page, and a tight single page forces you to keep only your strongest projects and skills. Recruiters skimming many resumes appreciate it.

### How do I write a data analyst resume with no experience?

Lead with projects instead of experience. Pick two to four projects that match your target roles, write each bullet with a tool, a finding and a number from the data, and link to the code or dashboard so the work can be checked.

### Which projects should I put on my data analyst resume?

Choose projects that use different skills, for example one SQL-heavy analysis, one Python analysis and one dashboard, and that relate to the industry you are targeting. Projects built on realistic business data, such as e-commerce orders or HR attrition, read better than generic tutorial datasets.

### Should I include Python on my resume if I only know the basics?

Include it if you can load, clean, filter and group data with pandas and explain what you did. Leave it out, or list it under "learning", if you have only watched tutorials, because interviewers often test anything listed in the skills section.

### Is PDF or Word better for an ATS?

Most modern ATS tools parse a text-based PDF without trouble, and a PDF keeps your formatting intact. If a portal specifically asks for a Word file, follow the instruction. Either way, avoid tables, columns and text boxes.

## Next steps

Fill in the skeleton above, rewrite every project bullet using the before-and-after pattern, then ask a friend to read your resume for 30 seconds and tell you what job you want. If they can't, tighten the headline and summary. Once interviews start, the [data analyst interview questions](/articles/data-analyst-interview-questions) guide helps you prepare for the questions your bullets will trigger. If you want feedback in a structured setting, the [InsightNest data analytics programme](/) includes live resume, LinkedIn and interview-prep sessions alongside portfolio projects.
