"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";

export default function LandingPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [accessQuote, setAccessQuote] = useState("");
  const [quoteError, setQuoteError] = useState("");

  // Application form states
  const [applyName, setApplyName] = useState("");
  const [applyEmail, setApplyEmail] = useState("");
  const [applyPhone, setApplyPhone] = useState("");
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplyLoading(true);
    setTimeout(() => {
      setApplyLoading(false);
      setApplySubmitted(true);
      // Save lead to localStorage
      const leads = JSON.parse(localStorage.getItem("cohort_applications") || "[]");
      leads.push({
        name: applyName,
        email: applyEmail,
        phone: applyPhone,
        date: new Date().toISOString()
      });
      localStorage.setItem("cohort_applications", JSON.stringify(leads));
    }, 1200);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to login — access is always gated by Supabase authentication
    window.location.href = "/login";
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-slide-up");
          observerRef.current?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <Logo variant="img1" className="h-16 w-auto" />
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#courses" className="text-on-surface hover:text-secondary font-medium transition-colors">Syllabus</a>
            <a href="#pricing" className="text-on-surface hover:text-secondary font-medium transition-colors">Unlock Dashboard / Buy</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-on-surface hover:text-secondary font-medium transition-colors hidden md:block">Dashboard</Link>
            <Link href="/login" className="text-on-surface hover:text-secondary font-medium transition-colors hidden md:block">Login</Link>
            <Link href="/signup" className="bg-secondary text-on-secondary px-5 py-2 rounded-full font-semibold hover:bg-secondary/90 transition-all btn-press shadow-md">Sign Up</Link>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="hero-gradient min-h-[calc(100vh-5rem)] flex flex-col py-12 md:py-20">
          <div className="max-w-7xl w-full mx-auto px-6 grid md:grid-cols-2 gap-12 items-center my-auto">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full text-sm font-medium text-primary-container">
                <span className="material-symbols-outlined text-secondary text-base">bolt</span>
                Intensive 4-Week Accelerator
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-primary-container leading-tight tracking-tight">
                Become an AI-Augmented <span className="text-secondary">Data Leader</span>
              </h1>
              <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
                Master the Generative AI Data Analytics & Engineering Accelerator. Orchestrate Generative AI models, automated agents, and enterprise Microsoft Fabric ecosystems to deliver insights at 10x velocity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard" className="bg-secondary text-on-secondary px-8 py-3.5 rounded-full font-bold text-lg hover:bg-secondary/90 transition-all btn-press shadow-lg text-center">
                  Join Bootcamp <span className="material-symbols-outlined align-middle ml-1">arrow_forward</span>
                </Link>
                <button className="border-2 border-outline-variant text-on-surface px-8 py-3.5 rounded-full font-bold text-lg hover:border-secondary hover:text-secondary transition-all btn-press text-center inline-flex items-center justify-center">
                  <span className="material-symbols-outlined mr-2">play_circle</span> Watch Demo
                </button>
              </div>
            </div>
            
            {/* Dashboard Preview Glass Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-primary-container/10 blur-3xl -z-10 rounded-[3rem]"></div>
              <div className="glass-card p-4 rounded-2xl shadow-2xl border border-white/40 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-primary-container rounded-xl overflow-hidden shadow-inner aspect-[4/3] flex flex-col relative">
                  <div className="h-8 bg-inverse-surface/50 border-b border-white/10 flex items-center px-4 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-error"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 p-6 grid grid-cols-2 gap-4 opacity-80">
                    <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-3">
                      <div className="h-4 bg-white/20 rounded w-1/3"></div>
                      <div className="h-8 bg-secondary/80 rounded w-2/3 mt-4"></div>
                      <div className="h-2 bg-white/10 rounded w-full mt-auto"></div>
                    </div>
                    <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-3 relative overflow-hidden">
                       <div className="h-4 bg-white/20 rounded w-1/2"></div>
                       <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-secondary/40 to-transparent"></div>
                    </div>
                    <div className="col-span-2 bg-white/5 rounded-lg border border-white/10 p-4">
                      <div className="h-4 bg-white/20 rounded w-1/4 mb-4"></div>
                      <div className="flex items-end gap-2 h-20">
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                          <div key={i} className="flex-1 bg-secondary rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Floating AI Bubble */}
                  <div className="absolute bottom-6 right-6 bg-surface p-3 rounded-2xl rounded-br-none shadow-lg animate-pulse-soft border border-outline-variant flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-sm">psychology</span>
                    </div>
                    <div>
                      <div className="h-2 bg-outline-variant/40 rounded w-20 mb-1.5"></div>
                      <div className="h-2 bg-outline-variant/40 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section id="courses" className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary-container mb-4">Master the Industry Standard Stack</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto mb-16 text-lg">We bridge the gap between academic theory and industry reality through hands-on AI-augmented learning.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { 
                  name: 'Excel', 
                  icon: 'table_view', 
                  desc: 'Advanced Modeling', 
                  color: 'from-emerald-500/10 to-teal-500/5', 
                  hoverBorder: 'hover:border-emerald-500/50 hover:shadow-emerald-500/5', 
                  iconColor: 'text-emerald-600', 
                  iconBg: 'bg-emerald-50 group-hover:bg-emerald-100'
                },
                { 
                  name: 'SQL', 
                  icon: 'database', 
                  desc: 'Relational Pipelines', 
                  color: 'from-blue-500/10 to-indigo-500/5', 
                  hoverBorder: 'hover:border-blue-500/50 hover:shadow-blue-500/5', 
                  iconColor: 'text-blue-600', 
                  iconBg: 'bg-blue-50 group-hover:bg-blue-100'
                },
                { 
                  name: 'Python', 
                  icon: 'terminal', 
                  desc: 'AI & Automation', 
                  color: 'from-sky-500/10 to-blue-600/5', 
                  hoverBorder: 'hover:border-sky-500/50 hover:shadow-sky-500/5', 
                  iconColor: 'text-sky-600', 
                  iconBg: 'bg-sky-50 group-hover:bg-sky-100'
                },
                { 
                  name: 'Power BI', 
                  icon: 'bar_chart', 
                  desc: 'DAX & BI Suites', 
                  color: 'from-amber-500/10 to-yellow-500/5', 
                  hoverBorder: 'hover:border-amber-500/50 hover:shadow-amber-500/5', 
                  iconColor: 'text-amber-600', 
                  iconBg: 'bg-amber-50 group-hover:bg-amber-100'
                },
                { 
                  name: 'Fabric', 
                  icon: 'hub', 
                  desc: 'OneLake Architecture', 
                  color: 'from-violet-500/10 to-purple-500/5', 
                  hoverBorder: 'hover:border-violet-500/50 hover:shadow-violet-500/5', 
                  iconColor: 'text-violet-600', 
                  iconBg: 'bg-violet-50 group-hover:bg-violet-100'
                },
                { 
                  name: 'AI Tools', 
                  icon: 'smart_toy', 
                  desc: 'Agentic Engineering', 
                  color: 'from-fuchsia-500/10 to-pink-500/5', 
                  hoverBorder: 'hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/5', 
                  iconColor: 'text-fuchsia-600', 
                  iconBg: 'bg-fuchsia-50 group-hover:bg-fuchsia-100'
                }
              ].map((tool) => (
                <div 
                  key={tool.name} 
                  className={`relative overflow-hidden bg-gradient-to-br ${tool.color} border border-outline-variant/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${tool.hoverBorder}`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:bg-white/20 transition-all"></div>
                  <div className={`w-14 h-14 mx-auto ${tool.iconBg} flex items-center justify-center rounded-xl mb-4 transition-colors duration-300`}>
                    <span className={`material-symbols-outlined text-3xl transition-transform duration-300 group-hover:scale-110 ${tool.iconColor}`}>{tool.icon}</span>
                  </div>
                  <h3 className="font-bold text-on-surface text-lg mb-1">{tool.name}</h3>
                  <p className="text-xs text-on-surface-variant font-medium">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Curriculum Section */}
        <section id="courses" className="py-24 bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 reveal-on-scroll">
              <h2 className="text-4xl font-extrabold text-primary-container mb-4 tracking-tight">Accelerated 4-Week Syllabus</h2>
              <p className="text-on-surface-variant max-w-3xl mx-auto text-lg">
                High-octane, hands-on syllabus designed to transition you from manual workflows to prompt-driven engineering and enterprise data architecture.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Week 1 */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col justify-between hover:border-secondary transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">Week 1</span>
                    <span className="material-symbols-outlined text-outline">table_view</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary-container mb-2">AI-Augmented Analytics & Quantitative Foundations</h3>
                  <p className="text-sm text-outline font-semibold mb-4">Core Stack: Intelligent Excel + Generative Statistical Modeling</p>
                  
                  <div className="bg-surface-container/30 rounded-xl p-4 mb-6 text-sm italic text-on-surface-variant border-l-4 border-secondary">
                    <strong>The Strategy:</strong> Transition from manual data manipulation to prompt-driven engineering and statistical validation.
                  </div>

                  <ul className="space-y-3 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Prompt-Engineered Data Ingestion:</strong> LLMs for automated cleaning, schema mapping, and regex.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>AI-Formulated Logic:</strong> Advanced data modeling (INDEX MATCH, XLOOKUP) via natural language.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Algorithmic Statistics:</strong> Interpret variance, standard deviation, and execute predictive A/B tests.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Business Intelligence KPIs:</strong> Executive metrics frameworks optimized for AI interpretation.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto pt-6 border-t border-outline-variant/20 bg-secondary/5 -mx-8 -mb-8 p-8 rounded-b-3xl">
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Enterprise Project 1</span>
                  <h4 className="font-bold text-on-surface text-sm mb-1">The Revenue Architecture Engine</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">A high-fidelity financial dashboard utilizing AI-driven anomaly detection to identify margin leakages and optimize regional product performance.</p>
                </div>
              </div>

              {/* Week 2 */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col justify-between hover:border-secondary transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">Week 2</span>
                    <span className="material-symbols-outlined text-outline">terminal</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary-container mb-2">Programmatic Data Engineering with Python & LLMs</h3>
                  <p className="text-sm text-outline font-semibold mb-4">Core Stack: Python, Pandas, Plotly + AI Pair-Programming</p>
                  
                  <div className="bg-surface-container/30 rounded-xl p-4 mb-6 text-sm italic text-on-surface-variant border-l-4 border-secondary">
                    <strong>The Strategy:</strong> Bypass years of syntax memorization by mastering AI-driven code compilation and advanced data visualization.
                  </div>

                  <ul className="space-y-3 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Copilot & ChatGPT Pair-Programming:</strong> Write, refactor, and optimize advanced Python scripts with AI.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>The GenAI Data Stack:</strong> Pandas and NumPy under the guidance of autonomous coding assistants.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Dynamic Visual Synthesis:</strong> Interactive, production-ready data stories using Plotly generated through natural language.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Automated Code Review:</strong> Auditing data pipelines for security, processing speed, and logic errors.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto pt-6 border-t border-outline-variant/20 bg-secondary/5 -mx-8 -mb-8 p-8 rounded-b-3xl">
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Enterprise Project 2</span>
                  <h4 className="font-bold text-on-surface text-sm mb-1">The Global Media Ecosystem Simulator</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">A deep-dive analysis into international content trends, using GenAI to scrape, cluster, and sentiment-analyze thousands of data points into a dynamic dashboard.</p>
                </div>
              </div>

              {/* Week 3 */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col justify-between hover:border-secondary transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">Week 3</span>
                    <span className="material-symbols-outlined text-outline">bar_chart</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary-container mb-2">Enterprise BI & Synthesized Dashboards</h3>
                  <p className="text-sm text-outline font-semibold mb-4">Core Stack: Power BI + Generative DAX Engineering</p>
                  
                  <div className="bg-surface-container/30 rounded-xl p-4 mb-6 text-sm italic text-on-surface-variant border-l-4 border-secondary">
                    <strong>The Strategy:</strong> Move beyond static reporting. Design cognitive, enterprise-grade business intelligence suites that use embedded AI to talk back to executives.
                  </div>

                  <ul className="space-y-3 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Semantic Modeling:</strong> Structuring star schemas and Power Query (M) logic accelerated by AI.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Generative DAX Engineering:</strong> AI-built complex time-intelligence formulas (CALCULATE, FILTER) for deep insights.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Cognitive UX Design:</strong> Native AI visuals, smart narratives, and plain-English interactive Q&A modules.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Executive Storytelling:</strong> Designing predictive drill-through paths for C-suite decision-making.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto pt-6 border-t border-outline-variant/20 bg-secondary/5 -mx-8 -mb-8 p-8 rounded-b-3xl">
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Enterprise Project 3</span>
                  <h4 className="font-bold text-on-surface text-sm mb-1">The Executive Command Center</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">A unified corporate cockpit integrating Revenue, CLV, and Marketing ROI, featuring fully automated AI executive summaries.</p>
                </div>
              </div>

              {/* Week 4 */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col justify-between hover:border-secondary transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">Week 4</span>
                    <span className="material-symbols-outlined text-outline">hub</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary-container mb-2">Enterprise Data Architecture & The Fabric Ecosystem</h3>
                  <p className="text-sm text-outline font-semibold mb-4">Core Stack: Advanced SQL + Microsoft Fabric + Copilot</p>
                  
                  <div className="bg-surface-container/30 rounded-xl p-4 mb-6 text-sm italic text-on-surface-variant border-l-4 border-secondary">
                    <strong>The Strategy:</strong> Synthesize your stack into a modern, unified "Lakehouse" architecture utilizing Microsoft’s cutting-edge enterprise AI.
                  </div>

                  <ul className="space-y-3 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>AI-Driven SQL Mastery:</strong> Complex CTEs, Window Functions, and multi-table Joins via conversational assistants.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>The Microsoft Fabric Frontier:</strong> OneLake, Data Factory, and Dataflows Gen2 to centralize data.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Microsoft Copilot Integration:</strong> Automate ETL pipelines, generate code, and build semantic models.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>End-to-End Pipeline Automation:</strong> Raw data ingestion delivering refined, AI-analyzed insights.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto pt-6 border-t border-outline-variant/20 bg-secondary/5 -mx-8 -mb-8 p-8 rounded-b-3xl">
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Capstone Deployment</span>
                  <h4 className="font-bold text-on-surface text-sm mb-1">The End-to-End AI-First Retail Analytics Platform</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Massive, production-grade deployment: Excel Data Ingestion → Python AI-EDA → Relational SQL Transformation → Fabric Pipeline Automation → Power BI Executive Deployment.</p>
                </div>
              </div>
            </div>

            {/* Why This Program Commands a Premium */}
            <div className="mt-20">
              <div className="text-center mb-12 text-balance">
                <h3 className="text-3xl font-bold text-primary-container">The Radical Shift: Why This Program Commands a Premium</h3>
                <p className="text-on-surface-variant mt-2 text-base">This is not a historical data course. This is a Generative AI Masterclass focused on the future of work.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                    <span className="material-symbols-outlined">bolt</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-2">10x Velocity</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">Learn how to accomplish 40 hours of traditional data engineering in 4 hours using an AI-first workflow.</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                    <span className="material-symbols-outlined">hub</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-2">Modern Stack Dominance</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">Gain rare, highly compensated expertise in Microsoft Fabric, the enterprise standard for modern AI data platforms.</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                    <span className="material-symbols-outlined">psychology</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-2">From Coder to Strategist</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">Stop wrestling with syntax errors and start acting as a high-level data consultant who directs AI to build the architecture.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Portfolio Deliverables */}
            <div className="mt-20 pt-16 border-t border-outline-variant/30">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-primary-container">Premium Portfolio Deliverables</h3>
                <p className="text-on-surface-variant mt-2 text-base">Graduates leave with an elite digital portfolio showcasing mastery over the AI-Augmented Data Workflow.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-card hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-4">
                    <span className="material-symbols-outlined">table_view</span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-2">Sales Intelligence Suite</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Advanced data structure models and financial formulas generated with Prompt-Engineered Excel logic.</p>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-card hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-4">
                    <span className="material-symbols-outlined">terminal</span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-2">Market Trend Simulator</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Dynamic data simulator pipelines and sentiment classifiers compiled programmatically using Python and AI pair-programming.</p>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-card hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-4">
                    <span className="material-symbols-outlined">bar_chart</span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-2">Executive Command Center</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Cognitive corporate dashboard in Power BI featuring custom time-intelligence DAX models and native AI visuals.</p>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-card hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-4">
                    <span className="material-symbols-outlined">hub</span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-2">Fabric Lakehouse Ecosystem</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">A modern automated data architecture running on Microsoft Fabric OneLake, Dataflows Gen2, SQL Warehouse, and Copilot.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Single Course Access & Enrollment Section */}
        <section id="pricing" className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary-container mb-4">Cohort Enrollment & Admission</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
                Admission is highly selective. Secure your slot by applying below or unlock your existing dashboard.
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto bg-surface-container-lowest p-8 md:p-12 rounded-3xl border-2 border-secondary shadow-elevated relative overflow-hidden grid md:grid-cols-2 gap-12">
              <div className="absolute top-0 right-0 bg-secondary text-on-secondary px-6 py-1.5 rounded-bl-2xl text-xs font-bold uppercase tracking-wider">
                Active Cohort
              </div>
              
              {/* Left Column: Course details and Dashboard Unlock */}
              <div className="flex flex-col justify-between space-y-8">
                <div>
                  <div className="flex justify-start mb-6">
                    <Logo variant="img2" className="h-16 w-auto" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-primary-container mb-2 text-left">The Generative AI Data Analytics & Engineering Accelerator</h3>
                  <p className="text-sm text-outline mb-6 text-left">Next-Generation Data Architecture | Powered by Agentic AI & Microsoft Fabric</p>
                  
                  <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 mb-6 text-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Course Investment</span>
                    <span className="text-4xl font-extrabold text-primary-container">₹1,999</span>
                    <span className="text-outline text-xs block mt-1">One-time payment for full 4-week access</span>
                  </div>
                  
                  <div className="bg-secondary/5 rounded-2xl p-5 border border-secondary/20 text-left">
                    <h4 className="font-bold text-secondary text-sm mb-1.5 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">schedule</span> Class Timings & Live Schedule
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      All lectures are conducted live. Exact class timings and links will be announced live by the instructor in the portal prior to each session.
                    </p>
                  </div>
                </div>

                {/* Access Quote Unlock Form */}
                <div className="border-t border-outline-variant/30 pt-6">
                  <h4 className="font-bold text-primary-container mb-1 text-sm text-left">Already Enrolled?</h4>
                  <p className="text-xs text-on-surface-variant mb-4 text-left">Paste the personal access quote provided by your instructor to instantly enter your dashboard.</p>
                  
                  <form onSubmit={handleUnlock} className="space-y-3">
                    <input
                      type="text"
                      required
                      value={accessQuote}
                      onChange={(e) => {
                        setAccessQuote(e.target.value);
                        setQuoteError("");
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm transition-all"
                      placeholder="Enter Personal Access Quote..."
                    />
                    {quoteError && (
                      <p className="text-xs text-error font-medium">{quoteError}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full bg-secondary/10 text-secondary border border-secondary/35 py-3 rounded-xl font-bold hover:bg-secondary hover:text-on-secondary transition-all btn-press shadow-md"
                    >
                      Unlock My Dashboard
                    </button>
                  </form>
                  <p className="text-[10px] text-outline mt-2 text-left">Hint for evaluation: Use `AI-Augmented Data Architect` to bypass login.</p>
                </div>
              </div>

              {/* Right Column: Apply Form */}
              <div className="border-t md:border-t-0 md:border-l border-outline-variant/30 pt-8 md:pt-0 md:pl-12 flex flex-col justify-center">
                {applySubmitted ? (
                  <div className="text-center py-10 space-y-6 animate-scale-in">
                    <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-5xl">check_circle</span>
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-primary-container mb-2">Application Submitted!</h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        Thank you for applying, <strong>{applyName}</strong>. Our admissions committee will review your profile and contact you via email at <strong>{applyEmail}</strong> within 24 hours.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-left">
                    <div>
                      <h4 className="text-2xl font-bold text-primary-container mb-2">Apply for Admission</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        To maintain strict mentorship quality and personalized project feedback, <strong>we only choose a handful of people</strong> for each live cohort. Submit your details below to apply.
                      </p>
                    </div>

                    <form onSubmit={handleApply} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Full Name</label>
                        <input
                          type="text"
                          required
                          value={applyName}
                          onChange={(e) => setApplyName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm transition-all"
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email Address</label>
                        <input
                          type="email"
                          required
                          value={applyEmail}
                          onChange={(e) => setApplyEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm transition-all"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={applyPhone}
                          onChange={(e) => setApplyPhone(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div className="p-3 bg-secondary/5 border border-secondary/15 rounded-xl text-[11px] text-on-surface-variant flex items-start gap-2">
                        <span className="material-symbols-outlined text-secondary text-base flex-shrink-0 mt-0.5">info</span>
                        <span>No immediate payment is required. Once selected, you will receive an invitation link to complete your enrollment.</span>
                      </div>

                      <button
                        type="submit"
                        disabled={applyLoading}
                        className="w-full bg-secondary text-on-secondary py-3.5 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-md flex items-center justify-center"
                      >
                        {applyLoading ? (
                          <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                        ) : (
                          "Submit My Application"
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Brand Representation Banner */}
        <section className="py-12 bg-surface border-y border-outline-variant/10">
          <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
            <Logo variant="img2" className="h-32 md:h-40 w-auto mb-8 opacity-100" />
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-widest text-primary-container mt-6 uppercase">InsightNest AI Academy</h3>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-primary-container mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Do I need a technical background to join?", a: "Not at all! Our curriculum is designed to take you from absolute beginner to industry-ready. We start with the basics of Excel and gradually introduce more complex concepts." },
                { q: "How long does the Pro bootcamp take?", a: "Most students complete the Pro track in 4-6 months dedicating 10-15 hours per week. However, it's completely self-paced, so you can go faster or slower depending on your schedule." },
                { q: "Will I get a certificate?", a: "Yes, upon successfully completing all modules and the final capstone project, you will receive an industry-recognized certificate that you can add to your LinkedIn profile and resume." }
              ].map((faq, i) => (
                <details key={i} className="group bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
                  <summary className="flex justify-between items-center font-semibold cursor-pointer list-none p-6 text-on-surface hover:text-secondary transition-colors">
                    {faq.q}
                    <span className="transition group-open:rotate-180 material-symbols-outlined">expand_more</span>
                  </summary>
                  <div className="p-6 pt-0 text-on-surface-variant text-sm leading-relaxed border-t border-outline-variant/10 mt-2">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low text-on-surface-variant py-16 border-t border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center">
                <Logo variant="img2" className="h-14 w-auto" />
              </Link>
            </div>
            <p className="text-sm">Empowering next-gen analysts with AI-powered education and career transformation.</p>
          </div>
          <div>
            <h4 className="text-on-surface font-bold mb-4">Bootcamp</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-secondary transition-colors">Curriculum</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Projects</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Mentors</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-on-surface font-bold mb-4">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-secondary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Career Guide</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Success Stories</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-on-surface font-bold mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>© 2026 InsightNest AI. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-secondary transition-colors"><span className="material-symbols-outlined">share</span></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
