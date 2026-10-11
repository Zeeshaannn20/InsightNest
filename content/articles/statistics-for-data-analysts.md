---
title: Statistics for Data Analysts: Core Concepts, Worked Examples
slug: statistics-for-data-analysts
category: Skills & Tools
excerpt: Statistics for data analysts in plain words: mean vs median, standard deviation, p-values, A/B tests and confidence intervals, with worked numbers to check.
---
Statistics for data analysts comes down to a short list of ideas: summarising data (mean, median, spread, percentiles), understanding distributions, telling correlation from causation, sampling properly, and testing whether a difference is real (hypothesis tests, p-values, confidence intervals). You don't need advanced maths. You need to know which number to report, when it misleads, and how to explain it to a manager in one sentence. Each concept below comes with a small worked example.

## Descriptive statistics: summarising what you have

Descriptive statistics describe the data in front of you without making claims about anything bigger. The core set:

- Count: how many values (and how many are missing).
- Measures of centre: mean, median, mode.
- Measures of spread: range, variance, standard deviation, interquartile range.
- Position: minimum, maximum, percentiles and quartiles.

In Excel these are `AVERAGE`, `MEDIAN`, `MODE.SNGL`, `STDEV.S`, `PERCENTILE.INC` and `QUARTILE.INC`. In pandas, `df.describe()` gives most of them in one line. The [Excel for data analysts guide](/articles/excel-for-data-analysts) and the [Python and pandas walkthrough](/articles/python-pandas-for-data-analysis) show both in practice.

## Mean vs median: the salary example

The mean is the sum divided by the count. The median is the middle value when you sort the data. Choosing the wrong one is a common reporting mistake.

Take a made-up team of nine analysts with these annual salaries in LPA:

- 3.5, 4, 4, 4.5, 5, 5, 5.5, 6 and 30

The ₹30 LPA figure belongs to the team's head of analytics. Now calculate:

- Sum: 67.5, so the mean is 67.5 / 9 = 7.5 LPA.
- Sorted, the fifth (middle) value is 5, so the median is 5 LPA.

Eight of the nine people earn 6 LPA or less, yet the mean says "average salary 7.5 LPA". The median of 5 LPA is a far more honest description of a typical person on this team.

Remove the head of analytics and recalculate. The mean drops to about 4.69 LPA and the median to 4.75 LPA. One person moved the mean by almost 2.8 LPA, but moved the median by only 0.25 LPA. That is what "the median is robust to outliers" means.

Rules of thumb:

