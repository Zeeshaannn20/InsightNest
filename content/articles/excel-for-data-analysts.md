---
title: Excel for Data Analysis: Functions and Features Analysts Use
slug: excel-for-data-analysts
category: Skills & Tools
excerpt: Excel for data analysis, explained on one worked sales sheet: XLOOKUP, SUMIFS, IFS, dates, pivot tables, Power Query and FILTER. Copy-ready formulas inside.
---
Excel for data analysis comes down to a focused toolkit: lookups (`XLOOKUP` or `INDEX` with `MATCH`), conditional totals (`SUMIFS`, `COUNTIFS`), logic (`IF`, `IFS`), text and date functions, pivot tables, Power Query, conditional formatting, data validation and dynamic arrays like `FILTER` and `UNIQUE`. Learn these well and you can clean, summarise and present most business datasets without leaving the spreadsheet. This guide walks through each one on the same small sales sheet so you can follow along.

## Why analysts still use Excel

Even in companies with SQL warehouses and Power BI dashboards, a lot of analysis passes through Excel. Finance teams budget in it, operations teams track daily numbers in it, and managers ask for "the data in Excel". In many Indian BFSI firms, IT services companies and MIS roles, Excel is the first tool you are tested on.

The functions below assume Microsoft 365 or Excel 2021 and later. Where a function needs a newer version, it is noted, along with an older alternative.

## The worked example

Create a sheet named `Orders` with these columns in A to H: Order ID, Order Date, City, Product ID, Qty, Unit Price, Revenue, Status. Revenue is Qty multiplied by Unit Price. Enter these six rows starting in row 2:

- Row 2: ORD-1001, 05-Jan-2026, Mumbai, P-01, 2, 799, 1598, Delivered
- Row 3: ORD-1002, 07-Jan-2026, Pune, P-03, 1, 2499, 2499, Delivered
- Row 4: ORD-1003, 12-Jan-2026, Mumbai, P-02, 3, 349, 1047, Returned
- Row 5: ORD-1004, 18-Jan-2026, Bengaluru, P-01, 1, 799, 799, Delivered
- Row 6: ORD-1005, 02-Feb-2026, Mumbai, P-03, 2, 2499, 4998, Delivered
- Row 7: ORD-1006, 09-Feb-2026, Pune, P-02, 4, 349, 1396, Delivered

Then create a second sheet named `Products` with Product ID, Product Name and Category in A to C:

- Row 2: P-01, Steel Water Bottle, Kitchen
- Row 3: P-02, Cotton Socks (Pack of 3), Fashion
- Row 4: P-03, Bluetooth Earbuds, Electronics

Before writing a single formula, select the data and press `Ctrl + T` to turn it into an Excel Table. Tables expand automatically when you add rows, keep formatting consistent and let you use readable structured references such as `Orders[Revenue]` instead of `G2:G7`. The examples below use normal cell references so they work anywhere, but in real work prefer Tables.

## Lookups: XLOOKUP and INDEX-MATCH

Lookups bring information from one table into another, the spreadsheet version of a SQL join. Here, the `Orders` sheet knows the Product ID but not the category.

In cell I2 of `Orders`, add a Category column:

`=XLOOKUP(D2, Products!A:A, Products!C:C, "Not found")`

For row 2, this returns Kitchen. The arguments are: what to find, where to look, what to return, and what to show if nothing matches. Unlike `VLOOKUP`, `XLOOKUP` can look left, defaults to an exact match, and does not break when someone inserts a column.

`XLOOKUP` is not available in Excel 2016 or 2019. The classic alternative, which every analyst should still recognise, is `INDEX` with `MATCH`:

`=INDEX(Products!C:C, MATCH(D2, Products!A:A, 0))`

`MATCH` finds the row position of P-01 in column A, and `INDEX` returns the value at that position in column C. The `0` forces an exact match; forgetting it is a classic source of wrong results. Interviewers still ask about `VLOOKUP` versus `INDEX`-`MATCH`, so be ready to explain the difference.

## Conditional totals: SUMIFS, COUNTIFS and AVERAGEIFS

These are the workhorses of reporting. They add, count or average only the rows that meet every condition you give.

Delivered revenue from Mumbai:

`=SUMIFS(G2:G7, C2:C7, "Mumbai", H2:H7, "Delivered")`

The result is 6596 (1598 plus 4998). The returned order is excluded. Note the argument order: the range to sum comes first, followed by pairs of criteria range and criteria.

Delivered revenue for January 2026, using dates as conditions:

`=SUMIFS(G2:G7, H2:H7, "Delivered", B2:B7, ">="&DATE(2026,1,1), B2:B7, "<"&DATE(2026,2,1))`

The result is 4896 (1598, 2499 and 799). Using "greater than or equal to the 1st" and "less than the 1st of next month" is safer than trying to name the last day of every month.

