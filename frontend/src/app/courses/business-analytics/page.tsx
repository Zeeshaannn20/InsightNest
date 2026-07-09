"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";

export default function BusinessAnalyticsCoursePage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Waitlist form state
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistLoading(true);
    setTimeout(() => {
      setWaitlistLoading(false);
      setWaitlistSubmitted(true);
      // TODO: Wire this to a real backend endpoint (e.g., Supabase table or email service).
      // Currently stubbed with localStorage.
      const entries = JSON.parse(localStorage.getItem("ba_waitlist") || "[]");
      entries.push({ email: waitlistEmail, date: new Date().toISOString() });
      localStorage.setItem("ba_waitlist", JSON.stringify(entries));
    }, 1000);
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
            <Link href="/" className="text-on-surface hover:text-secondary font-medium transition-colors">Home</Link>
            <Link href="/#courses" className="text-on-surface hover:text-secondary font-medium transition-colors">Courses</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-on-surface hover:text-secondary font-medium transition-colors hidden md:block">Login</Link>
            <Link href="/#courses" className="bg-secondary text-on-secondary px-5 py-2 rounded-full font-semibold hover:bg-secondary/90 transition-all btn-press shadow-md">Explore Courses</Link>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Course Hero */}
        <section className="hero-gradient py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <Link href="/#courses" className="text-sm text-on-surface-variant hover:text-secondary transition-colors inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-base">arrow_back</span> All Courses
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 bg-surface-variant text-on-surface-variant px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                Coming Soon
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-primary-container leading-tight tracking-tight mb-4">
              AI-Enabled Business Analytics
            </h1>
            <p className="text-xl text-secondary font-bold mb-3">One-Month Intensive — business thinking first, then data &amp; visualization. No coding required.</p>
            <p className="text-lg text-on-surface-variant max-w-3xl leading-relaxed mb-8">
              Learn Business Analytics from scratch. Master structured problem-solving, stakeholder communication, and use AI to accelerate your analysis.
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <a href="#enrollment" className="bg-secondary text-on-secondary px-8 py-3.5 rounded-full font-bold text-lg hover:bg-secondary/90 transition-all btn-press shadow-lg inline-flex items-center gap-2">
                Join the Waitlist <span className="material-symbols-outlined">arrow_downward</span>
              </a>
            </div>
          </div>
        </section>

        {/* Course Snapshot Info Panel */}
        <section className="py-12 bg-surface-container-high border-y border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <span className="material-symbols-outlined text-secondary text-2xl mb-2">schedule</span>
                <h4 className="font-bold text-on-surface text-sm mb-1">Duration &amp; Commitment</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  4 weeks (20 teaching days, 5 days/week).<br/>
                  ~3 hours daily (≈1.5 hr concept, ≈1.5 hr applied practice).
                </p>
              </div>
              <div>
                <span className="material-symbols-outlined text-secondary text-2xl mb-2">account_tree</span>
                <h4 className="font-bold text-on-surface text-sm mb-1">Structure</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Weeks 1–2: business fundamentals &amp; problem-solving frameworks.<br/>
                  Weeks 3–4: data &amp; visualization.
                </p>
              </div>
              <div>
                <span className="material-symbols-outlined text-secondary text-2xl mb-2">trending_up</span>
                <h4 className="font-bold text-on-surface text-sm mb-1">Level &amp; Audience</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Beginner to intermediate; no coding or SQL required.<br/>
                  For aspiring analysts, consultants, product/ops people, managers.
                </p>
              </div>
              <div className="md:col-span-3">
                 <span className="material-symbols-outlined text-secondary text-2xl mb-2">handyman</span>
                <h4 className="font-bold text-on-surface text-sm mb-1">Toolkit</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Spreadsheets, AI assistants, no-code BI tool (Power BI or Tableau).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy & AI Usage */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">
             <div>
               <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                 <span className="material-symbols-outlined text-sm">lightbulb</span>
                 Our Philosophy
               </div>
               <h2 className="text-3xl font-extrabold text-primary-container mb-4">Business Judgment Over Tooling</h2>
               <div className="bg-surface-container-lowest p-6 rounded-2xl border-l-4 border-secondary shadow-sm text-on-surface-variant italic leading-relaxed text-lg">
                 "Analytics starts with business judgment, not tooling. Learn how a business works and how to structure a problem with proven frameworks first, then answer those questions with spreadsheets, AI, and dashboards — no programming. AI is a thinking partner, never a replacement for judgment."
               </div>
             </div>

             <div>
               <div className="inline-flex items-center gap-2 bg-fuchsia-500/10 text-fuchsia-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                 <span className="material-symbols-outlined text-sm">smart_toy</span>
                 How AI Is Used
               </div>
               <h2 className="text-3xl font-extrabold text-primary-container mb-4">Your Thinking Partner</h2>
               <ul className="space-y-4 text-on-surface-variant">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-fuchsia-600 mt-1">check_circle</span>
                    <span><strong>Weeks 1–2:</strong> Practice frameworks at speed, role-play stakeholder interviews with AI, and pressure-test logic.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-fuchsia-600 mt-1">check_circle</span>
                    <span><strong>Weeks 3–4:</strong> Generate formulas, accelerate cleaning/exploration, build dashboards with BI copilots, and draft insight narratives — always with a human check.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-fuchsia-600 mt-1">school</span>
                    <span><strong>The Daily "AI Drill":</strong> Use AI to do the task, then verify by hand.</span>
                  </li>
               </ul>
             </div>
          </div>
        </section>

        {/* Learning Outcomes */}
        <section className="py-24 bg-surface-container-low border-y border-outline-variant/20">
           <div className="max-w-7xl mx-auto px-6">
             <div className="text-center mb-16 reveal-on-scroll">
              <h2 className="text-4xl font-extrabold text-primary-container mb-4 tracking-tight">Learning Outcomes</h2>
              <p className="text-on-surface-variant max-w-3xl mx-auto text-lg">
                By the end of this intensive course, you will be able to:
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: 'domain', title: 'Understand Value Creation', desc: 'Explain how a business creates, delivers, and captures value, and read its core metrics.' },
                { icon: 'account_tree', title: 'Structure Problems', desc: 'Structure a fuzzy problem into clear, testable questions using the right framework.' },
                { icon: 'record_voice_over', title: 'Manage Stakeholders', desc: 'Run stakeholder interviews and turn them into requirements and hypotheses.' },
                { icon: 'cleaning_services', title: 'Analyze Data (No Code)', desc: 'Clean, explore, and analyze data using spreadsheets and AI — no code.' },
                { icon: 'dashboard', title: 'Build Dashboards', desc: 'Build clear visualizations and interactive dashboards.' },
                { icon: 'campaign', title: 'Deliver Recommendations', desc: 'Deliver an evidence-backed recommendation and communicate it like a consultant.' }
              ].map((outcome, i) => (
                <div key={i} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-card hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                    <span className="material-symbols-outlined text-2xl">{outcome.icon}</span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-2">{outcome.title}</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{outcome.desc}</p>
                </div>
              ))}
            </div>
           </div>
        </section>

        {/* 4-Week Curriculum */}
        <section id="syllabus" className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 reveal-on-scroll">
              <h2 className="text-4xl font-extrabold text-primary-container mb-4 tracking-tight">4-Week Curriculum</h2>
              <p className="text-on-surface-variant max-w-3xl mx-auto text-lg">
                A hands-on, framework-first approach.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Week 1 */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col justify-between hover:border-secondary transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">Week 1</span>
                    <span className="material-symbols-outlined text-outline">architecture</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary-container mb-2">Business Fundamentals &amp; Structured Problem-Solving (Pt 1)</h3>
                  
                  <div className="bg-surface-container/30 rounded-xl p-4 mb-6 text-sm italic text-on-surface-variant border-l-4 border-secondary">
                    <strong>Goal:</strong> Business literacy + first problem-solving frameworks.
                  </div>

                  <ul className="space-y-3 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 1:</strong> Business Model Canvas; Unit Economics (CAC, LTV, contribution margin, payback); AI drill.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 2:</strong> Porter's Value Chain; TAM/SAM/SOM; Jobs To Be Done; market-sizing exercise.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 3:</strong> North Star Metric, KPIs, OKRs; SCQ framing; AI drill.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 4:</strong> 5 Whys, Fishbone, Issue/Logic Trees, MECE; AI drill.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 5:</strong> Hypothesis-driven thinking, 80/20 (Pareto), first principles.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto pt-6 border-t border-outline-variant/20 bg-secondary/5 -mx-8 -mb-8 p-8 rounded-b-3xl">
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Weekend Case 1</span>
                  <p className="text-sm font-semibold text-on-surface leading-relaxed">Canvas + metrics, SCQ framing, MECE tree, root causes, top 3 hypotheses.</p>
                </div>
              </div>

              {/* Week 2 */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col justify-between hover:border-secondary transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">Week 2</span>
                    <span className="material-symbols-outlined text-outline">groups</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary-container mb-2">Stakeholders, Requirements &amp; Strategy (Pt 2)</h3>
                  
                  <div className="bg-surface-container/30 rounded-xl p-4 mb-6 text-sm italic text-on-surface-variant border-l-4 border-secondary">
                    <strong>Goal:</strong> Extract info from people, then zoom out to strategy and storytelling.
                  </div>

                  <ul className="space-y-3 mb-8 text-sm text-on-surface-variant">
                     <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 6:</strong> Power/Interest Grid; interview techniques; AI role-play interview.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 7:</strong> Functional vs non-functional requirements; user stories; SIPOC &amp; process mapping.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 8:</strong> Journey Mapping, AARRR, funnel, cohort, RFM; RICE, MoSCoW, Cost-Benefit.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 9:</strong> SWOT, PESTLE, Porter's Five Forces, Ansoff, BCG Matrix, McKinsey 7S.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 10:</strong> Minto Pyramid Principle; Situation&rarr;Insight&rarr;Recommendation&rarr;Action.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto pt-6 border-t border-outline-variant/20 bg-secondary/5 -mx-8 -mb-8 p-8 rounded-b-3xl">
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Weekend Case 2</span>
                  <p className="text-sm font-semibold text-on-surface leading-relaxed">Mock interview &rarr; requirements + process map &rarr; strategy framework &rarr; prioritized recommendation via Pyramid Principle.</p>
                </div>
              </div>

              {/* Week 3 */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col justify-between hover:border-secondary transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">Week 3</span>
                    <span className="material-symbols-outlined text-outline">data_exploration</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary-container mb-2">Data: Prepare, Explore &amp; Analyze (No Code)</h3>
                  
                  <div className="bg-surface-container/30 rounded-xl p-4 mb-6 text-sm italic text-on-surface-variant border-l-4 border-secondary">
                    <strong>Goal:</strong> Answer the framework questions using spreadsheets + AI.
                  </div>

                  <ul className="space-y-3 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 11:</strong> Data literacy; data quality dimensions; building an analysis-ready table.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 12:</strong> Spreadsheets as an analytics engine — lookups, pivots, conditional aggregation; verifying AI-generated formulas.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 13:</strong> Cleaning messy data — missing values, duplicates, outliers, reshaping.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 14:</strong> Exploratory Data Analysis; correlation vs causation.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 15:</strong> Diagnostic analytics — segmentation, trend analysis, and root cause verification with data.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto pt-6 border-t border-outline-variant/20 bg-secondary/5 -mx-8 -mb-8 p-8 rounded-b-3xl">
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Weekend Case 3</span>
                  <p className="text-sm font-semibold text-on-surface leading-relaxed">End-to-end data cleaning and exploratory analysis to prove or disprove the hypotheses from Week 1.</p>
                </div>
              </div>

              {/* Week 4 - Placeholder content generated based on context */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col justify-between hover:border-secondary transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">Week 4</span>
                    <span className="material-symbols-outlined text-outline">dashboard</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary-container mb-2">Dashboards, Storytelling &amp; Capstone</h3>
                  
                  <div className="bg-surface-container/30 rounded-xl p-4 mb-6 text-sm italic text-on-surface-variant border-l-4 border-secondary">
                    <strong>Goal:</strong> Visualize the findings and communicate actionable recommendations to stakeholders.
                  </div>

                  <ul className="space-y-3 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 16:</strong> Visualization principles; choosing the right chart for the right question.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 17:</strong> Introduction to BI Tools (Power BI / Tableau); connecting data sources.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 18:</strong> Building interactive dashboards with BI copilots.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 19:</strong> Data storytelling; crafting narratives and executive summaries.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">today</span>
                      <span><strong>Day 20:</strong> Final presentations, feedback, and course wrap-up.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto pt-6 border-t border-outline-variant/20 bg-secondary/5 -mx-8 -mb-8 p-8 rounded-b-3xl">
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Capstone Project</span>
                  <p className="text-sm font-semibold text-on-surface leading-relaxed">Present a comprehensive business strategy backed by a functional dashboard and Minto Pyramid narrative.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enrollment Section — Waitlist Only */}
        <section id="enrollment" className="py-24 bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-surface-variant text-on-surface-variant px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                Launching Soon
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary-container mb-4">Join the Waitlist</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
                Enrollments are opening soon. Register your interest below to be notified first.
              </p>
            </div>
            
            <div className="max-w-xl mx-auto bg-surface-container-lowest p-8 md:p-12 rounded-3xl border-2 border-outline-variant/50 shadow-elevated">
               {waitlistSubmitted ? (
                  <div className="text-center py-6 space-y-6 animate-scale-in">
                    <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-5xl">check_circle</span>
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-primary-container mb-2">You are on the Waitlist!</h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        We will notify you at <strong>{waitlistEmail}</strong> as soon as enrollments open.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <form onSubmit={handleWaitlist} className="space-y-4">
                      <div className="space-y-1.5 text-left">
                        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email Address</label>
                        <input
                          type="email"
                          required
                          value={waitlistEmail}
                          onChange={(e) => setWaitlistEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm transition-all"
                          placeholder="john@example.com"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={waitlistLoading}
                        className="w-full bg-secondary text-on-secondary py-3.5 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-md flex items-center justify-center"
                      >
                        {waitlistLoading ? (
                          <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                        ) : (
                          "Notify Me When Admissions Open"
                        )}
                      </button>
                    </form>
                  </div>
                )}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low text-on-surface-variant py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center">
                <Logo variant="img2" className="h-14 w-auto" />
              </Link>
            </div>
            <p className="text-sm">Empowering next-gen analysts with AI-powered education and career transformation.</p>
          </div>
          <div>
            <h4 className="text-on-surface font-bold mb-4">Courses</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/#courses" className="hover:text-secondary transition-colors">All Courses</Link></li>
              <li><Link href="/courses/data-analyst" className="hover:text-secondary transition-colors">Data Analyst Bootcamp</Link></li>
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
          <p>&copy; 2026 InsightNest AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
