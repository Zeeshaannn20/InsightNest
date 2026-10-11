---
title: SQL for Data Analysis: A Beginner's Guide with Examples
slug: sql-for-data-analysis
category: Skills & Tools
excerpt: Learn SQL for data analysis with one e-commerce dataset: SELECT, WHERE, GROUP BY, JOINs, CASE, CTEs and window functions, with queries you can run today.
---
SQL for data analysis means using a small set of query patterns to answer business questions from tables: filter rows, total them up, combine tables, label records and rank them. Eight building blocks cover most of what a fresher analyst writes in a normal week: `SELECT`, `WHERE`, `GROUP BY`, `HAVING`, JOINs, `CASE`, CTEs and window functions. This guide teaches all eight using one small Indian e-commerce dataset that you can create and query yourself in a few minutes.

## Why SQL matters for analysts

Most company data in India, whether at a bank, an IT services firm, a GCC or a quick-commerce startup, lives in databases and warehouses such as PostgreSQL, MySQL, SQL Server, BigQuery or Snowflake. Excel cannot open a table with fifty million rows; SQL can summarise it in seconds. That is why SQL appears in almost every data analyst job description on Naukri and LinkedIn.

The good news is that analysts mostly *read* data. If you can turn "Which city brought in the most revenue last quarter?" into a correct query, you have the core skill.

## The example dataset

Imagine a small online store selling across Indian cities. It has two tables: `customers` (who bought) and `orders` (what they bought). Run this script in PostgreSQL, MySQL 8 or SQLite, or paste it into a free browser playground such as DB Fiddle.

```sql
CREATE TABLE customers (
  customer_id  INTEGER PRIMARY KEY,
  name         VARCHAR(50),
  city         VARCHAR(30),
  signup_date  DATE
);

CREATE TABLE orders (
  order_id     INTEGER PRIMARY KEY,
  customer_id  INTEGER REFERENCES customers (customer_id),
  order_date   DATE,
  category     VARCHAR(20),
  amount       INTEGER,        -- order value in rupees
  status       VARCHAR(15)     -- Delivered, Returned or Cancelled
);

INSERT INTO customers VALUES
  (1, 'Aarav Sharma', 'Mumbai',    '2025-11-02'),
  (2, 'Priya Nair',   'Bengaluru', '2025-12-15'),
  (3, 'Rohan Gupta',  'Delhi',     '2026-01-08'),
  (4, 'Sneha Iyer',   'Chennai',   '2026-01-20'),
  (5, 'Karan Mehta',  'Pune',      '2026-02-03');

INSERT INTO orders VALUES
  (101, 1, '2026-01-05', 'Electronics', 15999, 'Delivered'),
  (102, 2, '2026-01-07', 'Fashion',      1299, 'Delivered'),
  (103, 1, '2026-01-19', 'Fashion',      2499, 'Returned'),
  (104, 3, '2026-02-02', 'Home',         3499, 'Delivered'),
  (105, 2, '2026-02-10', 'Electronics',   899, 'Delivered'),
  (106, 4, '2026-02-14', 'Beauty',        649, 'Cancelled'),
  (107, 1, '2026-02-21', 'Home',         1899, 'Delivered'),
  (108, 3, '2026-03-01', 'Electronics', 24999, 'Delivered'),
  (109, 2, '2026-03-05', 'Fashion',      1799, 'Delivered'),
  (110, 4, '2026-03-09', 'Beauty',       1149, 'Delivered');
```

Notice that Karan (customer 5) has signed up but never ordered. That detail matters later when we compare join types.

## SELECT and WHERE: pick columns, filter rows

`SELECT` chooses the columns you want and `FROM` names the table. `WHERE` keeps only the rows that pass a condition. `ORDER BY` sorts the result.

Question: which delivered orders were worth ₹2,000 or more, largest first?

```sql
SELECT order_id, order_date, amount
FROM orders
WHERE status = 'Delivered'
  AND amount >= 2000
ORDER BY amount DESC;

-- order_id | order_date | amount
-- 108      | 2026-03-01 | 24999
-- 101      | 2026-01-05 | 15999
-- 104      | 2026-02-02 | 3499
```

Order 103 (₹2,499) is missing because it was returned. A few habits to build early:

- Name the columns you need instead of writing `SELECT *` in real work; it is clearer and faster on wide tables.
- Text values go in single quotes (`'Delivered'`); numbers do not.
- Combine conditions with `AND`, `OR` and brackets, and use `IN ('Mumbai', 'Pune')` for lists.
- Test for missing values with `IS NULL`, never `= NULL`.

## GROUP BY: totals, counts and averages

Analysis is mostly aggregation. `GROUP BY` collapses many rows into one row per group, and aggregate functions such as `COUNT`, `SUM`, `AVG`, `MIN` and `MAX` calculate a value for each group.

Question: how much delivered revenue did each category bring in, and what was the average order value?