Number of returned orders from Mumbai:

`=COUNTIFS(C2:C7, "Mumbai", H2:H7, "Returned")`

The result is 1. `AVERAGEIFS` follows the same pattern as `SUMIFS`, so `=AVERAGEIFS(G2:G7, H2:H7, "Delivered")` gives the average delivered order value of 2258.

Put criteria in cells rather than typing them into formulas. If K2 contains Mumbai, write `=SUMIFS(G2:G7, C2:C7, K2, H2:H7, "Delivered")`, and you can change the city without editing the formula.

## Logic: IF, IFS and IFERROR

`IF` returns one value when a test is true and another when it is false. Flag large orders:

`=IF(G2>=2000, "Large", "Standard")`

When you have more than two outcomes, nested `IF` statements become hard to read. `IFS` checks conditions in order and returns the first match:

`=IFS(G2>=4000, "High", G2>=1500, "Medium", TRUE, "Low")`

Row 2 (1598) becomes Medium, row 6 (4998) becomes High and row 5 (799) becomes Low. The final `TRUE` acts as a catch-all, like `ELSE` in SQL's `CASE`.

Wrap lookups in `IFERROR` when missing values are expected and you want a clean output, for example `=IFERROR(INDEX(Products!C:C, MATCH(D2, Products!A:A, 0)), "Unknown")`. Use it sparingly, because it hides every error, including real mistakes.

## Text functions for cleaning

Real exports are messy: extra spaces, inconsistent capitals, codes packed into one cell. The functions that fix most of this:

- `TRIM` removes extra spaces: `=TRIM(C2)` turns "  Mumbai " into "Mumbai".
- `PROPER`, `UPPER` and `LOWER` standardise case: `=PROPER(TRIM(C2))` fixes "mUMBAI".
- `LEFT`, `RIGHT` and `MID` extract fixed positions: `=RIGHT(A2, 4)` returns 1001 from ORD-1001.
- `TEXTBEFORE` and `TEXTAFTER` split on a delimiter in Microsoft 365: `=TEXTAFTER(A2, "-")` also returns 1001.
- `TEXT` formats numbers and dates as labels: `=TEXT(B2, "mmm-yyyy")` returns Jan-2026.
- `CONCAT` or the `&` operator join values: `=C2 & " - " & H2` returns "Mumbai - Delivered".
- `SUBSTITUTE` replaces characters: `=SUBSTITUTE(A2, "ORD-", "")` strips the prefix.

Remember that `TEXT` returns text, so use it for labels, not for values you still need to calculate with.

## Date functions

Dates in Excel are numbers under the hood (days since 1900), which is why you can subtract them. Useful functions:

- `=YEAR(B2)`, `=MONTH(B2)` and `=DAY(B2)` split a date into parts.
- `=EOMONTH(B2, 0)` returns the last day of that month; `=EOMONTH(B2, -1) + 1` returns the first day.
- `=WEEKDAY(B2, 2)` returns 1 for Monday through 7 for Sunday, useful for weekday versus weekend analysis.
- `=NETWORKDAYS(B2, TODAY())` counts working days between two dates.
- `=TODAY() - B2` gives the age of an order in days.

An India-specific one worth knowing: the financial year runs from April to March. To label each order with the year in which its financial year ends, use:

`=IF(MONTH(B2)>=4, YEAR(B2)+1, YEAR(B2))`

All six example orders fall in January and February 2026, so they return 2026, meaning FY 2025-26. Finance and BFSI teams report this way, and getting it right in an assignment shows you understand the business context.

## Pivot tables

A pivot table summarises thousands of rows in seconds, with no formulas. It is the single most important Excel feature for analysts.

To summarise delivered revenue by city:

1. Click anywhere in the data and choose Insert, then PivotTable, then New Worksheet.
2. Drag City into Rows and Revenue into Values (it becomes Sum of Revenue).
3. Drag Status into Filters and select only Delivered.
4. Sort the values from largest to smallest.

The result: Mumbai 6596, Pune 3895, Bengaluru 799, with a grand total of 11290. From there, drag Order Date into Columns and group it by Months to see a trend, right-click a value and choose Show Values As, then % of Grand Total for shares, and add a Slicer for a clickable filter.

Refresh the pivot after the source data changes, and build it on a Table so new rows are included.

## Power Query

Power Query (Data, then Get Data) is Excel's built-in tool for repeatable cleaning. Instead of fixing the same export by hand every Monday, you record the steps once and click Refresh next time.

Typical analyst uses:

- Combine every monthly CSV in a folder into one table with Get Data, then From Folder.
- Remove blank rows, trim text and set correct data types for every column.
- Split columns by a delimiter, such as separating ORD from 1001.
- Unpivot month columns (Jan, Feb, Mar) into a tidy Month and Value layout that pivot tables prefer.
- Merge queries to bring in Category from the Products table, a join without any lookup formula.