- Use the median for skewed data such as salaries, house prices, order values, delivery times and time spent on an app.
- Use the mean when the data is roughly symmetric, or when totals matter (average order value times orders gives revenue; median order value doesn't).
- When in doubt, report both. A large gap between them tells you the data is skewed.

## Variance and standard deviation: how spread out is the data

Two dark stores each average 50 orders a day over five days:

- Store A: 48, 50, 52, 50, 50
- Store B: 20, 80, 50, 30, 70

Same mean, very different reality: Store A is predictable, Store B swings wildly. Variance and standard deviation measure that spread.

Worked for Store A:

1. Subtract the mean from each value: −2, 0, 2, 0, 0.
2. Square each difference: 4, 0, 4, 0, 0.
3. Add them up: 8.
4. Divide by n − 1 (for a sample): 8 / 4 = 2. That is the sample variance.
5. Take the square root: √2 ≈ 1.41 orders. That is the standard deviation.

For Store B, the squared differences are 900, 900, 0, 400 and 400, which sum to 2,600. Variance is 2,600 / 4 = 650, and the standard deviation is about 25.5 orders.

Standard deviation is in the same unit as the data (orders), which is why analysts report it instead of variance. Dividing by n − 1 corrects a small underestimate when working with a sample; Excel's `STDEV.S` and pandas' `.std()` both do this by default.

## Percentiles, quartiles and outliers

The 90th percentile (p90) is the value below which 90% of observations fall. If p90 delivery time is 3 days, nine out of ten orders arrive within 3 days. Operations teams watch p90 and p95 because averages hide the slow cases.

Quartiles split sorted data into four parts. Q1 is the 25th percentile, Q2 is the median and Q3 is the 75th percentile. The interquartile range (IQR) is Q3 − Q1, the spread of the middle half of the data.

A common outlier rule flags anything above Q3 + 1.5 times IQR or below Q1 − 1.5 times IQR. For the salary data, pandas gives Q1 = 4 and Q3 = 5.5, so:

- IQR = 5.5 − 4 = 1.5
- Upper fence = 5.5 + (1.5 times 1.5) = 7.75 LPA
- The 30 LPA salary is far above the fence, so it's flagged as an outlier.

Tools use slightly different quartile methods, so Excel, SQL and pandas may differ a little. And an outlier isn't automatically an error: the head of analytics is real. Investigate before you delete.

## Distributions: the shape of your data

A distribution describes how often each value occurs. Plot a histogram first, because the shape tells you which statistics make sense.

- Normal distribution: symmetric and bell-shaped, with mean and median roughly equal.
- Right-skewed distribution: a long tail of large values. Salaries, order values and session lengths usually look like this, and the mean sits above the median.
- Binary outcomes: converted or not, churned or not. You summarise these as proportions, such as a 4% conversion rate.

For roughly normal data, the 68-95-99.7 rule is a handy shortcut: about 68% of values fall within one standard deviation of the mean, 95% within two, and 99.7% within three. If delivery times average 3 days with a standard deviation of 0.5 days and look normal, about 95% of orders arrive between 2 and 4 days. Don't apply this rule to skewed data; it will mislead you.

## Correlation vs causation

Correlation measures how strongly two numeric variables move together. Pearson's correlation coefficient, r, runs from −1 (perfectly opposite) through 0 (no linear relationship) to +1 (perfectly together). In Excel it's `CORREL`; in pandas it's `df["a"].corr(df["b"])`.

A strong correlation doesn't tell you that one thing causes the other. Common traps:

- A hidden third factor: ice cream and air conditioner sales rise together because both are driven by summer heat.
- Seasonality: marketing spend and sales both jump during the Diwali season, so the correlation overstates what the ads did.
- Reverse causation: customers who use a premium feature churn less, but perhaps loyal customers are simply the ones who explore features.

The reliable way to establish cause and effect is a controlled experiment such as an A/B test. When you can't experiment, write "associated with" rather than "caused".

## Sampling: population vs sample

The population is everyone you care about, such as all of a bank's credit card customers. A sample is the subset you actually measure, and the question is whether it represents the population.

- Simple random sampling gives every member an equal chance of selection.
- Stratified sampling draws separately from groups (metro and non-metro cities, for example) so that small groups aren't missed.
- Convenience sampling, such as surveying only your Instagram followers, is quick but describes your followers, not the market.
- Survivorship bias happens when you only see what made it through a filter, such as studying only customers who are still active.

Precision improves with the square root of the sample size: to halve your margin of error, you need roughly four times as much data.

## Hypothesis tests and p-values in plain words

A hypothesis test asks one question: is this difference large enough that it's unlikely to be random noise?

You start with a null hypothesis, the boring explanation: "there is no real difference". The alternative hypothesis is that there is one.

The p-value measures how surprising your data would be if the null were true. It's the probability of seeing a difference at least as large as the one you observed, assuming there is actually no difference. A small p-value means "this would be unusual if nothing were going on".

Most teams use a significance level of 0.05. If p is below 0.05, they reject the null hypothesis and call the result statistically significant. Three things to keep straight:

- The p-value is not the probability that the null hypothesis is true.
- "Not significant" doesn't prove there is no effect; your sample may just be too small to detect it.
- At a 0.05 threshold, about 1 in 20 tests of a change that truly does nothing will still look significant (a false positive, or Type I error). Missing a real effect is a Type II error.

## Worked example: an A/B test on a checkout button

An e-commerce team tests a new checkout button. Visitors are randomly split:

- Version A (current): 10,000 visitors, 400 purchases, a 4.0% conversion rate.
- Version B (new): 10,000 visitors, 460 purchases, a 4.6% conversion rate.

B is ahead by 0.6 percentage points. Is that real? A two-proportion z-test answers it:

1. Pooled conversion rate: (400 + 460) / 20,000 = 0.043.
2. Standard error of the difference: √(0.043 times 0.957 times (1/10,000 + 1/10,000)) ≈ 0.00287.
3. z-score: 0.006 / 0.00287 ≈ 2.09.
4. Two-sided p-value for z = 2.09: about 0.036.

Since 0.036 is below 0.05, the team can say the new button's higher conversion rate is statistically significant. You can reproduce this in Python with only the standard library:

```python
import math

visitors_a, buyers_a = 10_000, 400
visitors_b, buyers_b = 10_000, 460

rate_a = buyers_a / visitors_a
rate_b = buyers_b / visitors_b
pooled = (buyers_a + buyers_b) / (visitors_a + visitors_b)

se = math.sqrt(pooled * (1 - pooled) * (1 / visitors_a + 1 / visitors_b))
z = (rate_b - rate_a) / se
p_value = math.erfc(abs(z) / math.sqrt(2))   # two-sided

print(f"z = {z:.2f}, p = {p_value:.3f}")       # z = 2.09, p = 0.036
```

The `proportions_ztest` function in `statsmodels` does the same calculation. Good testing habits matter as much as the maths:

- Decide the sample size before you start, and don't stop the test the moment p dips below 0.05.
- Run tests for full weeks, so weekday and weekend behaviour are both included.
- Check practical significance: a 0.6-point lift on a 4% base is a 15% relative improvement, which is meaningful for most stores. A tiny lift can be statistically significant with huge traffic and still not be worth building.

## Confidence intervals: a range, not a single number

A confidence interval gives a range of plausible values for the true number, instead of a single point estimate. For a large sample, a 95% interval is roughly the estimate plus or minus 1.96 standard errors.

For the A/B test, the standard error of the difference (calculated without pooling) is about 0.00287:

- 0.6% ± (1.96 times 0.287%) gives roughly +0.04 to +1.16 percentage points.

The whole interval is above zero, matching the significant p-value. It also shows the true lift could be tiny or above one point, which is more useful to a product manager than "p = 0.036".

A second example with a mean. You sample 100 orders and find an average order value of ₹1,250 with a standard deviation of ₹400:

1. Standard error = 400 / √100 = ₹40.
2. Margin of error = 1.96 times 40 ≈ ₹78.
3. 95% confidence interval ≈ ₹1,172 to ₹1,328.

You would report: "Average order value is about ₹1,250, and we're 95% confident the true average is between roughly ₹1,170 and ₹1,330." Strictly, it means about 95% of intervals built this way, over repeated samples, would contain the true value.

## Frequently asked questions

### How much statistics does a data analyst need?

Less than most people fear. The concepts in this article cover most day-to-day analyst work. Simple linear regression is a useful next step, but deep probability theory and proofs are rarely needed for analyst roles.

### Is statistics asked in data analyst interviews in India?

Often, usually as conceptual questions rather than calculations: "mean or median for salary data?", "what is a p-value?" or "how would you test a new feature?" The list of [data analyst interview questions](/articles/data-analyst-interview-questions) includes more examples.

### What is a good p-value?

There is no "good" p-value, only a threshold your team agreed on in advance, most commonly 0.05. A p-value below that threshold means the result is statistically significant. Always pair it with the size of the effect and a confidence interval, because a significant result can still be too small to matter.

### Can I learn statistics for data analysis without a maths background?

Yes. The arithmetic is addition, division, squares and square roots, and Excel or Python does the calculation for you. What matters is understanding what each number means and when it misleads.

## Next steps

Take a public dataset, calculate the mean, median, standard deviation and quartiles for one numeric column, plot a histogram, and write three sentences on what it shows. Then rerun the A/B test code with your own numbers to see how sample size changes the p-value.

If you'd like to learn statistics alongside Excel, SQL, Python and Power BI in live weekend sessions with projects, the [InsightNest data analytics programme](/) covers all of these in one structured path.
