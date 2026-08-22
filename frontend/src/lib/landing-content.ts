// ============================================================
// Data Analyst programme — page content
//
// Everything editable lives here so the page component stays layout only.
// The BATCH block is the one thing you must keep current.
// ============================================================

export const BATCH = {
  // TODO: update the batch dates for each new cohort before publishing
  month: "August",
  startDate: "27 August 2026",
  timing: "Sat & Sun, 10:00 AM – 1:00 PM IST",
  language: "Hindi + English",
  whatsapp: "+91 87775 82751",
  whatsappLink: "https://wa.me/918777582751",
  email: "support@insightnest.in",
};

export const PRICE = { now: 2999, was: 5999 };

/** Headline numbers. Keep these defensible — they are advertising claims. */
export const STATS = [
  { value: "487+", label: "Students taught" },
  { value: "16", label: "Live sessions" },
  { value: "7", label: "Portfolio projects" },
  { value: "2", label: "Months, start to finish" },
];

export const PROBLEMS = [
  {
    icon: "visibility_off",
    title: "Recorded courses have no accountability",
    body: "No one notices when you stop. Motivation is not a study plan.",
  },
  {
    icon: "construction",
    title: "You learn tools, not thinking",
    body: "Knowing VLOOKUP isn’t analytics. Knowing which question to ask is.",
  },
  {
    icon: "folder_off",
    title: "No real projects",
    body: "A cleaned Titanic dataset is not a portfolio, and interviewers know it.",
  },
  {
    icon: "alt_route",
    title: "No career bridge",
    body: "You finish the syllabus with no resume, no positioning and no case-round practice.",
  },
];

export const DIFFERENTIATORS = [
  {
    icon: "sensors",
    title: "Live every Saturday & Sunday",
    body: "Not recorded. Not a webinar replay. You’re in the room while the project gets built — you ask, you get answered, you build alongside.",
  },
  {
    icon: "workspace_premium",
    title: "Projects are the curriculum",
    body: "3 mini and 4 major end-to-end projects. Every tool is taught inside a real business problem, never in isolation.",
  },
  {
    icon: "insights",
    title: "Business fundamentals baked in",
    body: "Revenue, retention, funnels, cohorts, margins and unit economics — so your analysis answers a business question, not just a technical one.",
  },
  {
    icon: "rocket_launch",
    title: "Career support is part of the program",
    body: "LinkedIn, resume, an application system and interview preparation — delivered as structured live sessions, not a PDF handout.",
  },
];

export const AUDIENCE_YES = [
  "A fresher or final-year student who needs a portfolio, fast",
  "A working professional in ops, sales, finance, support or HR switching into data",
  "A non-tech learner from commerce, arts, mechanical or biology who thinks coding isn’t for them",
  "Someone who tried self-learning, stalled, and needs structure plus a person to ask",
  "An existing analyst stuck in Excel who wants SQL, Python and Power BI on their resume",
];

export const AUDIENCE_NO = [
  "You want a guaranteed job with zero effort",
  "You can’t commit 8–10 hours a week for 2 months",
  "You want a certificate to collect, not a skill to use",
];

export type Track = {
  id: string;
  hue: string;
  name: string;
  summary: string;
  groups: { heading: string; items: string[] }[];
};

