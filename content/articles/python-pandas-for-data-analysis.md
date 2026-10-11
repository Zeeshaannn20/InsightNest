---
title: Python for Data Analysis: A Beginner's pandas Walkthrough
slug: python-pandas-for-data-analysis
category: Skills & Tools
excerpt: Learn Python for data analysis with pandas: load, clean, filter, group, merge and chart one small sales dataset, step by step, with code you can run today.
---
Python for data analysis mostly means one library: pandas. With about a dozen functions (`read_csv`, `info`, `drop_duplicates`, `fillna`, `groupby`, `merge`, `pivot_table` and a few more) you can load a messy file, clean it, summarise it and chart it in a repeatable script. This walkthrough does exactly that on one small, realistic sales dataset, so you can run every line yourself.

## What you need before you start

You need Python 3 with pandas and matplotlib installed. If you don't want to install anything, open a free Google Colab notebook in your browser; both libraries come preinstalled. On your own laptop, run this in a terminal:

```
pip install pandas matplotlib
```

Use a Jupyter notebook (or Colab) rather than a plain `.py` file while learning. Notebooks show the output of each step right under the code, which is how most analysts actually work with pandas.

## The dataset: two months of orders from an online store

Imagine you have just joined a small D2C brand that sells electronics, fashion and home products across Indian cities. Your manager sends a CSV export of July and August orders and asks three questions: which category earns the most, which cities matter, and how did the two months compare.

Real exports are rarely clean, so this one has the usual problems: a duplicated order, a missing city, a missing quantity, and prices stored as text with commas ("18,999"). Run this cell once to create the file:

```python
csv_text = """order_id,order_date,customer_id,city,category,quantity,unit_price
1001,2026-07-02,C01,Bengaluru,Electronics,1,"18,999"
1002,2026-07-03,C02,Mumbai,Fashion,2,799
1003,2026-07-03,C03,Delhi,Home,1,"2,499"
1004,2026-07-05,C01,Bengaluru,Fashion,3,599
1005,2026-07-08,C04,Pune,Electronics,1,"24,500"
1005,2026-07-08,C04,Pune,Electronics,1,"24,500"
1006,2026-07-11,C05,,Home,2,"1,150"
1007,2026-08-01,C02,Mumbai,Electronics,1,"15,999"
1008,2026-08-04,C06,Delhi,Fashion,,899
1009,2026-08-09,C03,Delhi,Home,4,349
1010,2026-08-15,C07,Hyderabad,Fashion,1,"1,899"
1011,2026-08-20,C05,Chennai,Electronics,2,"3,299"
1012,2026-08-28,C08,Bengaluru,Home,1,"5,600"
"""

with open("orders.csv", "w") as f:
    f.write(csv_text)
```

## Step 1: Load the file with read_csv

```python
import pandas as pd

df = pd.read_csv("orders.csv")
df.head()
```

`pd.read_csv` returns a DataFrame, which is pandas' version of a spreadsheet table: named columns, numbered rows. `df.head()` shows the first five rows. For Excel files, the equivalent is `pd.read_excel("file.xlsx", sheet_name="Sheet1")`.

## Step 2: Inspect before you change anything

Spend two minutes understanding the data before you clean it. These four lines answer most of your first questions:

```python
df.shape               # (13, 7): 13 rows, 7 columns
df.info()              # column types and non-null counts
df.isna().sum()        # missing values per column
df.duplicated().sum()  # fully duplicated rows
```

Here is what they tell you about this file:

- `shape` is (13, 7), so 13 rows, but the store only had 12 distinct orders.
- `isna().sum()` shows one missing `city` and one missing `quantity`.
- `duplicated().sum()` returns 1, which is order 1005 appearing twice.
- `info()` lists `unit_price` as text (object, or `str` in pandas 3), not a number, because of the commas.
- `order_date` is also text, so you can't yet group by month.
- `quantity` is a float (1.0, 2.0) rather than an integer, because a column containing a missing value can't be a plain integer.

`df.describe()` gives count, mean, standard deviation, min, quartiles and max for numeric columns. It's a quick sanity check for impossible values such as negative quantities. If those terms are new, the guide to [statistics for data analysts](/articles/statistics-for-data-analysts) explains each one with worked numbers.

## Step 3: Clean duplicates, data types and missing values

### Remove duplicate rows

```python
df = df.drop_duplicates()
```

This keeps the first copy of order 1005 and drops the second. On real data, check which columns define a duplicate. If two rows share an `order_id` but differ elsewhere, use `df.drop_duplicates(subset=["order_id"])` only after you understand why.

### Fix data types