```sql
SELECT category,
       COUNT(*)              AS order_count,
       SUM(amount)           AS revenue,
       ROUND(AVG(amount), 0) AS avg_order_value
FROM orders
WHERE status = 'Delivered'
GROUP BY category
ORDER BY revenue DESC;

-- category    | order_count | revenue | avg_order_value
-- Electronics | 3           | 41897   | 13966
-- Home        | 2           | 5398    | 2699
-- Fashion     | 2           | 3098    | 1549
-- Beauty      | 1           | 1149    | 1149
```

The rule to remember: every column in `SELECT` must either be inside an aggregate function or listed in `GROUP BY`. Break it and most databases throw an error.

## HAVING: filter after grouping

`WHERE` filters individual rows before they are grouped. `HAVING` filters the groups after aggregation. You need it whenever the condition is about a total or a count.

Question: which customers have two or more delivered orders?

```sql
SELECT customer_id,
       COUNT(*)    AS order_count,
       SUM(amount) AS revenue
FROM orders
WHERE status = 'Delivered'
GROUP BY customer_id
HAVING COUNT(*) >= 2
ORDER BY revenue DESC;

-- customer_id | order_count | revenue
-- 3           | 2           | 28498
-- 1           | 2           | 17898
-- 2           | 3           | 3997
```

Customer 4 drops out with only one delivered order. You cannot write `WHERE COUNT(*) >= 2`, because the count does not exist yet when `WHERE` runs.

## JOINs: combine tables

The `orders` table knows the customer ID but not the city. To report revenue by city, you join `orders` to `customers` on the column they share.

### INNER JOIN

An `INNER JOIN` keeps only rows that have a match in both tables.

```sql
SELECT c.city,
       SUM(o.amount) AS revenue
FROM orders AS o
INNER JOIN customers AS c
  ON o.customer_id = c.customer_id
WHERE o.status = 'Delivered'
GROUP BY c.city
ORDER BY revenue DESC;

-- city      | revenue
-- Delhi     | 28498
-- Mumbai    | 17898
-- Bengaluru | 3997
-- Chennai   | 1149
```

The aliases `o` and `c` show which table each column comes from. Always prefix columns once you join; it prevents "ambiguous column" errors.

### LEFT JOIN

A `LEFT JOIN` keeps every row from the left table, even when the right table has no match. Use it when the question includes "all customers" or "including those who never…".

```sql
SELECT c.name,
       c.city,
       COUNT(o.order_id) AS order_count
FROM customers AS c
LEFT JOIN orders AS o
  ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name, c.city
ORDER BY order_count DESC, c.name;

-- name         | city      | order_count
-- Aarav Sharma | Mumbai    | 3
-- Priya Nair   | Bengaluru | 3
-- Rohan Gupta  | Delhi     | 2
-- Sneha Iyer   | Chennai   | 2
-- Karan Mehta  | Pune      | 0
```

Karan appears with zero orders. Two details make this work. First, `COUNT(o.order_id)` counts only non-null values, so it returns 0 for him, while `COUNT(*)` would wrongly return 1. Second, if you wanted only delivered orders, putting `WHERE o.status = 'Delivered'` here would silently remove Karan, because his `status` is NULL. Move the condition into the join instead: `ON c.customer_id = o.customer_id AND o.status = 'Delivered'`. This is one of the most common mistakes in interviews and in real reports.

## CASE: label and bucket your data

`CASE` is SQL's if-then-else. Analysts use it to create segments, clean messy categories and build conditional counts.

Question: label each delivered order as a high, medium or low value order.

```sql
SELECT order_id,
       amount,
       CASE
         WHEN amount >= 10000 THEN 'High'
         WHEN amount >= 1500  THEN 'Medium'
         ELSE 'Low'
       END AS order_band
FROM orders
WHERE status = 'Delivered'
ORDER BY amount DESC;
```

`CASE` stops at the first match, so order `WHEN` lines from strictest to loosest.

The second classic use is conditional aggregation, which turns statuses into columns in a single pass:

```sql
SELECT COUNT(*) AS total_orders,
       SUM(CASE WHEN status = 'Returned'  THEN 1 ELSE 0 END) AS returned,
       SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled
FROM orders;

-- total_orders | returned | cancelled
-- 10           | 1        | 1
```

From here, a return rate of 10% is one division away.

## CTEs: break a problem into named steps

A Common Table Expression (CTE) starts with `WITH` and gives a temporary name to a query result. You can then query it like a table. CTEs make long analysis readable, and reviewers in interviews notice that.

Question: which customers spent more than the average customer?

```sql
WITH customer_revenue AS (
  SELECT customer_id,
         SUM(amount) AS revenue
  FROM orders
  WHERE status = 'Delivered'
  GROUP BY customer_id
)
SELECT c.name,
       c.city,
       cr.revenue
FROM customer_revenue AS cr
INNER JOIN customers AS c
  ON cr.customer_id = c.customer_id
WHERE cr.revenue > (SELECT AVG(revenue) FROM customer_revenue)
ORDER BY cr.revenue DESC;

-- name         | city   | revenue
-- Rohan Gupta  | Delhi  | 28498
-- Aarav Sharma | Mumbai | 17898
```