export const TRACKS: Track[] = [
  {
    id: "excel",
    hue: "#2F8F5B",
    name: "Excel & Spreadsheets",
    summary: "Beginner → Advanced",
    groups: [
      {
        heading: "Foundations",
        items: [
          "Spreadsheet anatomy, data types, cell referencing (relative, absolute, mixed)",
          "Data entry discipline, validation rules, protecting sheets",
          "Sorting, multi-level filtering, custom and conditional formatting",
        ],
      },
      {
        heading: "Core analysis",
        items: [
          "Formula toolkit: IF, IFS, SUMIF(S), COUNTIF(S), AVERAGEIF(S)",
          "Lookups done right: VLOOKUP, HLOOKUP, INDEX + MATCH, XLOOKUP",
          "Text functions: LEFT, RIGHT, MID, TRIM, CONCAT, TEXTSPLIT",
          "Date and time logic: DATEDIF, EOMONTH, NETWORKDAYS, WEEKDAY",
          "Error handling: IFERROR, ISNA, auditing and tracing formulas",
        ],
      },
      {
        heading: "Advanced",
        items: [
          "Pivot Tables and Pivot Charts, slicers, timelines, calculated fields",
          "Power Query: import, clean, unpivot, merge, append, refreshable pipelines",
          "Power Pivot and basic data modelling, relationships, intro to DAX measures",
          "Dynamic arrays: FILTER, SORT, UNIQUE, SEQUENCE",
          "What-if analysis: Goal Seek, Scenario Manager, Data Tables",
          "Building an interactive, self-refreshing dashboard from scratch",
          "Google Sheets equivalents plus QUERY, IMPORTRANGE, ARRAYFORMULA",
        ],
      },
    ],
  },
  {
    id: "sql",
    hue: "#2E56E8",
    name: "SQL",
    summary: "Beginner → Advanced",
    groups: [
      {
        heading: "Foundations",
        items: [
          "How databases think: tables, rows, keys, relationships, schemas",
          "SELECT, WHERE, ORDER BY, LIMIT, DISTINCT",
          "Operators, LIKE, IN, BETWEEN, NULL handling",
        ],
      },
      {
        heading: "Core querying",
        items: [
          "Aggregations: GROUP BY, HAVING, COUNT, SUM, AVG, MIN, MAX",
          "Joins in depth: INNER, LEFT, RIGHT, FULL, SELF, CROSS",
          "UNION vs UNION ALL, set logic",
          "CASE WHEN for business segmentation and bucketing",
        ],
      },
      {
        heading: "Advanced",
        items: [
          "Subqueries: scalar, correlated, and in FROM / WHERE",
          "Common Table Expressions and recursive CTEs",
          "Window functions: ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, LEAD, running totals, moving averages",
          "Date functions, cohort logic, retention and funnel queries in pure SQL",
          "Views, indexes, query performance basics, EXPLAIN plans",
          "Writing analyst-grade, readable, reusable SQL",
        ],
      },
    ],
  },
  {
    id: "stats",
    hue: "#B8860B",
    name: "Statistics for Analytics",
    summary: "Applied, not academic",
    groups: [
      {
        heading: "What you’ll cover",
        items: [
          "Descriptive statistics: mean, median, mode, variance, standard deviation, IQR",
          "Distributions: normal, skewed, binomial, Poisson — and what each implies",
          "Probability essentials, conditional probability, Bayes intuition",
          "Sampling, sampling bias, central limit theorem, standard error",
          "Confidence intervals and margin of error",
          "Hypothesis testing: null vs alternative, p-values, significance, Type I/II errors",
          "t-tests, chi-square, ANOVA — when to use which",
          "Correlation vs causation, and how not to embarrass yourself in a meeting",
          "Linear and logistic regression: fitting, reading coefficients, R², assumptions",
          "A/B testing end to end: designing, sizing, running and reading a test",
        ],
      },
    ],
  },
  {
    id: "python",
    hue: "#7B3FE4",
    name: "Python for Data Analytics",
    summary: "Beginner → Advanced · no prior coding needed",
    groups: [
      {
        heading: "Python foundations",
        items: [
          "Setup: Anaconda, Jupyter, VS Code, virtual environments",
          "Variables, data types, operators, strings",
          "Lists, tuples, dictionaries, sets",
          "Conditionals, for / while loops, comprehensions",
          "Functions, arguments, scope, lambda, map / filter",
          "Error handling, file I/O, modules and packages",
          "Light OOP: classes and objects, enough to read real code",
        ],
      },
      {
        heading: "The analytics stack",
        items: [
          "NumPy — arrays, vectorised math, broadcasting, random sampling",
          "Pandas — Series and DataFrames, groupby, merge, pivot, time series, missing data, the full cleaning workflow",
          "Matplotlib — figures, axes, subplots, full customisation",
          "Seaborn — statistical plots, distributions, heatmaps, pairplots",
          "Plotly — interactive charts and dashboards",
          "SciPy and Statsmodels — statistical tests, regression, diagnostics",
          "Scikit-learn — train/test split, regression, clustering, evaluation metrics",
          "openpyxl / xlsxwriter — automating Excel reports with Python",
          "requests / BeautifulSoup — collecting data from the web",
          "SQLAlchemy — querying databases directly from Python",
        ],
      },
      {
        heading: "Advanced applied Python",
        items: [
          "Full EDA workflow: profiling → cleaning → feature creation → insight",
          "Messy real data: duplicates, outliers, inconsistent categories, bad dates",
          "Automating a recurring report end to end",
          "Writing clean, reusable analysis code and documenting it on GitHub",
        ],
      },
    ],
  },
  {
    id: "powerbi",
    hue: "#D97706",
    name: "Power BI",
    summary: "Model, measure, publish",
    groups: [
      {
        heading: "What you’ll cover",
        items: [
          "Power BI Desktop tour, data connectors, import vs DirectQuery",
          "Power Query in Power BI: transformations, custom columns, parameters",
          "Data modelling: star schema, fact vs dimension tables, relationships, cardinality",
          "DAX from zero: calculated columns vs measures, CALCULATE, FILTER, ALL, SUMX, iterators",
          "Time intelligence: YTD, MTD, YoY growth, rolling averages",
          "Visual design: choosing the right chart, formatting, themes, accessibility",
          "Interactivity: slicers, drill-through, bookmarks, tooltips, cross-filtering",
          "Row-level security, publishing, workspaces, scheduled refresh",
          "Building an executive-grade dashboard someone would actually use",
        ],
      },
    ],
  },
  {
    id: "storytelling",
    hue: "#C6394A",
    name: "Data Storytelling & Communication",
    summary: "Turning a number into a decision",
    groups: [
      {
        heading: "What you’ll cover",
        items: [
          "The analyst’s core job: turning a number into a decision",
          "Structuring an insight: Situation → Complication → Question → Answer",
          "Choosing the right chart for the right message, and the charts to never use",
          "Designing for clarity: pre-attentive attributes, colour, hierarchy, decluttering",
          "Writing an executive summary a busy manager reads in 30 seconds",
          "Building a stakeholder presentation deck from an analysis",
          "Presenting live, handling pushback, defending your numbers",
          "Live practice: every major project ends with you presenting your findings",
        ],
      },
    ],
  },
  {
    id: "business",
    hue: "#8B5E3C",
    name: "Business Fundamentals for Analysts",
    summary: "So your analysis answers the real question",
    groups: [
      {
        heading: "What you’ll cover",
        items: [
          "How a business actually makes money: revenue, cost, margin, unit economics",
          "Core metric families: acquisition, activation, retention, referral, revenue",
          "Funnels, conversion rates, drop-off analysis",
          "Cohorts, churn, retention curves, lifetime value and CAC",
          "Domain crash courses: e-commerce, SaaS, retail, fintech, marketing",
          "Reading a P&L, understanding KPIs vs vanity metrics",
          "Translating a vague business request into an answerable data question",
        ],
      },
    ],
  },
];

