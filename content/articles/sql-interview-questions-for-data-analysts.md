---
title: SQL Interview Questions for Data Analyst Roles: 20 Solved
slug: sql-interview-questions-for-data-analysts
category: Interview Prep
excerpt: 20 SQL interview questions for data analyst roles, from joins to window functions, each with a correct answer and the traps interviewers look for.
---
SQL interview questions for data analyst roles test four things: joins, aggregation with GROUP BY, window functions, and careful handling of NULLs and duplicates. The 20 questions below run from basic to advanced, each with a working standard-SQL answer and the reasoning an interviewer wants to hear. Try writing each query yourself before reading the solution.

## The tables used in this article

All answers use these tables. Assume `amount`, `price` and `salary` are DECIMAL columns and `order_date` is a DATE. The queries run on PostgreSQL and on MySQL 8 or later, which supports window functions and CTEs.

```text
employees(emp_id, emp_name, dept_id, manager_id, salary, hire_date)
departments(dept_id, dept_name)
customers(customer_id, customer_name, email, city)
orders(order_id, customer_id, order_date, amount)
order_items(order_id, product_id, quantity, price)
products(product_id, product_name, category)
```

## Basic SQL interview questions

### 1. In what order does SQL process a query?

Logically: FROM and joins, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, then LIMIT. This is why a column alias defined in SELECT cannot be used in WHERE.

```sql
-- Fails: annual_salary does not exist yet when WHERE runs
SELECT emp_name, salary * 12 AS annual_salary
FROM employees
WHERE annual_salary > 1200000;

-- Works
SELECT emp_name, salary * 12 AS annual_salary
FROM employees
WHERE salary * 12 > 1200000;
```

### 2. What is the difference between WHERE and HAVING?

WHERE filters individual rows before grouping. HAVING filters groups after aggregation.

```sql
SELECT dept_id, AVG(salary) AS avg_salary
FROM employees
WHERE hire_date >= DATE '2024-01-01'
GROUP BY dept_id
HAVING AVG(salary) > 60000;
```

### 3. Find customers who have never placed an order.

```sql
SELECT c.customer_id, c.customer_name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;
```

The LEFT JOIN keeps every customer, and customers without a match get NULL order columns. `NOT EXISTS` also works; avoid `NOT IN` for this (see question 16).

### 4. What is the difference between the three forms of COUNT?

`COUNT(*)` counts rows, `COUNT(column)` counts non-NULL values in that column, and `COUNT(DISTINCT column)` counts unique non-NULL values.

```sql
SELECT COUNT(*)                AS all_employees,
       COUNT(manager_id)       AS employees_with_manager,
       COUNT(DISTINCT dept_id) AS departments
FROM employees;
```

### 5. What is the difference between UNION and UNION ALL?

Both stack the results of two queries with matching columns. UNION removes duplicate rows, which costs a sort or hash step; UNION ALL keeps every row and is faster.

```sql
SELECT customer_id FROM orders WHERE order_date < DATE '2026-01-01'
UNION
SELECT customer_id FROM orders WHERE order_date >= DATE '2026-01-01';
```

This returns each customer once. With UNION ALL, a customer who ordered in both periods would appear twice.

### 6. Why can a join inflate your totals?

Joining a one-row-per-order table to a many-rows-per-order table repeats each order once per item. Summing the order amount after that join overstates revenue.

```sql
-- Wrong: each order's amount is repeated once per item
SELECT SUM(o.amount) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id;

-- Right: aggregate at the grain the metric lives at
SELECT SUM(amount) AS revenue
FROM orders;
```

Interviewers like candidates who say "I'd check the row count before and after the join".

## Intermediate SQL interview questions

### 7. Find the second highest salary.

```sql
-- Method 1: subquery
SELECT MAX(salary) AS second_highest
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

-- Method 2: DENSE_RANK, which extends to the Nth highest
SELECT DISTINCT salary AS second_highest
FROM (
  SELECT salary,
         DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employees
) ranked
WHERE rnk = 2;
```

Both handle ties at the top correctly. Method 1 returns NULL when there is no second value; method 2 returns no rows.

### 8. Find the third highest salary in each department.

```sql
WITH ranked AS (
  SELECT dept_id, emp_name, salary,
         DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk
  FROM employees
)
SELECT d.dept_name, r.emp_name, r.salary
FROM ranked r
JOIN departments d ON d.dept_id = r.dept_id
WHERE r.rnk = 3;
```

PARTITION BY restarts the ranking for each department.

### 9. Find duplicate customers by email.

```sql
SELECT email, COUNT(*) AS copies
FROM customers
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;
```

### 10. Delete duplicates but keep one row per email.

