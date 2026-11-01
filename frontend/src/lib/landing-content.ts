// ============================================================
// Data Analyst programme — page content
//
// Everything editable lives here so the page component stays layout only.
// The BATCH block is the one thing you must keep current.
// ============================================================

export const BATCH = {
  // No fixed start date is advertised while enrolment is rolling. Put the
  // date back in both fields together when the next cohort is announced —
  // startDateIso feeds schema.org and must stay in step with startDate.
  month: "August",
  startDate: "",
  startDateIso: "",
  // The advertised close date. enrolmentCloseIso feeds schema.org and must
  // stay in step with enrolmentNote.
  enrolmentNote: "Enrollments close 10 November",
  enrolmentCloseIso: "2026-11-10",
  timing: "Sat & Sun, 10:00 AM – 1:00 PM IST",
  language: "Hindi + English",
  whatsapp: "+91 63667 35759",
  whatsappLink: "https://wa.me/916366735759",
  email: "support@insightnest.in",
};

export const PRICE = { now: 2999, was: 4999 };

/** Headline numbers. Keep these defensible — they are advertising claims. */
export const STATS = [
  { value: "900+", label: "Students taught" },
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
    body: "You finish with no resume, no positioning, no interview practice.",
  },
];

export const DIFFERENTIATORS = [
  {
    icon: "sensors",
    title: "Live every Saturday & Sunday",
    body: "You are in the room while the project gets built. Ask a question, get an answer.",
  },
  {
    icon: "workspace_premium",
    title: "Projects are the curriculum",
    body: "3 mini and 4 major projects. Every tool is taught inside a real business problem.",
  },
  {
    icon: "insights",
    title: "Business fundamentals baked in",
    body: "Revenue, retention, funnels, cohorts and margins, so your analysis answers a business question.",
  },
  {
    icon: "rocket_launch",
    title: "Career support is part of the program",
    body: "LinkedIn, resume, applications and interview prep, as live sessions rather than a PDF.",
  },
];

