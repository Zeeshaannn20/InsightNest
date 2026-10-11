---
title: 10 Data Analyst Portfolio Projects for Indian Businesses
slug: data-analyst-portfolio-project-ideas
category: Careers
excerpt: 10 data analyst portfolio projects for Indian businesses, from UPI to quick commerce, with datasets, business questions, tools and how to present them.
---
The best data analyst portfolio projects answer a specific business question, use public data that resembles real company data, and end with a recommendation backed by numbers. Three or four solid projects that together cover SQL, Python or Excel, and a dashboard tool are enough for most entry-level applications in India. Below are ten ideas tied to Indian industries, followed by how to present them on GitHub and LinkedIn.

## What makes a project worth showing

Hiring managers see many portfolios built on the same tutorial datasets with the same charts. A project stands out when it does these things:

- It starts from a business question, not "EDA on dataset X".
- It involves real cleaning work, such as fixing dates, deduplicating rows or parsing messy text.
- It uses at least one of SQL or Python, plus a clear visual.
- It ends with a recommendation that a manager could act on.
- It has a README that a recruiter can understand in two minutes.

Each idea below lists the type of dataset, the business question, the tools and what to show.

## 10 data analyst portfolio project ideas

### 1. E-commerce repeat customers and delivery experience

Marketplaces live or die on repeat purchases, and this project shows you can work with relational data the way an e-commerce analyst does.

- Dataset: a multi-table e-commerce dataset such as the Brazilian Olist dataset on Kaggle, with orders, customers, payments, reviews and sellers in separate tables.
- Business question: What share of customers order again within 90 days, and how does delivery delay affect review scores?
- Tools: SQL for joins and cohorts, Power BI for the dashboard.
- What to show: monthly cohort retention, average order value by category, and review scores for late versus on-time orders.

Here is the core of the repeat-customer query, with simplified column names. In Olist itself, use `customer_unique_id`, because `customer_id` is issued per order.

```sql
WITH first_orders AS (
  SELECT customer_id, MIN(order_date) AS first_order_date
  FROM orders
  GROUP BY customer_id
)
SELECT COUNT(DISTINCT f.customer_id) AS repeat_customers_90d
FROM first_orders f
JOIN orders o
  ON o.customer_id = f.customer_id
 AND o.order_date > f.first_order_date
 AND o.order_date <= f.first_order_date + INTERVAL '90' DAY;
```

Divide the result by the total number of customers and you have a 90-day repeat rate, which is a metric e-commerce teams genuinely track.

### 2. UPI growth and average ticket size

UPI is one of the most visible payment stories in India, and this project uses official public data rather than a Kaggle file.

- Dataset: monthly UPI statistics published by NPCI (transaction volume and value), optionally alongside RBI payment systems data.
- Business question: As UPI volumes have grown, how has the average transaction value changed, and what does that suggest about how people use it?
- Tools: Excel or pandas for cleaning and reshaping, a line chart in Power BI or Excel.
- What to show: month-on-month and year-on-year growth, average ticket size calculated as value divided by volume, and a short written interpretation.

The data often has to be copied from web tables or PDFs, so document that cleaning step. It is real analyst work and worth a paragraph in your README.

### 3. Quick commerce basket and peak-hour analysis

Indian quick commerce apps don't publish order data, so use a grocery dataset with a similar structure as a stand-in and say so clearly.

- Dataset: the Instacart Market Basket dataset on Kaggle, with over 3 million grocery orders and separate products, aisles and departments tables.
- Business question: Which products are most often bought together, and when do orders peak through the week?
- Tools: SQL or pandas, with simple association metrics such as support, confidence and lift.
- What to show: top product pairs, a day-by-hour order heatmap, and what that implies for dark-store stocking and rider shift planning.

### 4. Retail category profitability and discounting

Retail and FMCG analysts spend a lot of time on margin, and this is a classic dashboard project done with a sharper question.