```sql
DELETE FROM customers
WHERE customer_id IN (
  SELECT customer_id
  FROM (
    SELECT customer_id,
           ROW_NUMBER() OVER (PARTITION BY email ORDER BY customer_id) AS rn
    FROM customers
    WHERE email IS NOT NULL
  ) dupes
  WHERE rn > 1
);
```

This keeps the lowest `customer_id` for each email. The `email IS NOT NULL` filter matters: PARTITION BY puts all NULL emails in one group, so without it you would delete genuine customers who simply have no email. Run the inner query as a SELECT first, and in real work check whether orders reference the IDs you are deleting.

### 11. Find employees who earn more than their manager.

```sql
SELECT e.emp_name, e.salary,
       m.emp_name AS manager_name, m.salary AS manager_salary
FROM employees e
JOIN employees m ON m.emp_id = e.manager_id
WHERE e.salary > m.salary;
```

This is a self join: the same table appears twice with different aliases.

### 12. Find employees who earn more than their department's average.

```sql
SELECT emp_name, dept_id, salary, dept_avg
FROM (
  SELECT emp_name, dept_id, salary,
         AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
  FROM employees
) t
WHERE salary > dept_avg;
```

A correlated subquery also works, but the window version computes each average once and lets you show it alongside the row.

### 13. What is the difference between GROUP BY and window functions?

GROUP BY collapses rows into one per group. A window function computes across a group but keeps every row.

```sql
-- One row per department
SELECT dept_id, SUM(salary) AS dept_total
FROM employees
GROUP BY dept_id;

-- Every employee, plus their share of the department total
SELECT emp_name, dept_id, salary,
       ROUND(100.0 * salary / SUM(salary) OVER (PARTITION BY dept_id), 1) AS pct_of_dept
FROM employees;
```

## Advanced SQL interview questions

### 14. What is the difference between RANK, DENSE_RANK and ROW_NUMBER?

```sql
SELECT emp_name, salary,
       ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num,
       RANK()       OVER (ORDER BY salary DESC) AS rnk,
       DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rnk
FROM employees;
```

For salaries of 90,000, 80,000, 80,000 and 70,000:

- ROW_NUMBER gives 1, 2, 3, 4: always unique, and the order between the two tied rows is arbitrary unless you add a tie-breaker column.
- RANK gives 1, 2, 2, 4: ties share a rank and the next rank is skipped.
- DENSE_RANK gives 1, 2, 2, 3: ties share a rank with no gaps.

Use ROW_NUMBER to pick exactly one row per group, and DENSE_RANK for "Nth highest value" questions.

### 15. Calculate a running total of daily revenue.

```sql
SELECT order_date, daily_revenue,
       SUM(daily_revenue) OVER (
         ORDER BY order_date
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS running_revenue
FROM (
  SELECT order_date, SUM(amount) AS daily_revenue
  FROM orders
  GROUP BY order_date
) daily
ORDER BY order_date;
```

Aggregating to one row per day first avoids a subtle trap: with ORDER BY and no frame, the default frame is RANGE, which treats rows with the same date as one block. For a running total per customer, add `PARTITION BY customer_id`.

### 16. How do you handle NULLs, and what is the NOT IN trap?

Comparisons with NULL return unknown, not true, so `WHERE email = NULL` matches nothing; use `IS NULL`. That same logic breaks `NOT IN` when the subquery contains a NULL.

```sql
-- Returns no rows at all if any orders.customer_id is NULL
SELECT customer_id
FROM customers
WHERE customer_id NOT IN (SELECT customer_id FROM orders);

-- Safe version
SELECT c.customer_id
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id
);

-- Replacing NULLs for reporting
SELECT customer_name, COALESCE(city, 'Unknown') AS city
FROM customers;
```

Also know `NULLIF(x, 0)`, which turns a zero into NULL so division returns NULL instead of an error.

### 17. What is a CTE and why would you use one?

A common table expression is a named result defined with WITH. It makes multi-step logic readable and lets you build a query in testable stages.

```sql
WITH customer_totals AS (
  SELECT customer_id,
         SUM(amount) AS lifetime_value,
         COUNT(*)    AS order_count
  FROM orders
  GROUP BY customer_id
),
segmented AS (
  SELECT customer_id, lifetime_value,
         CASE WHEN order_count >= 5 THEN 'loyal'
              WHEN order_count >= 2 THEN 'repeat'
              ELSE 'one-time' END AS segment
  FROM customer_totals
)
SELECT segment,
       COUNT(*)            AS customers,
       AVG(lifetime_value) AS avg_lifetime_value
FROM segmented
GROUP BY segment;
```