```python
df["unit_price"] = df["unit_price"].astype(str).str.replace(",", "").astype(float)
df["order_date"] = pd.to_datetime(df["order_date"])
```

The first line strips the commas and converts the text to numbers. The second turns the date strings into real dates, which lets you use `.dt.month`, `.dt.day_name()` and date filtering. Getting types right is the single most common fix in day-to-day analysis.

### Handle missing values

There is no universal rule for nulls. You decide per column, based on what the value means:

```python
df["city"] = df["city"].fillna("Unknown")
df = df.dropna(subset=["quantity"])
df["quantity"] = df["quantity"].astype(int)
```

A missing city doesn't stop you calculating revenue, so you keep the row and label it "Unknown". A missing quantity makes revenue impossible to calculate, so you drop that row (order 1008). Always note down how many rows you dropped and why; your manager will ask.

Now add the column everyone actually wants:

```python
df["revenue"] = df["quantity"] * df["unit_price"]
df.shape   # (11, 8)
```

You started with 13 rows and now have 11 clean orders: one duplicate removed, one row with no quantity dropped.

## Step 4: Filter rows with conditions

Filtering in pandas uses a condition inside square brackets. Combine conditions with `&` (and) or `|` (or), and wrap each one in parentheses:

```python
big_electronics = df[(df["category"] == "Electronics") & (df["revenue"] > 10000)]
big_electronics[["order_id", "city", "revenue"]]
```

```
   order_id       city  revenue
0      1001  Bengaluru  18999.0
4      1005       Pune  24500.0
7      1007     Mumbai  15999.0
```

Two more patterns you will use constantly:

```python
south = df[df["city"].isin(["Bengaluru", "Chennai", "Hyderabad"])]   # 5 orders
july = df[df["order_date"].dt.month == 7]                              # 6 orders
```

If you know SQL, this is the `WHERE` clause. The [SQL for data analysis guide](/articles/sql-for-data-analysis) shows the same ideas on the database side.

## Step 5: Summarise with groupby and agg

`groupby` splits the rows into groups, applies a calculation to each group and combines the results. It's pandas' version of `GROUP BY` in SQL or a pivot table in Excel.

```python
by_category = (
    df.groupby("category")
      .agg(orders=("order_id", "count"),
           units=("quantity", "sum"),
           revenue=("revenue", "sum"),
           avg_order_value=("revenue", "mean"))
      .sort_values("revenue", ascending=False)
)
by_category.round(0)
```

```
             orders  units  revenue  avg_order_value
category
Electronics       4      5  66096.0          16524.0
Home              4      8  11795.0           2949.0
Fashion           3      6   5294.0           1765.0
```

The named aggregation syntax (`new_name=("column", "function")`) keeps your output columns readable. The answer to the first question is clear: Electronics brings in roughly ₹66,000 of the ₹83,185 total, even though Home sells more units.

For a single number per group, the short form is enough:

```python
df.groupby("city")["revenue"].sum().sort_values(ascending=False)
```

Bengaluru (₹26,396) and Pune (₹24,500) lead. Pune's total comes from one large order, which is worth saying out loud when you present it.

## Step 6: Combine tables with merge

Customer details usually live in a separate table. Say marketing has a list of how each customer signed up:

```python
customers = pd.DataFrame({
    "customer_id": ["C01", "C02", "C03", "C04", "C05", "C06", "C07"],
    "signup_channel": ["Instagram", "Google", "Referral", "Google",
                       "Instagram", "Referral", "Google"],
})

merged = df.merge(customers, on="customer_id", how="left")
merged["signup_channel"].isna().sum()   # 1
```

`merge` is a SQL join. `how="left"` keeps every order even when the customer is missing from the lookup table, and here one order (customer C08) has no match. Checking for nulls right after a merge is a habit worth building: an `inner` join would have silently dropped that order and understated revenue by ₹5,600.

```python
merged.groupby("signup_channel", dropna=False)["revenue"].sum()
```

`dropna=False` keeps the unmatched group visible instead of hiding it.

## Step 7: Reshape with pivot_table

To compare months side by side, create a month column and pivot:

```python
df["month"] = df["order_date"].dt.strftime("%Y-%m")

pivot = pd.pivot_table(
    df,
    index="month",
    columns="category",
    values="revenue",
    aggfunc="sum",
    fill_value=0,
    margins=True,
    margins_name="Total",
)
pivot
```

```
category  Electronics  Fashion     Home    Total
month
2026-07       43499.0   3395.0   4799.0  51693.0
2026-08       22597.0   1899.0   6996.0  31492.0
Total         66096.0   5294.0  11795.0  83185.0
```

