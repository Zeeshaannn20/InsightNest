---
title: How to Become a Data Analyst in India: A 6-Month Roadmap
slug: how-to-become-a-data-analyst-in-india
category: Careers
excerpt: How to become a data analyst in India: a month-by-month plan for Excel, SQL, Power BI, Python, projects and job applications, with honest timelines.
---
To become a data analyst in India, learn Excel, SQL, a BI tool such as Power BI, basic statistics and Python, in roughly that order, then prove those skills with three to five portfolio projects built on real datasets. Most people who study 10–15 hours a week can become job-ready in about six months, and the job search itself often takes another two to four months. You do not need a specific degree, but you do need evidence that you can answer business questions with data.

## What a data analyst actually does

Before you plan the months, be clear about the job. A data analyst takes raw data from databases, spreadsheets or business tools, cleans it, and turns it into answers that someone in the business can act on. Typical questions sound like "Why did repeat orders drop in Pune last quarter?" or "Which marketing channel brings customers who stay longer?"

In a normal week you might write SQL queries against a sales database, update a Power BI dashboard, investigate a sudden dip in a metric, and present findings to a manager who does not care how you got there. The technical work matters, but the output is a decision. If you are still choosing between neighbouring roles, read [data analyst vs data scientist vs business analyst](/articles/data-analyst-vs-data-scientist-vs-business-analyst) first.

## The order to learn skills in, and why

Order matters because each skill makes the next one easier, and because entry-level job descriptions in India tend to weight them in roughly this sequence.

1. **Excel**: the tool every team already uses. Pivot tables, `XLOOKUP`, `SUMIFS`, `COUNTIFS`, conditional formatting and clean charts.
2. **SQL**: the skill most consistently listed in analyst job posts. `SELECT`, `WHERE`, `GROUP BY`, `JOIN`, subqueries, CTEs and window functions.
3. **Power BI (or Tableau)**: dashboards, data modelling, and basic DAX measures such as `CALCULATE` and `SUMX`.
4. **Statistics**: mean versus median, distributions, percentiles, correlation, sampling and A/B test basics.
5. **Python with pandas**: cleaning messy files, automating repetitive work, and analysis that outgrows Excel.
6. **Communication**: writing a clear summary, explaining a chart, and recommending an action.

Python comes after SQL because many fresher analyst roles in India test SQL and Excel first and treat Python as a strong plus. That balance is shifting, so do not skip Python, but do not start there either.

## A month-by-month roadmap

This plan assumes 10–15 hours a week, which fits around college or a full-time job. If you can study full-time, you can compress it to three or four months. If you only have five hours a week, plan for closer to a year.

### Month 1: Excel and data basics

Start with Excel because the feedback is immediate. Download a public dataset (Kaggle and data.gov.in both have usable ones) and practise:

- Cleaning with `TRIM`, `PROPER`, Remove Duplicates and Text to Columns
- Lookups with `XLOOKUP`, or `INDEX` and `MATCH` on older versions
- Conditional aggregation with `SUMIFS`, `COUNTIFS` and `AVERAGEIFS`
- Pivot tables, slicers and pivot charts
- Date handling with `TEXT`, `EOMONTH` and `EDATE`

By the end of the month you should be able to take a raw sales file, clean it, and produce a one-page summary of revenue by region and month. That summary is your first mini project, so save it.

### Month 2: SQL fundamentals

Install PostgreSQL or MySQL, or use a browser-based practice site, and load a small multi-table dataset with orders, customers and products. Work through filtering, aggregation and joins until they feel routine. A query like this should become second nature:

```sql
SELECT c.city,
       COUNT(DISTINCT o.order_id) AS orders,
       SUM(o.amount) AS revenue
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.order_date >= '2026-01-01'
GROUP BY c.city
ORDER BY revenue DESC;
```