Mention recursive CTEs (`WITH RECURSIVE` in PostgreSQL and MySQL) for hierarchies such as an employee reporting chain.

### 18. Calculate month-over-month revenue growth.

```sql
WITH monthly AS (
  SELECT EXTRACT(YEAR FROM order_date)  AS yr,
         EXTRACT(MONTH FROM order_date) AS mon,
         SUM(amount) AS revenue
  FROM orders
  GROUP BY EXTRACT(YEAR FROM order_date), EXTRACT(MONTH FROM order_date)
)
SELECT yr, mon, revenue,
       LAG(revenue) OVER (ORDER BY yr, mon) AS prev_revenue,
       ROUND(
         100.0 * (revenue - LAG(revenue) OVER (ORDER BY yr, mon))
         / NULLIF(LAG(revenue) OVER (ORDER BY yr, mon), 0),
         1
       ) AS mom_growth_pct
FROM monthly
ORDER BY yr, mon;
```

LAG reads the previous row's value. Point out the edge case: LAG compares with the previous row, not the previous calendar month, so a month with no orders would be skipped silently. The first month's growth is NULL because there is nothing to compare with.

### 19. Find the top 3 products by revenue in each category.

```sql
WITH product_revenue AS (
  SELECT p.category, p.product_id, p.product_name,
         SUM(oi.quantity * oi.price) AS revenue
  FROM order_items oi
  JOIN products p ON p.product_id = oi.product_id
  GROUP BY p.category, p.product_id, p.product_name
),
ranked AS (
  SELECT category, product_name, revenue,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) AS rn
  FROM product_revenue
)
SELECT category, product_name, revenue
FROM ranked
WHERE rn <= 3
ORDER BY category, revenue DESC;
```

Say which ranking you chose and why. ROW_NUMBER returns exactly three products; DENSE_RANK would include extra products tied on revenue.

### 20. Calculate a 7-day rolling average of daily revenue.

```sql
WITH daily AS (
  SELECT order_date, SUM(amount) AS revenue
  FROM orders
  GROUP BY order_date
)
SELECT order_date, revenue,
       AVG(revenue) OVER (
         ORDER BY order_date
         ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       ) AS rolling_7_day_avg
FROM daily
ORDER BY order_date;
```

The frame counts rows, not days. If some dates have no orders, join to a calendar table first so every day has a row, otherwise the "7 days" can stretch further back.

## How to answer SQL questions in a live round

- Restate the question and ask about the grain: one row per what?
- Ask how ties, NULLs and duplicates should be handled before you write anything.
- Write the query in stages, usually as CTEs, and explain each one.
- Test it mentally on three or four rows, including an edge case.
- If you know a second approach, mention it and say when you would prefer it.

If you are rusty on the fundamentals, start with our [beginner's guide to SQL for data analysis](/articles/sql-for-data-analysis), then come back to these.

## Frequently asked questions

### Which SQL topics come up most in data analyst interviews?

Joins, GROUP BY with HAVING, window functions such as ROW_NUMBER, DENSE_RANK and LAG, and handling duplicates and NULLs appear again and again. Date logic like month-over-month growth is also common in e-commerce and fintech interviews.

### Should I practise in MySQL or PostgreSQL?

Either is fine, because the core syntax is the same. Learn the date functions of whichever database the job description mentions, since those differ most between dialects. Every answer in this article runs on both.

### Can I use LIMIT and OFFSET to find the second highest salary?

`ORDER BY salary DESC LIMIT 1 OFFSET 1` works in MySQL and PostgreSQL, but it returns the top salary again if two people share it. Add DISTINCT or use DENSE_RANK, and mention that standard SQL uses `OFFSET 1 ROWS FETCH NEXT 1 ROW ONLY` while SQL Server uses `TOP` or OFFSET FETCH.

### Do data analysts need to know indexes and stored procedures?

Rarely in depth. You should be able to explain that an index speeds up lookups and filters at some cost to writes, but analyst interviews focus on querying rather than database administration.

### Is SQL enough to get a data analyst job?

SQL is the most heavily tested skill, but most roles also expect Excel, basic statistics and a BI tool. Review the full set of [data analyst interview questions](/articles/data-analyst-interview-questions), and build one or two [portfolio projects](/articles/data-analyst-portfolio-project-ideas) where SQL does the heavy lifting.

## Next steps

Load a small sample dataset into PostgreSQL or MySQL, recreate these six tables and solve all 20 questions without looking, then check your answers here. If you want a structured path with live practice, InsightNest's [weekend data analytics programme](/) covers SQL alongside Excel, Python, statistics and Power BI, including interview preparation sessions.
