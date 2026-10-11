---
title: Data Analyst Interview Questions and Answers: 30 to Practise
slug: data-analyst-interview-questions
category: Interview Prep
excerpt: 30 data analyst interview questions with model answers across Excel, SQL, statistics, case and HR rounds, plus how interviews run in India. Start here.
---
Data analyst interview questions in India usually fall into five groups: Excel, SQL, statistics, business case problems and behavioural questions. Below are 30 commonly asked questions, each with a concise model answer you can adapt in your own words. Start with how the rounds typically run, so you know what each question is really testing.

## How data analyst interviews usually run in India

The exact process varies by company, but most hiring follows some version of these rounds:

1. Online assessment: timed SQL and Excel questions, sometimes aptitude and logical reasoning, often on a platform like HackerRank, or a take-home dataset.
2. Technical round: live SQL on a shared editor, Excel scenarios, and sometimes Python or Power BI, with the interviewer asking you to talk through your approach.
3. Case or business round: an open problem such as a metric drop, a dashboard design or a guesstimate.
4. Hiring manager and HR round: your projects, behavioural questions, notice period and CTC expectations.

IT services firms and large GCCs hiring freshers in bulk lean heavily on the assessment. Startups and e-commerce companies may combine rounds but give more weight to the case discussion.

## Excel interview questions

### 1. What is the difference between VLOOKUP, INDEX-MATCH and XLOOKUP?

VLOOKUP searches the first column of a range and returns a value from a column to its right by position, so it cannot look left and breaks if someone inserts a column. INDEX-MATCH separates the lookup and return columns, so it can look left and survives column changes. XLOOKUP, available in Excel 2021 and 365, does both, defaults to exact match and has a built-in "if not found" argument.

### 2. How do you find duplicates without deleting them?

Add a helper column with `=COUNTIF($A$2:$A$5000, A2)`; any value above 1 is a duplicate. Conditional formatting's Duplicate Values rule highlights them visually. Use Remove Duplicates only after deciding which copy to keep.

### 3. When would you use a pivot table?

When you need to summarise a large table by category quickly, such as revenue by region and month or order count by status. Convert the source to an Excel Table first so new rows are included when you refresh, and use "Show Values As" for percentage of total.

### 4. What is the difference between relative and absolute references?

`A1` shifts when you copy the formula, `$A$1` stays fixed, and `$A1` locks only the column. Use absolute references for fixed inputs like a GST rate cell or a lookup range.

### 5. A city column is inconsistent. How do you clean it?

Use `TRIM` for extra spaces, `PROPER` for case and `CLEAN` for non-printing characters. Then standardise variants like "Bombay" and "Mumbai" with a small mapping table and `XLOOKUP`. If the file arrives every month, record the steps in Power Query so cleaning becomes one refresh.

### 6. How would you total sales for the North region in April 2026?

```text
=SUMIFS(D:D, B:B, "North", C:C, ">="&DATE(2026,4,1), C:C, "<"&DATE(2026,5,1))
```

Here D is amount, B is region and C is order date. Using "on or after 1 April and before 1 May" also handles dates that carry a time component. For more functions worth knowing, see our guide to [Excel for data analysts](/articles/excel-for-data-analysts).

## SQL interview questions

### 7. What is the difference between WHERE and HAVING?

WHERE filters rows before grouping; HAVING filters groups after aggregation, so it can use `SUM()` or `COUNT()`.

```sql
SELECT city, SUM(amount) AS revenue
FROM orders
WHERE status = 'completed'
GROUP BY city
HAVING SUM(amount) > 100000;
```

### 8. Explain the types of joins.

INNER JOIN keeps only matching rows. LEFT JOIN keeps every row from the left table, with NULLs where there is no match. FULL OUTER JOIN keeps all rows from both sides, and a self join links a table to itself, for example employees to their managers. Add that you check row counts after joining, since duplicate keys multiply rows.

### 9. How do you find duplicate records?

```sql
SELECT email, COUNT(*) AS copies
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;
```

### 10. How do you find the second highest salary?

```sql
SELECT MAX(salary) AS second_highest
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);
```

For the Nth highest, use `DENSE_RANK()` so tied salaries are handled correctly.

### 11. How do you rank rows within a group?

Use a window function. Unlike GROUP BY, it keeps every row.

```sql
SELECT dept_id, emp_name, salary,
       DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS salary_rank
FROM employees;
```

### 12. What is the difference between UNION and UNION ALL?

UNION removes duplicate rows from the combined result, which needs extra work. UNION ALL keeps everything and is faster. Use UNION ALL unless you specifically need de-duplication.

### 13. How does NULL behave in SQL?

NULL means unknown, so `NULL = NULL` is not true; use `IS NULL`. `COUNT(column)` skips NULLs while `COUNT(*)` counts every row, and `AVG` ignores NULLs. Use `COALESCE` to substitute a default. Our list of [SQL interview questions for data analysts](/articles/sql-interview-questions-for-data-analysts) has 20 more with full solutions.

## Statistics interview questions

### 14. When would you use the median instead of the mean?

When data is skewed or has outliers, as with salaries, order values or delivery times. Five salaries of ₹20,000, ₹25,000, ₹30,000, ₹35,000 and ₹4,00,000 have a mean of ₹1,02,000 but a median of ₹30,000, and the median describes the typical person far better.

### 15. Explain standard deviation to a non-technical person.

It measures how spread out values are around the average. Two stores can both average 100 orders a day, but one swings between 40 and 160 while the other stays between 90 and 110; the first has a much higher standard deviation and is harder to staff for.

### 16. What is the difference between correlation and causation?