export const MINI_PROJECTS = [
  {
    title: "Excel Sales Performance Dashboard",
    body: "Clean a messy multi-sheet sales export, model it with Power Query, and build a refreshable interactive dashboard with pivots, slicers and KPI cards.",
    skills: "Excel · Power Query · dashboard design",
  },
  {
    title: "SQL E-Commerce Deep Dive",
    body: "Query a multi-table order database to answer real questions: top products, repeat-purchase rate, category-wise growth, customer segments.",
    skills: "Joins · aggregations · CTEs · window functions",
  },
  {
    title: "Python Exploratory Data Analysis",
    body: "Take a raw, dirty dataset and run a complete EDA in Pandas — cleaning, univariate and bivariate analysis, visual storytelling, written findings.",
    skills: "Pandas · Matplotlib · Seaborn · statistics",
  },
];

export const MAJOR_PROJECTS = [
  {
    title: "Retail Revenue Intelligence",
    body: "Pull data with SQL, clean and model it in Excel and Power Query, build a management dashboard, then present three revenue recommendations backed by data.",
    deliverable: "Dashboard + one-page insight memo",
  },
  {
    title: "Customer Churn & Retention Analysis",
    body: "Analyse a subscription business in Python: build cohorts, calculate retention curves and churn drivers, run hypothesis tests, model churn with logistic regression, and quantify revenue at risk.",
    deliverable: "Jupyter notebook on GitHub + executive summary",
  },
  {
    title: "Executive Power BI Dashboard",
    body: "Design a full star-schema model and build a multi-page report with DAX measures, time intelligence, drill-throughs and row-level security — the kind a leadership team reviews weekly.",
    deliverable: "Published .pbix + walkthrough video",
  },
  {
    title: "Capstone: Full-Stack Business Case",
    body: "An open-ended business problem and a raw dataset. You scope the question, extract with SQL, analyse in Python, visualise in Power BI, and present your recommendation live to the cohort.",
    deliverable: "Complete case study — the centrepiece of your portfolio",
  },
];

export const CAREER_BLOCKS = [
  {
    icon: "person_search",
    title: "LinkedIn Optimization",
    items: [
      "Headline, About section and banner that make recruiters stop scrolling",
      "Keyword strategy so you actually appear in recruiter searches",
      "Featured section built around your seven projects",
      "A posting routine that builds visibility without feeling cringe",
      "Connecting with hiring managers — what to say, and what never to say",
    ],
  },
  {
    icon: "description",
    title: "Resume Building",
    items: [
      "ATS-friendly formatting that doesn’t get auto-rejected",
      "Writing bullets as impact, not responsibility, with the exact formula",
      "Framing projects as work experience when you have none",
      "Tailoring one master resume into role-specific versions in ten minutes",
      "Live review — you leave with a finished, checked resume",
    ],
  },
  {
    icon: "send",
    title: "Job Application System",
    items: [
      "Where the real analyst jobs are posted, and where effort is wasted",
      "Naukri, LinkedIn, AngelList, company career pages, referral routes",
      "How many to apply to, how to track them, how to follow up",
      "Writing a cold message that actually gets a reply",
      "Building a referral network from zero",
    ],
  },
  {
    icon: "record_voice_over",
    title: "Interview Preparation",
    items: [
      "The four rounds: screening, SQL/Excel test, case study, HR",
      "100+ practice questions across SQL, Excel, Python, stats and Power BI",
      "Case study and guesstimate frameworks",
      "How to present your capstone in under three minutes",
      "Mock interview practice with feedback",
      "Salary negotiation basics for first and second jobs",
    ],
  },
];