This is the same output as an Excel pivot table, with one difference: it's code, so next month you rerun the notebook on the new file and get the updated table in seconds. August revenue fell to about ₹31,500 from about ₹51,700, mostly because Electronics halved, while Home grew.

## Step 8: Draw a simple chart with matplotlib

```python
import matplotlib.pyplot as plt

ax = by_category["revenue"].plot(kind="bar", color="#2b6cb0", figsize=(7, 4))
ax.set_title("Revenue by category, Jul-Aug 2026")
ax.set_xlabel("")
ax.set_ylabel("Revenue (₹)")
plt.xticks(rotation=0)
plt.tight_layout()
plt.savefig("revenue_by_category.png", dpi=150)
plt.show()
```

pandas calls matplotlib behind the scenes, so `.plot(kind="bar")` on a Series is enough for a clean bar chart. Keep the first charts plain: one message, a clear title, labelled axes, no 3D effects. Use a bar chart for comparing categories and a line chart (`kind="line"`) for trends over time.

## When Python should and shouldn't replace Excel or SQL

Python is not a replacement for everything. Good analysts pick the tool that fits the task.

Use Python and pandas when:

- The same analysis repeats every week or month and you're tired of redoing it by hand.
- The file is too large for Excel to open comfortably (Excel stops at about 10.5 lakh rows per sheet).
- You need to combine many files, such as 30 daily CSVs, into one table.
- The cleaning is messy: text parsing, inconsistent dates, many columns to fix.
- You need statistics, forecasting or a model that Excel handles poorly.

Stick with Excel when:

- It's a one-off question on a few thousand rows that a pivot table answers in two minutes.
- Your stakeholder needs to open, filter and edit the result themselves.
- You're building a quick what-if model for a finance or ops team.

Stick with SQL when:

- The data already sits in a database or warehouse and the job is filtering, joining and aggregating.
- The tables are large; let the database do the heavy lifting and pull only the summarised result into pandas.

In practice the three work together: SQL to extract, pandas to clean and analyse, and Excel or a BI tool to share. The [Excel for data analysts guide](/articles/excel-for-data-analysts) covers the spreadsheet side.

## Common beginner mistakes

- Using `and` / `or` instead of `&` / `|` in filters, or forgetting the parentheses around each condition.
- Forgetting to assign the result: `df.drop_duplicates()` on its own doesn't change `df`.
- Doing maths on a text column, such as prices with commas, and getting an error or wrong results.
- Merging without checking row counts before and after, which hides dropped or duplicated rows.
- Writing loops over rows (`for i in range(len(df))`) when a column operation does the same job faster.

## Frequently asked questions

### Is Python necessary for a data analyst job in India?

Not for every role, but it's increasingly listed alongside SQL and Excel in data analyst postings on Naukri and LinkedIn. Many entry-level roles in IT services, GCCs and BFSI lean on SQL and Excel first, while product companies and startups often expect working pandas. Learning the basics in this article puts you ahead of candidates who only list it on their resume.

### How long does it take to learn pandas for data analysis?

If you practise an hour a day, most beginners are comfortable with loading, cleaning, grouping and merging within four to six weeks. Fluency comes from repeating the workflow on different datasets, not from memorising every function. Pick one public dataset a week and answer three business questions about it.

### Should I learn SQL or Python first?

Learn SQL first if you're aiming for data analyst roles. It's tested in almost every analyst interview, it's quicker to become useful in, and pandas concepts such as filtering, grouping and joining map directly onto SQL ones. Start Python once you can write joins and `GROUP BY` queries comfortably.

### Do I need NumPy before pandas?

No. pandas is built on NumPy, but you can do nearly all everyday analysis without touching NumPy directly. You will pick up the few NumPy functions you need, such as `np.where`, along the way.

### Which Python libraries should a data analyst know?

pandas for data handling and matplotlib or seaborn for charts cover most analyst work. After that, `scipy.stats` or `statsmodels` help with hypothesis tests, and `openpyxl` lets pandas read and write Excel files. You don't need machine learning libraries for an analyst role.

## Next steps

Rebuild this walkthrough from memory on a different public dataset, then turn it into a small portfolio piece: a notebook with a clear question, the cleaning steps you took and two charts with written takeaways. The list of [data analyst portfolio project ideas](/articles/data-analyst-portfolio-project-ideas) has datasets that suit this.

If you'd prefer to learn Python alongside Excel, SQL, statistics and Power BI with live mentor sessions on weekends, the [InsightNest data analytics programme](/) covers that full path with portfolio projects.