Each step is listed in the Applied Steps pane, so anyone can see exactly what you did. The same engine runs inside Power BI, so the skill carries over directly.

## Conditional formatting

Conditional formatting draws attention to patterns, not decoration.

- Highlight Cells Rules can mark revenue above a threshold or duplicate order IDs.
- Colour Scales and Data Bars show relative size at a glance in a summary table.
- A formula rule highlights entire rows: select A2:H7, choose New Rule, then Use a formula, and enter `=$H2="Returned"`.

The dollar sign before H locks the column, so every cell in the row checks the Status column. That one detail is what makes whole-row highlighting work.

## Data validation

Data validation stops bad data at the point of entry, which matters when you build templates other people fill in.

- Create a dropdown with Data, then Data Validation, then List, and point the source to `=Products!$A$2:$A$4`.
- Restrict a date column to a sensible range, such as dates in the current financial year.
- Restrict Qty to whole numbers greater than zero.
- Add an input message explaining what each column expects.

## Dynamic arrays: FILTER, UNIQUE and SORT

Dynamic array functions, available in Microsoft 365 and Excel 2021 onwards, return many values from one formula. The results "spill" into neighbouring cells.

A sorted list of cities, in K2:

`=SORT(UNIQUE(C2:C7))`

This spills Bengaluru, Mumbai and Pune into K2:K4. Next to it, in L2, refer to the whole spill range with the `#` symbol:

`=SUMIFS(G2:G7, C2:C7, K2#, H2:H7, "Delivered")`

L2:L4 now shows 799, 6596 and 3895. Change a city or status in the data and both columns update on their own: a small live report with two formulas. If your data is an Excel Table, use references like `Orders[City]` instead of `C2:C7` and new rows are picked up automatically too.

`FILTER` returns the rows that meet a condition. All delivered orders from Mumbai:

```
=FILTER(A2:H7, (C2:C7="Mumbai")*(H2:H7="Delivered"), "No matches")
```

Multiplying the two conditions means "and"; adding them with `+` means "or". The third argument is what to show when nothing matches.

## How to practise Excel for data analysis

- Download a public sales or HR dataset with a few thousand rows and clean it using only Power Query.
- Answer ten business questions with `SUMIFS` and `COUNTIFS`, then check each answer with a pivot table.
- Rebuild one report using `FILTER`, `UNIQUE` and `SORT` so it updates automatically.
- Time yourself, because interview Excel tests are usually timed.

Once comfortable, translate the same questions into queries using this guide to [SQL for data analysis](/articles/sql-for-data-analysis). You will notice that `SUMIFS` maps to `GROUP BY` and lookups map to joins, which makes both tools easier to learn.

## Frequently asked questions

### Is Excel enough for a data analyst job?

Excel alone is enough for some MIS and reporting roles, but most data analyst positions also ask for SQL and a BI tool. Treat Excel as the foundation rather than the whole toolkit. This overview of [data analyst skills](/articles/data-analyst-skills) shows how the pieces fit together.

### What Excel functions should a data analyst know?

At minimum: `XLOOKUP` or `INDEX`-`MATCH`, `SUMIFS`, `COUNTIFS`, `IF` and `IFS`, `IFERROR`, `TRIM`, `TEXT`, date functions like `EOMONTH`, and the dynamic array functions `FILTER`, `UNIQUE` and `SORT`. Add pivot tables and Power Query and you cover most daily work.

### Is VLOOKUP still used?

Yes, it still appears in older workbooks and in interviews, so you should understand it. For new work, `XLOOKUP` or `INDEX`-`MATCH` is more reliable because neither breaks when columns are inserted and both can look to the left.

### Should I learn Excel or Power BI first?

Learn Excel first. Pivot tables, clean data and Power Query in Excel lead directly into Power BI, which uses the same Power Query engine. If you are deciding on a dashboard tool next, this comparison of [Power BI vs Tableau](/articles/power-bi-vs-tableau) can help.

### How are Excel skills tested in data analyst interviews?

Usually with a timed task: you receive a raw dataset and must clean it, build a pivot or summary, and answer a few business questions. Some interviewers also ask you to explain lookups, `SUMIFS` logic or how you would handle duplicates. Practise on unfamiliar datasets under a time limit.

## Next steps

Build the six-row example above, write every formula yourself, then repeat on a real dataset of a few thousand rows. When you can clean, summarise and present it in under an hour, you are ready for most entry-level tests.

If you want structured practice in Excel along with SQL, Python and Power BI, with live weekend sessions and projects, the [InsightNest data analytics programme](/) covers them in sequence. Whatever path you choose, keep practising on real, messy data.
