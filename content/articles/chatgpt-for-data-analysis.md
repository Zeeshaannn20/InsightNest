---
title: ChatGPT for Data Analysis: 10 Prompts and How to Verify
slug: chatgpt-for-data-analysis
category: Skills & Tools
excerpt: ChatGPT for data analysis, done safely: 10 copy-paste prompts for SQL, Excel and cleaning, how to check the output, and what never to paste in.
---
ChatGPT for data analysis works best as a fast assistant, not as the analyst: use it to draft and debug SQL, Excel formulas and pandas code, plan data cleaning, explain unfamiliar output and turn your findings into clear writing. It does not know your data, it can be confidently wrong, and it should never see customer or company data you are not allowed to share. Check every query and number it gives you before it reaches a stakeholder.

## What ChatGPT is genuinely useful for

Think of it as a colleague who has read a lot of documentation but has never seen your company's database. Where it saves real time:

- Writing a first draft of a SQL query when you describe the tables and the question.
- Debugging an error message, such as a GROUP BY error or a type mismatch in a join.
- Building Excel formulas with `XLOOKUP`, `SUMIFS`, `IFERROR` or `TEXT`, and explaining long nested ones.
- Planning how to clean a messy dataset before you write any code.
- Explaining output you have not seen before: a regression summary, a p-value, a confusing chart.
- Drafting the written part of the job: insight summaries, email updates, slide headlines.

The prompts in this guide also work in other general-purpose assistants such as Gemini, Claude or Microsoft Copilot.

### Where it goes wrong

- It invents table and column names that sound right when you do not give it the schema.
- It mixes SQL dialects, for example `DATE_TRUNC` (PostgreSQL) with `DATE_FORMAT` (MySQL), or `TOP` (SQL Server) with `LIMIT`.
- It does arithmetic in text and gets it wrong, especially across long lists of numbers.
- It writes queries that run without errors but answer a slightly different question.
- It produces plausible "insights" that your data does not actually support.

The last two are the dangerous ones, because nothing crashes.

## 10 ChatGPT prompts for data analysis you can copy

Each prompt below gives the model context (tables, columns, SQL dialect, goal) and asks for reasoning you can check. Replace the bracketed parts with your own. Describe structure, or use made-up sample rows, never real records.

### 1. Write a SQL query from your schema

```text
You are helping me write SQL for PostgreSQL.
Tables:
- orders(order_id, customer_id, order_date, amount, status)
- customers(customer_id, city, signup_date)
Question: total revenue and number of orders per city for completed
orders in September 2026, highest revenue first.
Write the query, then explain each clause in one line.
List any assumption you make about the data.
```

Naming the dialect and listing the exact columns removes most hallucinated names. Asking for assumptions surfaces things like "I assumed status is lowercase", which you can then check.

### 2. Debug a SQL error

```text
This MySQL query fails with the error below. Explain the cause in
plain English, give the corrected query, and tell me how to avoid
this error in future.
Query:
[paste query]
Error:
[paste the exact error message]
```

### 3. Build an Excel formula

```text
In Excel 365, column A has order IDs, column B has region (North,
South, East, West), column C has order dates and column D has amounts.
Write one formula that sums the amount for the South region in
August 2026. Then give an alternative using a pivot table.
Explain what each argument does.
```

A good answer will use `SUMIFS` with two date conditions. If it uses `SUMIF` with a single condition, it has misread the question.

### 4. Explain a formula or query you inherited

```text
Explain this formula step by step as if I am new to Excel.
Then tell me what it returns if the lookup value is missing,
and how to make it safer.
[paste formula]
```

### 5. Plan the cleaning of a messy dataset

```text
I have a CSV of 40,000 retail transactions with these columns:
txn_id, txn_date (mixed formats like 03/09/2026 and 2026-09-03),
store_city (values like "Bangalore", "Bengaluru", "BLR"),
amount (some negative, some blank), payment_mode.
Give me a cleaning plan as an ordered checklist: what to check, why,
and what decision I need to make for each issue. Do not write code yet.
```

Asking for decisions matters. Is 03/09/2026 the 3rd of September or the 9th of March? Is a negative amount a refund or an error? The model cannot know; it can only make sure you ask.

### 6. Turn the plan into pandas code

```text
Write pandas code for steps 1 to 4 of that plan, using a DataFrame
named df. After each step, print the row count so I can see how many
rows changed. Do not drop rows silently; flag them in a new column.
```

### 7. Explain statistical output

```text
I ran an A/B test on a checkout page. Variant A: 4,812 visitors,
386 orders. Variant B: 4,790 visitors, 431 orders. A two-proportion
z-test gave p = 0.09.
Explain what this p-value means in plain language, what it does not
mean, and what I should tell my manager. Do not recompute the numbers.
```

"Do not recompute" keeps the model on interpretation, which it does well, and away from arithmetic, which you should do in a proper tool.

### 8. Draft insights from a summary you calculated

```text
Here is a summary I calculated in SQL (monthly revenue in ₹ lakh):
Jun 42.1, Jul 44.8, Aug 39.5, Sep 46.2.
Average order value in ₹: Jun 812, Jul 798, Aug 731, Sep 805.
Write three short, factual observations a sales manager would care
about. Use only the numbers given. For each, suggest one question
I should check in the data before presenting it.
```

The figures here are placeholders. The point is the pattern: you compute, the model words it, and it flags what to double-check.

### 9. Rewrite a finding for a non-technical audience

```text
Rewrite this finding for a business head who has two minutes.
Lead with the decision it supports, keep it under 80 words,
and avoid jargon like "statistically significant".
[paste your finding]
```

### 10. Ask it to attack your analysis