export const AUDIENCE_YES = [
  "A fresher or final-year student who needs a portfolio",
  "A working professional in ops, sales, finance or HR moving into data",
  "A non-tech learner who thinks coding isn’t for them",
  "Someone who tried self-learning, stalled, and needs structure",
  "An analyst stuck in Excel who wants SQL, Python and Power BI",
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
    summary: "Beginner to advanced",
    groups: [
      {
        heading: "Foundations",
        items: [
          "Spreadsheet anatomy, data types, cell referencing",
          "Data validation, protecting sheets, entry discipline",
          "Sorting, multi-level filtering, conditional formatting",
        ],
      },
      {
        heading: "Core analysis",
        items: [
          "IF, IFS, SUMIF(S), COUNTIF(S), AVERAGEIF(S)",
          "VLOOKUP, HLOOKUP, INDEX + MATCH, XLOOKUP",
          "Text functions: LEFT, RIGHT, MID, TRIM, CONCAT",
          "Date logic: DATEDIF, EOMONTH, NETWORKDAYS, WEEKDAY",
          "Error handling and formula auditing",
        ],
      },
      {
        heading: "Advanced",
        items: [
          "Pivot Tables and Charts, slicers, calculated fields",
          "Power Query: import, clean, merge, refreshable pipelines",
          "Power Pivot, data modelling, intro to DAX measures",
          "Dynamic arrays: FILTER, SORT, UNIQUE, SEQUENCE",
          "What-if analysis: Goal Seek, Scenario Manager",
          "Building an interactive dashboard from scratch",
          "Google Sheets: QUERY, IMPORTRANGE, ARRAYFORMULA",
        ],
      },
    ],
  },
  {
    id: "business",
    hue: "#8B5E3C",
    name: "Business Fundamentals for Analysts",
    summary: "The context behind the numbers",
    groups: [
      {
        heading: "What you cover",
        items: [
          "How a business makes money: revenue, cost, margin, unit economics",
          "Core metric families: acquisition, activation, retention, revenue",
          "Funnels, conversion rates, drop-off analysis",
          "Cohorts, churn, retention curves, lifetime value and CAC",
          "Domain crash courses: e-commerce, SaaS, retail, fintech",
          "Reading a P&L, KPIs vs vanity metrics",
          "Turning a vague business request into an answerable question",
        ],
      },
    ],
  },
  {
    id: "storytelling",
    hue: "#C6394A",
    name: "Data Storytelling & Communication",
    summary: "Presenting findings that land",
    groups: [
      {
        heading: "What you cover",
        items: [
          "Structuring an insight: situation, complication, question, answer",
          "Choosing the right chart for the message",
          "Designing for clarity: colour, hierarchy, decluttering",
          "Writing an executive summary a manager reads in 30 seconds",
          "Building a stakeholder presentation from an analysis",
          "Presenting live, handling pushback, defending your numbers",
          "Every major project ends with you presenting your findings",
        ],
      },
    ],
  },
  {
    id: "python",
    hue: "#7B3FE4",
    name: "Python for Data Analytics",
    summary: "No prior coding needed",
    groups: [
      {
        heading: "Foundations",
        items: [
          "Setup: Anaconda and Jupyter",
          "Variables, data types, operators, strings",
          "Lists, dictionaries, tuples, sets",
          "Conditionals, loops, comprehensions",
          "Functions, arguments, lambda",
          "Error handling and file I/O",
        ],
      },
      {
        heading: "The analytics stack",
        items: [
          "NumPy: arrays, vectorised math, broadcasting",
          "Pandas: DataFrames, groupby, merge, pivot, time series, cleaning",
          "Matplotlib: figures, axes, subplots",
          "Seaborn: distributions, heatmaps, statistical plots",
          "SciPy and Statsmodels: tests and regressions",
          "openpyxl and xlsxwriter: automating Excel reports",
          "SQLAlchemy: querying databases from Python",
        ],
      },
      {
        heading: "Applied",
        items: [
          "Full EDA workflow: profiling, cleaning, feature creation, insight",
          "Messy real data: duplicates, outliers, bad dates",
          "Automating a recurring report, documented on GitHub",
        ],
      },
    ],
  },
  {
    id: "sql",
    hue: "#2E56E8",
    name: "SQL",
    summary: "Beginner to advanced",
    groups: [
      {
        heading: "Foundations",
        items: [
          "How databases think: tables, rows, keys, relationships",
          "SELECT, WHERE, ORDER BY, LIMIT, DISTINCT, plus LIKE, IN, BETWEEN and NULL handling",
        ],
      },
      {
        heading: "Core querying",
        items: [
          "Aggregations: GROUP BY, HAVING, COUNT, SUM, AVG, MIN, MAX",
          "Joins: INNER, LEFT, SELF",
          "UNION vs UNION ALL",
          "CASE WHEN for segmentation and bucketing",
        ],
      },
      {
        heading: "Advanced",
        items: [
          "Subqueries: scalar and correlated",
          "CTEs for readable, layered queries",
          "Window functions: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, running totals",
          "Date functions, cohort and retention logic",
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
        heading: "What you cover",
        items: [
          "Power BI Desktop, data connectors, import vs DirectQuery",
          "Power Query: transformations, custom columns, parameters",
          "Data modelling: star schema, fact and dimension tables, relationships",
          "DAX from zero: measures, CALCULATE, FILTER, ALL, SUMX",
          "Time intelligence: YTD, MTD, YoY growth, rolling averages",
          "Visual design: choosing the right chart, formatting, themes",
          "Interactivity: slicers, drill-through, bookmarks, tooltips",
          "Row-level security, publishing, workspaces, scheduled refresh",
          "Building an executive-grade dashboard",
        ],
      },
    ],
  },
  {
    id: "stats",
    hue: "#B8860B",
    name: "Statistics for Analytics",
    summary: "The maths you actually use",
    groups: [
      {
        heading: "What you cover",
        items: [
          "Descriptive statistics: mean, median, mode, variance, standard deviation, IQR",
          "Distributions: normal and skewed, and what shape tells you about the data",
          "Probability essentials and conditional probability",
          "Sampling, sampling bias, CLT, standard error, confidence intervals",
          "Hypothesis testing: null vs alternative, p-values, significance, Type I and II errors",
          "t-tests and chi-square: when to use which",
          "Correlation vs causation, and linear regression: coefficients and R-squared",
          "A/B testing end to end: design, sizing, running, reading",
        ],
      },
    ],
  },
];

export const MINI_PROJECTS = [
  {
    title: "Excel Sales Performance Dashboard",
    body: "Clean a messy multi-sheet sales export and build a refreshable dashboard with pivots, slicers and KPI cards.",
    skills: "Excel, Power Query, dashboard design",
  },
  {
    title: "SQL E-Commerce Deep Dive",
    body: "Query a multi-table order database for top products, repeat-purchase rate, growth and customer segments.",
    skills: "Joins, aggregations, CTEs, window functions",
  },
  {
    title: "Python Exploratory Data Analysis",
    body: "Run a complete EDA in Pandas: cleaning, analysis, visuals and written findings.",
    skills: "Pandas, Matplotlib, Seaborn, statistics",
  },
];