The average across the four buying customers is ₹12,885.50, so only two clear the bar. Each step is now separate and easy to check, and you can chain several CTEs, separated by commas.

## Your first window function

A window function calculates across related rows without collapsing them into one row, unlike `GROUP BY`. The `OVER` clause defines the window: `PARTITION BY` splits rows into groups and `ORDER BY` sets the sequence inside each group.

Question: for each customer, number their delivered orders in date order and show their running spend.

```sql
SELECT customer_id,
       order_id,
       order_date,
       amount,
       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS order_number,
       SUM(amount)  OVER (PARTITION BY customer_id ORDER BY order_date) AS running_spend
FROM orders
WHERE status = 'Delivered'
ORDER BY customer_id, order_date;

-- customer_id | order_id | order_date | amount | order_number | running_spend
-- 1           | 101      | 2026-01-05 | 15999  | 1            | 15999
-- 1           | 107      | 2026-02-21 | 1899   | 2            | 17898
-- 2           | 102      | 2026-01-07 | 1299   | 1            | 1299
-- 2           | 105      | 2026-02-10 | 899    | 2            | 2198
-- 2           | 109      | 2026-03-05 | 1799   | 3            | 3997
-- 3           | 104      | 2026-02-02 | 3499   | 1            | 3499
-- 3           | 108      | 2026-03-01 | 24999  | 2            | 28498
-- 4           | 110      | 2026-03-09 | 1149   | 1            | 1149
```

Wrap this in a CTE and filter `WHERE order_number = 1` to get each customer's first purchase, a question that comes up constantly in retention analysis. Once `ROW_NUMBER` makes sense, learn `RANK`, `DENSE_RANK`, `LAG` and `LEAD` next. They power top-N per group, month-on-month growth and repeat-purchase analysis.

## The order SQL actually runs in

You write a query starting with `SELECT`, but the database processes it in a different logical order. Knowing this explains most beginner errors:

1. `FROM` and `JOIN` build the combined rows.
2. `WHERE` filters those rows.
3. `GROUP BY` forms the groups.
4. `HAVING` filters the groups.
5. `SELECT` calculates columns, including window functions.
6. `ORDER BY` sorts the final result.

That is why you cannot use an aggregate in `WHERE`, and why a column alias created in `SELECT` usually cannot be referenced in `WHERE`.

## How to practise SQL for data analysis

A practical routine:

- Write ten business questions for this dataset (return rate by city, revenue by month) and solve each one.
- Load a larger public e-commerce dataset from Kaggle into PostgreSQL or SQLite and repeat.
- Turn one analysis into a portfolio piece with queries on GitHub and a short write-up; see these [data analyst portfolio project ideas](/articles/data-analyst-portfolio-project-ideas) for scope.
- Explain your queries out loud, because interviewers care about reasoning as much as syntax.

When you feel comfortable, work through these [SQL interview questions for data analysts](/articles/sql-interview-questions-for-data-analysts) to test yourself on the patterns companies ask.

## Frequently asked questions

### Is SQL enough to get a data analyst job?

SQL is the most important single skill, but on its own it is rarely enough. Most entry-level roles also expect Excel, one BI tool such as Power BI, and basic statistics. Read this overview of [data analyst skills](/articles/data-analyst-skills) to see how SQL fits with the rest.

### How long does it take to learn SQL for data analysis?

With an hour a day of hands-on practice, most beginners can write `SELECT`, `WHERE`, `GROUP BY` and JOIN queries confidently within a few weeks, and CTEs and window functions take a little longer. Speed depends on how many real questions you solve, not how many videos you watch.

### Which SQL database should a beginner learn first?

PostgreSQL or MySQL are both good choices, since they are free, widely used and close to standard SQL. Everything in this guide runs on both. Once you know one, switching to SQL Server, BigQuery or Snowflake mostly means learning a few different date and text functions.

### What is the difference between WHERE and HAVING in SQL?

`WHERE` filters individual rows before grouping, while `HAVING` filters groups after aggregate functions have been calculated. Use `WHERE status = 'Delivered'` to remove rows, and `HAVING COUNT(*) >= 2` to keep only groups with at least two rows.

## Next steps

Recreate the two tables above, run every query, then change one thing in each and predict the result before running it. Pair your SQL with spreadsheet skills from this guide to [Excel for data analysis](/articles/excel-for-data-analysts), since many teams still finish their reporting in Excel.

If you would like to learn SQL alongside Excel, Python and Power BI with live weekend classes and guided projects, you can look at the [InsightNest data analytics programme](/). Whichever route you choose, keep writing queries against real questions every week.