- Dataset: the Superstore sample dataset widely used for BI practice, or a retail sales dataset from Kaggle after checking its source and licence.
- Business question: Which categories and regions remain profitable after discounts, and where are discounts eroding margin?
- Tools: Power BI with DAX measures, or Tableau.
- What to show: profit margin by sub-category, a discount versus profit scatter plot, a regional drill-down, and two specific pricing recommendations.

### 5. HR attrition drivers

Attrition is a recurring concern in IT services, BPOs and GCCs, which makes this project easy to discuss in interviews with those employers.

- Dataset: the IBM HR Analytics Employee Attrition dataset on Kaggle, a fictional dataset of about 1,470 employees.
- Business question: Which factors are most associated with employees leaving, and which groups should HR focus on first?
- Tools: pandas, seaborn and a basic statistical test such as chi-square.
- What to show: attrition rate by overtime, job role, tenure band and income band, with a clear note that association is not causation.

A few lines of pandas get you the first finding:

```python
import pandas as pd

hr = pd.read_csv("hr_attrition.csv")
hr["left"] = (hr["Attrition"] == "Yes").astype(int)

print(hr.groupby("OverTime")["left"].mean().round(3))
print(hr.groupby("JobRole")["left"].mean().sort_values(ascending=False).round(3))
```

### 6. Food delivery market gaps in Bengaluru

This project frames analysis as a business decision, which is exactly what interviewers want to hear about.

- Dataset: the Zomato Bangalore restaurants dataset on Kaggle, with ratings, votes, cuisines, locality, cost for two and online-ordering flags.
- Business question: For a new cloud kitchen, which locality and cuisine combinations show strong demand but few well-rated competitors?
- Tools: pandas for cleaning (the rating column needs parsing from text), Power BI or Tableau for charts.
- What to show: rating versus cost for two, cuisine counts by locality, and a shortlist of three localities with your reasoning.

### 7. Credit card default risk for BFSI

Banks, NBFCs and fintechs hire many analysts, and risk analysis is central to their work.

- Dataset: a public credit default dataset, such as the UCI "Default of Credit Card Clients" data, or a loan-approval dataset on Kaggle.
- Business question: Which customer and repayment-history features are associated with default, and how would a simple rule-based cut-off perform?
- Tools: SQL or pandas, with Excel for a scorecard-style summary.
- What to show: default rate by credit limit band, age band and past payment delays, plus the trade-off between approvals and defaults under your rule.

### 8. Bank marketing campaign effectiveness

Marketing analytics roles care about conversion and cost per conversion, and this dataset is built around exactly that.

- Dataset: the UCI Bank Marketing dataset, covering phone campaigns by a bank to sell term deposits.
- Business question: Which customer segments and contact patterns convert best, and at what point do extra calls stop helping?
- Tools: SQL or Excel pivot tables, with a funnel or conversion chart.
- What to show: conversion rate by month, contact type, number of calls and previous campaign outcome, ending with a recommended cap on calls per customer.

One honest caveat to mention: call duration is only known after a call ends, so it can't be used to decide whom to call.

### 9. Subscription churn and revenue at risk

The same thinking applies to telecom, OTT, edtech and SaaS companies, all of which hire analysts in India.

- Dataset: the IBM Telco Customer Churn dataset on Kaggle.
- Business question: Which contract types and tenure groups churn most, and how much monthly revenue is at risk?
- Tools: SQL for segment-level churn rates, Power BI for the dashboard.
- What to show: churn rate by contract type and tenure band, monthly revenue lost from churned customers, and one retention offer you would test first.

### 10. Inflation trends for an FMCG pricing team

This project uses Indian government data and shows you can turn macro numbers into a business brief.

- Dataset: Consumer Price Index data published by MOSPI, available on its website and on data.gov.in.
- Business question: Which consumption categories have seen the highest inflation in rural and urban India, and what should an FMCG brand watch when setting prices?
- Tools: Excel or pandas to reshape the data, Power BI for a trend dashboard.
- What to show: year-on-year inflation by category, a rural versus urban comparison, and a one-page note written for a brand manager.