export const MAJOR_PROJECTS = [
  {
    title: "Retail Revenue Intelligence",
    body: "Pull data with SQL, model it in Power Query, build a dashboard, then present three revenue recommendations.",
    deliverable: "Dashboard + one-page insight memo",
  },
  {
    title: "Customer Churn & Retention Analysis",
    body: "Analyse a subscription business in Python: cohorts, retention curves, churn drivers and revenue at risk.",
    deliverable: "Jupyter notebook on GitHub + executive summary",
  },
  {
    title: "Executive Power BI Dashboard",
    body: "Build a star-schema model and a multi-page report with DAX measures, time intelligence and drill-throughs.",
    deliverable: "Published .pbix + walkthrough video",
  },
  {
    title: "Capstone: Full-Stack Business Case",
    body: "An open business problem and a raw dataset. Scope it, extract with SQL, analyse in Python, present live.",
    deliverable: "Complete case study, the centrepiece of your portfolio",
  },
];

export const CAREER_BLOCKS = [
  {
    icon: "person_search",
    title: "LinkedIn Optimization",
    items: [
      "Headline, About and banner that recruiters stop on",
      "Keywords so you appear in recruiter searches",
      "Featured section built around your seven projects",
      "A posting routine that builds visibility",
      "Approaching hiring managers: what to say, what not to",
    ],
  },
  {
    icon: "description",
    title: "Resume Building",
    items: [
      "ATS-friendly formatting that survives the filter",
      "Writing bullets as impact, not responsibility",
      "Framing projects as experience when you have none",
      "Tailoring one master resume per role in ten minutes",
      "Live review, so you leave with a finished resume",
    ],
  },
  {
    icon: "send",
    title: "Job Application System",
    items: [
      "Where analyst jobs are actually posted",
      "Naukri, LinkedIn, career pages and referral routes",
      "How many to apply to, how to track and follow up",
      "Writing a cold message that gets a reply",
      "Building a referral network from zero",
    ],
  },
  {
    icon: "record_voice_over",
    title: "Interview Preparation",
    items: [
      "The four rounds: screening, SQL test, case study, HR",
      "100+ practice questions across every tool",
      "Case study and guesstimate frameworks",
      "Presenting your capstone in under three minutes",
      "Mock interview practice with feedback",
      "Salary negotiation basics",
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
    a: "No. Python starts from print(\"hello\") and statistics assumes school level. Half of every batch is non-technical.",
  },
  {
    q: "I have a full-time job. Can I manage this?",
    a: "That is who the weekend format is built for. Classes run Sat and Sun, plus four to six hours of practice midweek. Everything is recorded.",
  },
  {
    q: "What if I miss a live session?",
    a: "The recording is uploaded the same day, and you can bring your doubts to the next Sunday lab.",
  },
  {
    q: "Is there a certificate?",
    a: "Yes. But employers hire on your projects and your interview, not a certificate. That is why seven projects are built in.",
  },
  {
    q: "Will I get a job after this?",
    a: "Nobody can honestly promise a job. You get the full skill stack, a real portfolio, an optimised profile and interview preparation. The applying is yours to do.",
  },
  {
    q: "What software do I need?",
    a: "A laptop with 8GB RAM. Excel or Sheets, MySQL or PostgreSQL, Anaconda and Power BI Desktop, all free. Setup is covered in week one.",
  },
  {
    q: "Is Power BI available on Mac?",
    a: "Power BI Desktop is Windows-only. Mac users are shown the workarounds, the browser-based Service or a Windows VM, in setup week.",
  },
  {
    q: "Are there any additional charges?",
    a: "None. ₹2,999 covers the entire program, all materials, all recordings and all career sessions.",
  },
];

export const PM_MODULES = [
  {
    title: "Introduction to Product Management",
    body: "Understand the role of a Product Manager and the complete product lifecycle. Learn the difference between Product, Project and Program Management. Explore B2B, B2C, SaaS and marketplace business models. Analyze how companies like Airbnb, Uber and Spotify build successful products.",
  },
  {
    title: "Product Strategy & Market Research",
    body: "Learn how to identify market opportunities and evaluate business potential. Master TAM, SAM, SOM, competitor analysis and market positioning. Explore product vision, business models and monetization strategies. Apply RICE, ICE and MoSCoW frameworks to prioritize product ideas.",
  },
  {
    title: "User Research & Problem Discovery",
    body: "Understand customer behaviour, needs, motivations and pain points. Learn user interviews, surveys, customer personas and Jobs To Be Done. Apply empathy mapping and customer journey mapping to identify problems. Translate customer insights into actionable product opportunities.",
  },
  {
    title: "Product Design & UX Fundamentals",
    body: "Learn the fundamentals of UI/UX and human-centred product design. Understand user flows, wireframing, information architecture and prototyping. Get hands-on experience with Figma to visualize product ideas. Learn usability testing and validate product experiences before development.",
  },
  {
    title: "PRD, Agile & Product Execution",
    body: "Learn to translate product ideas into structured Product Requirement Documents (PRDs). Master user stories, acceptance criteria, product roadmaps and feature prioritization. Understand Agile, Scrum, sprint planning and backlog management. Gain practical exposure to Jira and cross-functional product execution.",
  },
  {
    title: "Product Analytics & Metrics",
    body: "Learn to measure product performance using data-driven decision-making. Understand North Star Metrics, AARRR, DAU, MAU, CAC, LTV and churn. Explore conversion funnels, retention, cohort analysis and A/B testing. Use product analytics concepts to identify opportunities for product improvement.",
  },
  {
    title: "Growth, GTM & Product Launch",
    body: "Learn how to position, price and successfully launch a product in the market. Understand ICP, STP, Product-Led Growth and customer acquisition strategies. Explore onboarding, activation, retention and growth loops. Develop a practical Go-To-Market strategy for a real-world product.",
  },
  {
    title: "AI in Product Management & Capstone",
    body: "Discover how AI tools like ChatGPT can accelerate product research, documentation and decision-making. Use AI for competitor analysis, PRDs, user stories and product ideation. Apply your learning to develop an end-to-end product strategy. Present a capstone covering research, prototype, roadmap, metrics and launch strategy.",
  },
];

/** The two courses, shown side by side on the first screen. */
export const COURSES = [
  {
    tag: "Data & AI",
    icon: "query_stats",
    name: "Data Analytics with GenAI for Placement Bootcamp",
    summary: "Turn raw data into business decisions, from your first spreadsheet to a full capstone.",
    points: ["Excel, SQL, Python and Power BI", "Statistics and data storytelling", "Resume and interview prep"],
    enrollHref: "#pricing",
    curriculumHref: "#curriculum",
  },
  {
    tag: "Product & AI",
    icon: "rocket_launch",
    name: "Product Management with Generative AI",
    summary: "Learn to decide what gets built and why, from user research to a product launch.",
    points: ["Strategy and user research", "PRDs, Agile, Figma and Jira", "Metrics, launch and AI for PMs"],
    enrollHref: "/courses/product-management#enrollment",
    curriculumHref: "/courses/product-management#curriculum",
  },
];

/**
 * Why each skill is worth learning, and what the market pays.
 * Pay figures are approximate ranges from 2026 salary guides (checked Nov 2026):
 * weekday.works, guvi.in, masaischool.com, citing Glassdoor. Refresh them when
 * they age, and never present them as InsightNest student outcomes.
 */
export const CAREER_CASE = [
  {
    field: "Data Analytics",
    icon: "query_stats",
    why: [
      "Companies in every sector need people who can turn numbers into decisions.",
      "AI and big data lead the fastest-growing skills in the World Economic Forum’s Future of Jobs Report 2025.",
      "You can start from a non-technical background, beginning with Excel and SQL.",
    ],
    pay: [
      { level: "Freshers", range: "₹3–6 LPA" },
      { level: "National average", range: "About ₹6.5 LPA" },
      { level: "Senior analysts", range: "₹12–20 LPA" },
    ],
  },
  {
    field: "Product Management",
    icon: "rocket_launch",
    why: [
      "Product managers decide what gets built and bring design, engineering and business together.",
      "Experience in sales, operations, marketing or design carries over well into product work.",
      "AI now speeds up research, documentation and PRDs, so PMs who use it well can move faster.",
    ],
    pay: [
      { level: "Associate PM", range: "₹8–22 LPA" },
      { level: "Average PM", range: "About ₹22–25 LPA" },
      { level: "Senior PM", range: "₹35–60 LPA" },
    ],
    note: "Many PM roles ask for prior work experience, so freshers often need to start as an Associate PM or in a related role.",
  },
];