Correlation means two things move together; causation means one drives the other. Umbrella sales and auto-rickshaw demand both rise in the monsoon, but neither causes the other. To show causation you need a controlled experiment, such as an A/B test.

### 17. What is a p-value?

It is the probability of seeing a result at least as extreme as yours if there were truly no effect. A small p-value, below a threshold such as 0.05 chosen in advance, suggests the result is unlikely to be chance alone. It is not the probability that your hypothesis is true.

### 18. How would you design and evaluate an A/B test?

State a hypothesis and one primary metric, randomly split users, and fix the sample size and duration before starting. Run for full weeks to cover weekday patterns, avoid stopping early when results look good, then test significance and check guardrail metrics such as refunds or cancellations.

### 19. How do you detect and treat outliers?

Flag values below Q1 minus 1.5 times the IQR or above Q3 plus 1.5 times the IQR, or with a z-score beyond about 3. Then investigate before acting: a data-entry error should be fixed, while a genuine bulk order may deserve separate analysis. Never delete outliers just to make a chart look cleaner. Our guide to [statistics for data analysts](/articles/statistics-for-data-analysts) covers these concepts in more depth.

## Case and business questions

### 20. Sales dropped 15% last month. How would you investigate?

First confirm the drop is real: check tracking, pipeline failures and metric definitions. Then compare like for like, allowing for seasonality, number of days and festive periods that shift between months. Break revenue into orders times average order value, and orders into traffic times conversion, then segment by region, channel, category and new versus repeat customers to locate the drop before suggesting causes.

### 21. Which metrics would you track for a food delivery app?

A core metric such as completed orders per week, supported by funnel metrics (app opens, menu views, add to cart, checkout), operations metrics (delivery time, cancellation rate), unit economics (average order value, discount per order) and retention (share of customers who reorder within 30 days).

### 22. How do you approach a guesstimate like "How many smartphones are sold in India each year?"

State a structure before any numbers: smartphone users divided by the average replacement cycle in years gives replacement sales, then add first-time buyers. Make each assumption explicit and round, segment where it helps (urban versus rural), and sanity-check the final figure. Interviewers judge your structure and reasoning, not whether you hit an exact number.

### 23. A manager asks for a sales dashboard. What do you put on it?

Ask first who will use it, which decisions it supports and how often. Then a typical layout: KPI cards for revenue, orders and average order value against target and last period, a trend line, breakdowns by region and category, a detail table, and filters for date and region.

### 24. Conversion fell after a new app release. How do you find out why?

Compare each funnel step before and after the release, and segment by app version, operating system and device. Check whether event tracking changed with the release, compare users who updated with those who did not, and review crash or error rates with the engineering team.

### 25. How would you choose customers for a retention campaign?

Use RFM segmentation: score customers on recency, frequency and monetary value. Target valuable customers whose recency is slipping, and keep a random control group that receives no campaign so you can measure the real lift.

## Behavioural questions

### 26. Tell me about yourself.

Keep it to about 90 seconds: where you are now, the relevant skills and projects that got you here, and why this role is the logical next step. Mention one concrete project with the tools you used.

### 27. Walk me through a project you are proud of.

Cover the question, the data, what you did with which tools, what you found and what you would do differently. Have numbers and one chart ready to describe. If you need stronger material, these [data analyst portfolio project ideas](/articles/data-analyst-portfolio-project-ideas) are built for interview discussion.

### 28. Tell me about a time you found a mistake in your data or analysis.

Interviewers want honesty and process: how you caught it, how you fixed it, who you told and what check you added so it would not happen again. A college or project example is fine for freshers.

### 29. How do you explain a technical result to a non-technical stakeholder?

Lead with the answer and the decision it supports, give the one number that matters, show a simple chart and mention caveats briefly. Replace jargon with plain words.

### 30. What do you do when two stakeholders want different things by the same deadline?

Make the conflict visible early, ask both people or your manager to agree a priority, and confirm revised timelines in writing. Then deliver what was agreed and keep both sides updated.

## How to prepare in the last two weeks

- Write SQL by hand every day, including joins, GROUP BY and window functions.
- Rebuild one portfolio project and rehearse a two-minute explanation of it.
- Practise three case questions aloud with a timer.
- Prepare five short stories in situation, action, result format for behavioural rounds.
- Read about the company's business model and guess which metrics its analysts track.

## Frequently asked questions

### Are data analyst interviews hard for freshers?

They are manageable if your fundamentals are solid. Fresher interviews focus on SQL, Excel and basic statistics, plus how clearly you explain your projects. Gaps usually show up in live SQL and in vague project explanations, so practise both.

### How many rounds are there in a data analyst interview?

Commonly three to four: an online assessment, one or two technical rounds, a case discussion and an HR or hiring manager round. Startups often combine some of these.

### Is SQL enough to clear a data analyst interview?

SQL is the most tested skill, but rarely enough on its own. Expect Excel, basic statistics and business reasoning too, and Python or Power BI for many roles. Strong SQL with clear communication is a good foundation.

### Do data analyst interviews include Python?

Many do, especially at product companies and GCCs, usually pandas tasks like filtering, grouping and merging. Check the job description: if Python is listed, expect at least one question on it.

### How should I answer if I do not know something?

Say so honestly, then explain how you would find out or reason towards an answer. Interviewers generally respect a clear thought process more than a confident guess.

## Next steps

Pick ten questions from this list, answer them aloud without notes and record yourself; gaps become obvious quickly. If you want structured preparation, InsightNest's [live weekend data analytics programme](/) includes interview preparation alongside Excel, SQL, Python, statistics and Power BI, with portfolio projects you can discuss in these rounds.