## How to choose your three or four

You don't need all ten. Pick a set that covers different skills and points toward the jobs you want.

- One SQL-heavy project, such as e-commerce cohorts or subscription churn.
- One Python project, such as HR attrition or the Zomato analysis.
- One polished dashboard, such as retail profitability.
- One project in your target industry, such as credit risk for BFSI roles or UPI for fintech.

If SQL is still new to you, the [beginner's guide to SQL for data analysis](/articles/sql-for-data-analysis) covers the joins and aggregations these projects need, and the [Python and pandas guide](/articles/python-pandas-for-data-analysis) covers the cleaning and grouping steps. Not sure which dashboard tool to use? Read [Power BI vs Tableau](/articles/power-bi-vs-tableau) before you start.

## How to present projects on GitHub

Create one repository per project with a descriptive name such as `quick-commerce-basket-analysis`, not `project1`. Keep the structure predictable:

- `data/` with small files, or a link to the source if the files are large
- `sql/` or `notebooks/` with your queries and analysis
- `dashboard/` with the `.pbix` or `.twbx` file and screenshots
- `README.md` at the top level

The README matters more than the code, because most recruiters will read nothing else. A structure that works:

```text
# Quick Commerce Basket Analysis

## Business question
Which products are bought together, and when do orders peak?

## Data
Instacart Market Basket dataset (Kaggle), used as a stand-in
for Indian quick commerce. 6 tables, 3M+ orders.

## Approach
Cleaning steps, key SQL queries, metrics used (support, lift).

## Key findings
3 to 5 bullet points, each with a number.

## Recommendations
2 or 3 actions for a dark-store or ops manager.

## Tools
SQL (PostgreSQL), pandas, Power BI
```

Pin your best four repositories on your GitHub profile. If you publish a Power BI report to the web, do it only with public data, since anyone with the link can view it. Tableau Public is another free option for sharing interactive dashboards.

## How to present projects on LinkedIn

- Add each project to the Projects section of your profile with the tools tagged as skills.
- Put your two best projects in the Featured section with links to the GitHub README or dashboard.
- Write one short post per project: the question, three findings with numbers, one chart image and the link.
- Keep the tone factual and specific; a post that states one finding with its number gets better questions than one that only says you learned a lot.

Then make sure the same projects appear on your resume with matching bullets. The [data analyst resume guide for freshers](/articles/data-analyst-resume-for-freshers) shows how to turn each project into two or three strong lines.

## Frequently asked questions

### How many projects should a data analyst portfolio have?

Three or four well-documented projects are usually enough for entry-level roles. Quality and variety matter more than count: cover SQL, Python or Excel, and a dashboard, and make sure each one answers a clear business question.

### Are Kaggle datasets good enough for a data analyst portfolio?

Yes, if you choose realistic business datasets and go beyond the obvious charts. What makes a project yours is the question you ask, the cleaning you do and the recommendation you make, not the source of the file.

### Should I use Indian datasets for my portfolio projects?

Indian data such as NPCI, RBI, MOSPI or data.gov.in releases makes your work more relevant to Indian employers and easier to talk about. Where Indian data isn't public, as with quick commerce orders, a similar foreign dataset is fine as long as you say so in the README.

### Do I need Python for data analyst portfolio projects?

Not for every project. Excel and SQL with a Power BI dashboard can make a strong project. Including at least one Python project helps, though, because many job descriptions list Python as preferred.

### Can I include course or guided projects in my portfolio?

You can, but change them meaningfully: use a different dataset, ask a new question or add your own analysis and recommendations. Recruiters can often recognise an untouched tutorial project, and it says little about your own thinking.

## Next steps

Pick one idea from this list today, write the business question at the top of a blank README, and work backwards from it. Finish and publish that project before starting the next one. If you would prefer to build projects with live guidance and feedback, the [InsightNest weekend data analytics programme](/) includes mini and major portfolio projects alongside Excel, SQL, Python and Power BI.