export const INCLUDED = [
  "16 live weekend sessions across 8 weeks",
  "Lifetime access to all recordings",
  "7 portfolio projects (3 mini + 4 major)",
  "All datasets, code files, templates and cheat sheets",
  "Live doubt-solving every weekend",
  "Private community access",
  "LinkedIn and resume review",
  "Mock interview practice",
  "Interview question bank",
  "Certificate of completion",
];

export const COMPARISON = {
  columns: [
    "Large ed-tech bootcamps",
    "University-linked programs",
    "Offline institutes",
    "Self-paced video",
  ],
  rows: [
    { label: "Typical fee", ours: "₹2,999", others: ["₹50,000 – ₹1,50,000", "₹1,50,000 – ₹4,00,000", "₹20,000 – ₹1,20,000", "₹500 – ₹8,000"] },
    { label: "Duration", ours: "2 months", others: ["6 – 13 months", "10 – 14 months", "2 – 9 months", "Self-paced"] },
    { label: "Live classes", ours: "Every Sat & Sun", others: ["Usually yes", "Yes", "Yes", "No"] },
    { label: "Doubt solving", ours: "Live, direct, weekly", others: ["Ticket / TA-based", "Ticket-based", "In person", "Forum only"] },
    { label: "Batch size", ours: "Small, personal", others: ["100+ per cohort", "Large", "Medium", "Unlimited"] },
    { label: "Excel + SQL + Python + Power BI", ours: "All four, in depth", others: ["Usually", "Usually", "Varies", "Fragmented"] },
    { label: "Statistics", ours: "Yes, applied", others: ["Yes", "Yes", "Often light", "Rare"] },
    { label: "Business fundamentals", ours: "Dedicated track", others: ["Sometimes", "Yes", "Rare", "Rare"] },
    { label: "Data storytelling", ours: "Dedicated track", others: ["Sometimes", "Sometimes", "Rare", "Rare"] },
    { label: "Major projects", ours: "4 major + 3 mini", others: ["2 – 4", "3 – 5", "1 – 2", "0 – 1"] },
    { label: "Resume + LinkedIn help", ours: "Yes, live sessions", others: ["Yes", "Yes", "Rare", "No"] },
    { label: "Interview prep", ours: "Yes + mock interviews", others: ["Yes", "Yes", "Rare", "No"] },
    { label: "Recordings", ours: "Lifetime access", others: ["Limited period", "Limited period", "Usually none", "Yes"] },
    { label: "Loan or EMI needed", ours: "No — one payment", others: ["Usually EMI", "Usually loan", "Sometimes", "No"] },
  ],
};

export const FAQS = [
  {
    q: "Do I need a coding or maths background?",
    a: "No. The Python track starts from print(\"hello\") and the statistics track assumes nothing beyond school level. Roughly half of every batch comes from a non-technical background.",
  },
  {
    q: "I have a full-time job. Can I manage this?",
    a: "That is exactly who the weekend format is built for. Live classes run Saturday and Sunday, with about four to six hours of practice spread across the week. Everything is recorded.",
  },
  {
    q: "What if I miss a live session?",
    a: "The recording is uploaded the same day, and you can bring your doubts to the next Sunday lab.",
  },
  {
    q: "Is there a certificate?",
    a: "Yes, a certificate of completion. But be clear-eyed: employers hire on the strength of your projects and your interview, not a certificate. That is why seven projects are built into this program.",
  },
  {
    q: "Will I get a job after this?",
    a: "Nobody can honestly promise you a job. What this program gives you is the complete skill stack, a real portfolio, an optimised profile and structured interview preparation. The applications and interviews are yours to do — and you will know exactly how to do them.",
  },
  {
    q: "What software do I need?",
    a: "A laptop with at least 8GB RAM. Excel or Google Sheets, MySQL or PostgreSQL, Anaconda for Python, and Power BI Desktop — all free or already on your machine. Setup is covered in week one.",
  },
  {
    q: "Is Power BI available on Mac?",
    a: "Power BI Desktop is Windows-only. Mac users are shown the standard workarounds — the browser-based Power BI Service, or a Windows VM — during setup week.",
  },
  {
    q: "Are there any additional charges?",
    a: "None. ₹2,999 covers the entire program, all materials, all recordings and all career sessions.",
  },
];