```text
Here is my analysis plan and conclusion. Act as a sceptical senior
analyst. List the five most likely ways I could be wrong (data issues,
biased samples, wrong joins, confounders), and for each, the specific
check I should run.
[paste plan and conclusion]
```

This pushes you to look for problems rather than confirm what you already believe.

## How to verify what ChatGPT gives you

Treat AI output like code from a new colleague: probably useful, never trusted unchecked. A short routine catches most problems.

1. Run it on the real data in your own tool. Never accept a number calculated inside the chat window.
2. Check row counts before and after every join and filter. A join that multiplies rows inflates every total after it.
3. Recompute one figure a different way, for example a pivot table total against the SQL total.
4. Test edge cases: NULLs, blanks, zeros, duplicate IDs and dates at month boundaries.
5. Confirm the functions exist in your version. `XLOOKUP` needs Excel 2021 or 365, and `QUALIFY` does not exist in MySQL or PostgreSQL.
6. Read every line and make sure you can explain it. If you cannot explain it, you cannot defend it in a review.

### A worked example: the query that runs but answers the wrong question

Suppose you ask for "all customers with their 2026 orders, including customers who have not ordered". A query like this is a common result:

```sql
SELECT c.customer_id, c.city, o.order_id, o.amount
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_date >= DATE '2026-01-01';
```

It runs without errors. But for customers with no orders, `o.order_date` is NULL, and a comparison with NULL is never true, so the WHERE clause removes exactly the customers you asked to keep. The LEFT JOIN has quietly become an inner join. The fix is to move the date condition into the join:

```sql
SELECT c.customer_id, c.city, o.order_id, o.amount
FROM customers c
LEFT JOIN orders o
  ON o.customer_id = c.customer_id
 AND o.order_date >= DATE '2026-01-01';
```

Step 2 of the routine catches this immediately: count distinct customers in the result and compare it with the customers table. If you want to get faster at spotting these traps yourself, work through our [beginner's guide to SQL for data analysis](/articles/sql-for-data-analysis).

## Data privacy: what never goes into a public AI tool

Consumer chatbots are third-party services. Depending on the product, plan and settings, your conversations may be stored and may be used to improve future models. Data from your employer or your clients is not yours to share, however convenient it would be.

Never paste:

- Customer names, phone numbers, email addresses or home addresses.
- Aadhaar, PAN, bank account or card details.
- Raw transaction exports, CRM extracts, or HR and payroll data.
- Unreleased financials, pricing, contracts or strategy documents.
- Database passwords, API keys or connection strings.

India's Digital Personal Data Protection Act, 2023 places obligations on organisations that handle personal data, and many employers in BFSI, healthcare, IT services and GCCs have their own policies on AI tools. Some provide an approved enterprise assistant with different data terms. Use what your company approves, and ask your manager or the security team when you are unsure.

You can still get full value from these tools without sharing data:

- Share the schema (table names, column names, data types), not the rows.
- Create a few synthetic rows with the same shape and realistic quirks.
- Mask or aggregate first: replace names with IDs, or share totals instead of records.
- Run code locally and paste only the error message, after checking it contains no data values.

## What AI cannot replace

The model can draft a query in seconds. It cannot do the parts of the job that make an analyst worth hiring:

- Framing the question. When someone asks "why are sales down?", you decide which sales, compared with what period, and which segment matters.
- Knowing your data's quirks: test orders in production, a migration that duplicated rows, a city renamed halfway through the year in the CRM.
- Judging plausibility. A 40% jump in conversion overnight should send you to check the tracking before anyone celebrates.
- Accountability. Your name is on the dashboard, not the model's.
- Fundamentals. You can only verify SQL you could have written, and Excel logic you could have built.

That last point matters for hiring too. Technical interviews in India still commonly include live SQL and Excel rounds where outside help is not allowed, so practise the [data analyst interview questions](/articles/data-analyst-interview-questions) without an assistant open. Strengthen your base with our guides to [Excel for data analysts](/articles/excel-for-data-analysts) and [Python and pandas for data analysis](/articles/python-pandas-for-data-analysis), then use AI to go faster, not to skip the learning.

## Frequently asked questions

### Can ChatGPT replace data analysts?

It replaces some tasks, such as writing boilerplate queries and first drafts of summaries. It does not replace understanding the business, knowing where the data is unreliable, or being accountable for a recommendation. Analysts who use AI well tend to get more done in the same time.

### Is it safe to upload my company's Excel file to ChatGPT?

Not unless your company has explicitly approved that tool for that kind of data. Files often contain customer details or confidential figures. Share the column structure or synthetic sample rows instead, and do the real calculation in Excel itself.

### Do I still need to learn SQL if ChatGPT can write it?

Yes. You need to read a query well enough to spot a wrong join, a missing filter or a NULL trap, and that requires knowing SQL. Interviews also test SQL directly, usually without AI.

### Can I use ChatGPT during a data analyst assessment?

Only if the rules say so. Many online assessments and live technical rounds prohibit outside help and may be proctored. Some take-home assignments allow AI tools if you disclose how you used them, so read the instructions and ask the recruiter if unclear.

### How do I show AI skills on my resume?

Be specific rather than listing "ChatGPT" as a skill. Describe what you did, for example "used an LLM to draft data-cleaning steps, then validated each step with row-count checks in pandas". Interviewers will ask how you verified the output, so have an example ready.

## Next steps

Pick a public dataset from Kaggle or data.gov.in and work through the ten prompts above, running every query yourself and recording where the model was right and where it slipped. That habit of checking is the real skill. If you would like guided practice, InsightNest's [live weekend data analytics programme](/) covers Excel, SQL, Python, Power BI, statistics and how to use Generative AI in analysis, with portfolio projects you build along the way.