Read each query out loud in plain English before you run it: "for each city, count distinct orders and total the amount, for orders since January". If you cannot say what it does, you do not understand it yet. Our [beginner's guide to SQL for data analysis](/articles/sql-for-data-analysis) walks through these patterns step by step.

### Month 3: Intermediate SQL and Power BI

Add CTEs, `CASE WHEN`, and window functions such as `ROW_NUMBER`, `RANK` and `LAG`. Window functions come up in analyst interviews constantly because they test whether you can compare rows without collapsing them. Here is month-over-month revenue change in PostgreSQL:

```sql
WITH monthly AS (
  SELECT DATE_TRUNC('month', order_date) AS month,
         SUM(amount) AS revenue
  FROM orders
  GROUP BY DATE_TRUNC('month', order_date)
)
SELECT month,
       revenue,
       revenue - LAG(revenue) OVER (ORDER BY month) AS change_from_last_month
FROM monthly
ORDER BY month;
```

In the second half of the month, connect Power BI to your database or a CSV, build a simple star schema (one fact table such as orders, with dimension tables for customers, products and dates), and write a handful of DAX measures. Aim for one dashboard that a busy manager could understand in 30 seconds: three or four headline numbers, one trend, one breakdown, and filters.

### Month 4: Statistics and Python basics

Spend the first two weeks on practical statistics. Learn when to use the median instead of the mean (order values and salaries are usually skewed), what standard deviation and percentiles tell you, why correlation does not prove causation, and how an A/B test decides whether a difference is real or noise. You do not need heavy maths, but you do need to avoid confident wrong conclusions.

Then start Python. Learn just enough core syntax (variables, lists, dictionaries, loops, functions) to move into pandas quickly, because pandas is where analysts spend their Python time:

```python
import pandas as pd

df = pd.read_csv("orders.csv", parse_dates=["order_date"])
df = df.drop_duplicates(subset="order_id")
df["month"] = df["order_date"].dt.to_period("M")

summary = (
    df.groupby(["month", "city"], as_index=False)["amount"]
      .sum()
      .sort_values(["month", "amount"], ascending=[True, False])
)
print(summary.head(10))
```

Notice that this does the same job as the SQL in Month 2. That is the point: once you think in terms of filter, group and aggregate, the tool becomes a detail.

### Month 5: Portfolio projects

This is the month most self-learners skip, and it is the one that gets interviews. Build two or three projects end to end: a business question, a messy dataset, cleaning, analysis, a dashboard or notebook, and a written conclusion with a recommendation. Themes that make sense to Indian recruiters include e-commerce sales and returns, digital payments trends, IPL or cricket performance, pharmacy or retail inventory, and employee attrition.

Make every project answer a question rather than just display charts. A conclusion like "referral customers in this dataset reordered more often within 90 days than paid-ads customers, so test shifting part of the budget to referrals" is far stronger than "here is a bar chart of customers by channel". For more themes and how to scope them, see [data analyst portfolio project ideas](/articles/data-analyst-portfolio-project-ideas).

### Month 6: Portfolio, resume and applications

Put each project on GitHub with a clear README covering the question, data source, approach and findings. Publish dashboards where you can, or add screenshots and a two-minute video walkthrough. Then:

- Write a one-page resume that leads with skills and projects, not a long objective statement
- Change your LinkedIn headline to say what you do, for example "Data Analyst, SQL, Power BI, Python"
- Start applying in the second half of the month, not after everything feels perfect
- Practise SQL problems and business case questions daily, because interviews arrive before you feel ready

## How to apply for data analyst jobs in India

Most fresher and junior analyst hiring in India runs through Naukri, LinkedIn Jobs, Instahyre, company career pages and referrals. Set alerts on each for "Data Analyst", "Business Analyst", "MIS Analyst", "Reporting Analyst" and "Junior Analyst". MIS and reporting roles are common entry points, and they often lead to analyst titles once you have a year or two of experience.

Different employers hire in different ways, so adjust your approach:

- IT services companies often hire in batches through campus or off-campus drives, and train on the job
- Global capability centres (GCCs) of multinational banks, retailers and tech firms, mostly in Bengaluru, Hyderabad, Pune, Chennai and Gurugram, usually expect stronger SQL and BI skills
- Startups and e-commerce companies value people who can work independently and switch between tools quickly
- BFSI employers (banks, NBFCs, insurers and fintechs) hire steadily for reporting, risk and collections analytics

Referrals help more than most freshers expect. A short, specific LinkedIn message to an analyst at a target company, such as "I built a dashboard on quick-commerce delivery times and would value ten minutes of feedback", is more likely to get a reply than a generic request for a job. Keep a simple sheet of where you applied, the date and the status, and follow up once after a week.

Tailor your resume keywords to each job description. Applicant tracking systems and recruiters both scan for the exact tools named in the post, so if a role asks for Power BI and you have used it, make sure the words "Power BI" appear in your projects section.

## Realistic timelines

Honest timelines depend more on your starting point and weekly hours than on any course.

- Final-year student or recent graduate with some Excel: about 4–6 months to job-ready at 10–15 hours a week
- Working professional switching from a non-tech role: about 6–9 months, because study time is limited, though your domain knowledge is a real advantage
- Engineer or someone who already codes: often 3–4 months, mostly spent on SQL depth, BI and projects
- Job search after becoming job-ready: commonly 2–4 months, sometimes longer, depending on the hiring market, your city and how consistently you apply

The search is the part people underestimate. Sending five applications a week and waiting will feel slow. Applying steadily, asking for referrals and practising interviews in parallel usually shortens it.

## Common mistakes that slow people down

- Collecting certificates instead of building projects that show your thinking
- Starting with machine learning before you can write a confident `JOIN`
- Watching tutorials without typing the code yourself
- Building dashboards with twenty visuals and no clear question
- Waiting until you feel fully ready before applying

## Frequently asked questions

### Can I become a data analyst in India without a computer science degree?

Yes. Data analysts in India come from commerce, economics, science, engineering and many other backgrounds. Employers mostly screen for SQL, Excel and BI skills plus projects, although some large firms and GCCs require a graduate degree of some kind.

### Is SQL enough to get a data analyst job?

SQL alone is rarely enough, but SQL plus strong Excel and one BI tool such as Power BI is enough for many entry-level roles. Python is listed more often each year, so add it once your SQL is solid.

### How long does it take to become a data analyst in India?

For most people studying 10–15 hours a week, about six months to become job-ready, plus two to four months of job searching. Full-time learners can move faster, and people with very limited weekly time should plan for closer to a year.

### Do I need coding to become a data analyst?

You need SQL, which is a query language rather than general-purpose programming, and it is learnable without any coding background. Python is useful and increasingly requested, but many entry-level roles still centre on SQL, Excel and dashboards.

### What is the starting salary for a fresher data analyst in India?

Salary portals such as AmbitionBox, Glassdoor and Naukri commonly report fresher data analyst pay in roughly the ₹3–6 LPA range, varying with city, company type and skills. The [data analyst salary in India guide](/articles/data-analyst-salary-in-india) breaks this down by experience, city and industry.

### Will AI replace entry-level data analysts?

AI tools now speed up parts of the job, such as drafting SQL or summarising a dataset. Someone still has to frame the right question, check whether the output is correct, and explain what it means for the business, so learning to use these tools well is becoming part of the role rather than a replacement for it.

## Next steps

Pick a start date and block study hours in your calendar for the next six months. Begin with Excel this week, move to SQL next month, and commit to finishing at least one complete project before you start applying. If you would rather follow a structured path with live weekend sessions, mentor feedback and portfolio projects, InsightNest runs a [data analytics programme](/) covering Excel, SQL, Python, Power BI and statistics. Whichever route you choose, the projects you finish are what will carry your applications.
