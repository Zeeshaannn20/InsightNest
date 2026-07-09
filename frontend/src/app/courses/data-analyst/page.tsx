"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import CourseEnrollmentSection from "@/components/CourseEnrollmentSection";

export default function DataAnalystCoursePage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

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
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">lock</span>
                Admissions Closed
              </div>
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">play_circle</span>
                Cohort Running
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-primary-container leading-tight tracking-tight mb-4">
              Data Analyst Bootcamp
            </h1>
            <p className="text-xl text-secondary font-bold mb-3">The Generative AI Data Analytics &amp; Engineering Accelerator</p>
            <p className="text-lg text-on-surface-variant max-w-3xl leading-relaxed mb-8">
              Go from beginner to job-ready data analyst in 4 weeks. Learn Excel, SQL, Python, Power BI, and Microsoft Fabric — with AI tools baked into every lesson. Graduate with 4 portfolio projects and a certificate.
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-on-surface-variant">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-secondary text-base">schedule</span> 4 Weeks</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-secondary text-base">videocam</span> Live Sessions</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-secondary text-base">folder_open</span> 4 Projects</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-secondary text-base">payments</span> <span className="line-through text-outline mr-1">&#x20B9;5,999</span> &#x20B9;2,999</span>
            </div>
          </div>
        </section>

        {/* 4-Week Syllabus */}
        <section id="syllabus" className="py-24 bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 reveal-on-scroll">
              <h2 className="text-4xl font-extrabold text-primary-container mb-4 tracking-tight">4-Week Syllabus</h2>
              <p className="text-on-surface-variant max-w-3xl mx-auto text-lg">
                A hands-on, project-based curriculum. Each week covers a new tool and ends with a portfolio project you build from scratch.
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
                  <h3 className="text-xl font-bold text-primary-container mb-2">Excel &amp; Statistics Foundations</h3>
                  <p className="text-sm text-outline font-semibold mb-4">Core Stack: Excel + AI-Assisted Statistical Modeling</p>
                  
                  <div className="bg-surface-container/30 rounded-xl p-4 mb-6 text-sm italic text-on-surface-variant border-l-4 border-secondary">
                    <strong>Goal:</strong> Move from manual spreadsheets to using AI prompts for data cleaning, formula writing, and statistical analysis.
                  </div>

                  <ul className="space-y-3 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>AI-Assisted Data Cleaning:</strong> Use ChatGPT / Copilot to auto-generate cleaning formulas, regex, and schema mappings.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Advanced Formulas:</strong> INDEX MATCH, XLOOKUP, and complex lookups — written via natural-language prompts.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Statistics for Analysts:</strong> Variance, standard deviation, and A/B testing fundamentals.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Business KPIs:</strong> Build metrics frameworks (revenue, churn, LTV) that drive real decisions.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto pt-6 border-t border-outline-variant/20 bg-secondary/5 -mx-8 -mb-8 p-8 rounded-b-3xl">
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Portfolio Project 1</span>
                  <h4 className="font-bold text-on-surface text-sm mb-1">Sales Performance Dashboard</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Build a financial dashboard in Excel that uses AI-generated formulas to spot revenue trends and flag anomalies across regions and products.</p>
                </div>
              </div>

              {/* Week 2 */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col justify-between hover:border-secondary transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">Week 2</span>
                    <span className="material-symbols-outlined text-outline">terminal</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary-container mb-2">Python for Data Analysis</h3>
                  <p className="text-sm text-outline font-semibold mb-4">Core Stack: Python, Pandas, Plotly + AI Pair-Programming</p>
                  
                  <div className="bg-surface-container/30 rounded-xl p-4 mb-6 text-sm italic text-on-surface-variant border-l-4 border-secondary">
                    <strong>Goal:</strong> Write Python scripts with AI assistance — no prior coding experience needed. Focus on data wrangling and interactive visualizations.
                  </div>

                  <ul className="space-y-3 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>AI Pair-Programming:</strong> Use Copilot and ChatGPT to write, refactor, and debug Python scripts in real time.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Pandas &amp; NumPy:</strong> Clean, transform, and analyze datasets with AI guidance on syntax and best practices.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Interactive Visualizations:</strong> Create production-ready charts and data stories using Plotly.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Code Review Basics:</strong> Learn to audit data pipelines for correctness, speed, and security.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto pt-6 border-t border-outline-variant/20 bg-secondary/5 -mx-8 -mb-8 p-8 rounded-b-3xl">
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Portfolio Project 2</span>
                  <h4 className="font-bold text-on-surface text-sm mb-1">Media Trends Analysis</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Analyze international content trends using Python — scrape data, cluster it, run sentiment analysis, and present findings in an interactive dashboard.</p>
                </div>
              </div>

              {/* Week 3 */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col justify-between hover:border-secondary transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">Week 3</span>
                    <span className="material-symbols-outlined text-outline">bar_chart</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary-container mb-2">Business Intelligence with Power BI</h3>
                  <p className="text-sm text-outline font-semibold mb-4">Core Stack: Power BI + DAX + AI Visuals</p>
                  
                  <div className="bg-surface-container/30 rounded-xl p-4 mb-6 text-sm italic text-on-surface-variant border-l-4 border-secondary">
                    <strong>Goal:</strong> Build interactive dashboards that executives actually use — with AI helping you write DAX formulas and generate summaries.
                  </div>

                  <ul className="space-y-3 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Data Modeling:</strong> Structure star schemas and Power Query (M) transformations with AI acceleration.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>DAX Formulas:</strong> Build time-intelligence measures (CALCULATE, FILTER, YoY growth) using AI-generated logic.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>AI-Powered Visuals:</strong> Smart narratives, natural-language Q&amp;A, and auto-generated insights inside Power BI.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Executive Storytelling:</strong> Design drill-through reports that guide decision-makers to the right answers.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto pt-6 border-t border-outline-variant/20 bg-secondary/5 -mx-8 -mb-8 p-8 rounded-b-3xl">
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Portfolio Project 3</span>
                  <h4 className="font-bold text-on-surface text-sm mb-1">Executive Dashboard</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">A unified Power BI dashboard integrating revenue, customer lifetime value, and marketing ROI — with AI-generated executive summaries.</p>
                </div>
              </div>

              {/* Week 4 */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col justify-between hover:border-secondary transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">Week 4</span>
                    <span className="material-symbols-outlined text-outline">hub</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary-container mb-2">Enterprise Data Architecture &amp; Microsoft Fabric</h3>
                  <p className="text-sm text-outline font-semibold mb-4">Core Stack: Advanced SQL + Microsoft Fabric + Copilot</p>
                  
                  <div className="bg-surface-container/30 rounded-xl p-4 mb-6 text-sm italic text-on-surface-variant border-l-4 border-secondary">
                    <strong>Goal:</strong> Bring everything together in a modern cloud data platform — connect your Excel, Python, SQL, and Power BI skills into one automated pipeline.
                  </div>

                  <ul className="space-y-3 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Advanced SQL:</strong> Complex CTEs, Window Functions, and multi-table Joins — written with AI conversational assistants.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Microsoft Fabric:</strong> OneLake, Data Factory, and Dataflows Gen2 — centralize all your data in one platform.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>Copilot Integration:</strong> Automate ETL pipelines, generate code, and build semantic models using Microsoft Copilot.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                      <span><strong>End-to-End Automation:</strong> Build a complete pipeline from raw data ingestion to polished, AI-analyzed business insights.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto pt-6 border-t border-outline-variant/20 bg-secondary/5 -mx-8 -mb-8 p-8 rounded-b-3xl">
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Capstone Project</span>
                  <h4 className="font-bold text-on-surface text-sm mb-1">End-to-End Retail Analytics Platform</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Full production deployment: Excel ingestion &#x2192; Python analysis &#x2192; SQL transformation &#x2192; Fabric pipeline &#x2192; Power BI executive dashboard.</p>
                </div>
              </div>
            </div>

            {/* Why This Bootcamp Delivers Outsized Value */}
            <div className="mt-20">
              <div className="text-center mb-12 text-balance">
                <h3 className="text-3xl font-bold text-primary-container">Why This Bootcamp Delivers Outsized Value</h3>
                <p className="text-on-surface-variant mt-2 text-base">Here&#x2019;s what &#x20B9;2,999 gets you — and why graduates say it&#x2019;s the best investment they&#x2019;ve made in their careers.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                    <span className="material-symbols-outlined">bolt</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-2">Work Faster with AI</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">Learn to use AI tools to automate repetitive data tasks — what used to take hours can be done in minutes.</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                    <span className="material-symbols-outlined">hub</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-2">In-Demand Skills</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">Microsoft Fabric is the fastest-growing enterprise data platform. Employers are actively hiring people who know it.</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                    <span className="material-symbols-outlined">psychology</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-2">Think Like a Consultant</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">Stop memorizing syntax. Learn to direct AI tools to build the analysis — so you can focus on strategy and insights.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Portfolio: 4 Real-World Projects */}
            <div className="mt-20 pt-16 border-t border-outline-variant/30">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-primary-container">Your Portfolio: 4 Real-World Projects</h3>
                <p className="text-on-surface-variant mt-2 text-base">Graduate with a portfolio you can show to employers — each project demonstrates a different part of the data stack.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-card hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-4">
                    <span className="material-symbols-outlined">table_view</span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-2">Sales Performance Dashboard</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">An Excel-based financial model with AI-generated formulas, anomaly detection, and regional performance tracking.</p>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-card hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-4">
                    <span className="material-symbols-outlined">terminal</span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-2">Media Trends Analysis</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">A Python data pipeline with web scraping, sentiment analysis, and interactive Plotly visualizations.</p>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-card hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-4">
                    <span className="material-symbols-outlined">bar_chart</span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-2">Executive Dashboard</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">An interactive Power BI dashboard with custom DAX models, AI-generated narratives, and drill-through reports.</p>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-card hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-4">
                    <span className="material-symbols-outlined">hub</span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-2">Fabric Data Platform</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">A cloud data architecture on Microsoft Fabric with OneLake, Dataflows Gen2, SQL Warehouse, and Copilot automation.</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Enrollment Section (Dynamic) */}
        <CourseEnrollmentSection courseSlug="data-analyst" />

        {/* FAQ */}
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-primary-container mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Do I need a technical background to join?", a: "Not at all! The bootcamp is designed for absolute beginners. We start with the basics of Excel and gradually introduce SQL, Python, Power BI, and Microsoft Fabric. AI tools assist you at every step, so you don\u2019t need prior coding or analytics experience." },
                { q: "How long is the bootcamp?", a: "The bootcamp runs for 4 weeks with live, instructor-led sessions. You should plan for approximately 15-20 hours per week including live classes, hands-on projects, and self-study." },
                { q: "Will I get a certificate?", a: "Yes. Upon completing all modules and the final capstone project, you will receive a certificate of completion that you can add to your LinkedIn profile and resume." },
                { q: "What is the refund policy?", a: "TODO: Fill in your refund policy here \u2014 e.g., \u2018Full refund within 7 days of cohort start if you\u2019ve attended fewer than 2 sessions. No refunds after that.\u2019 Confirm and replace this placeholder." },
                { q: "What software or tools do I need?", a: "You\u2019ll need a laptop or desktop with a stable internet connection. All tools used in the bootcamp \u2014 Excel (or Google Sheets), Python (via free cloud notebooks), Power BI Desktop (free), and Microsoft Fabric (trial account) \u2014 are either free or provided. We\u2019ll walk you through setup in the first session." },
                { q: "How much time should I commit per week?", a: "Plan for 15-20 hours per week. This includes live sessions (roughly 6-8 hours), hands-on project work, and review. The bootcamp is intensive by design \u2014 4 weeks of focused effort replaces months of self-study." },
                { q: "What happens after I\u2019m selected?", a: "Once your application is reviewed and accepted, you\u2019ll receive an email invitation with a payment link (\u20B92,999 one-time). After payment, you\u2019ll get access to the student dashboard where you can view the schedule, join live sessions, submit projects, and track your progress." },
                { q: "What payment methods do you accept?", a: "TODO: Confirm and list accepted payment methods \u2014 e.g., UPI, credit/debit cards, net banking, Razorpay, etc. Replace this placeholder with your actual payment options." }
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
