"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Logo from "@/components/Logo";

export default function LandingPage() {
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
            <Link href="/#courses" className="text-on-surface hover:text-secondary font-medium transition-colors">Courses</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-on-surface hover:text-secondary font-medium transition-colors hidden md:block">Login</Link>
            <Link href="/#courses" className="bg-secondary text-on-secondary px-5 py-2 rounded-full font-semibold hover:bg-secondary/90 transition-all btn-press shadow-md">Explore Courses</Link>
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
                Go from beginner to job-ready data analyst in 4 weeks. Learn Excel, SQL, Python, Power BI, and Microsoft Fabric — with AI tools baked into every lesson. Graduate with 4 portfolio projects and a certificate.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#courses" className="bg-secondary text-on-secondary px-8 py-3.5 rounded-full font-bold text-lg hover:bg-secondary/90 transition-all btn-press shadow-lg text-center">
                  Explore Courses <span className="material-symbols-outlined align-middle ml-1">arrow_forward</span>
                </a>
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

        {/* ============================================================
           Business Analytics — Standalone Course Section
           ============================================================ */}
        <section id="business-analytics" className="py-24 bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">

            {/* Header block */}
            <div className="text-center mb-16 reveal-on-scroll">
              <div className="inline-flex items-center gap-2 bg-error/10 text-error px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <span className="material-symbols-outlined text-sm">timer</span>
                Limited Seats — Batch Filling Fast
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-primary-container mb-4 tracking-tight">
                Business Analytics
              </h2>
              <p className="text-xl md:text-2xl font-bold text-secondary mb-3">Your Career Starts Today</p>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
                Learn Business Analytics from scratch — no coding, no degree needed.
              </p>
            </div>

            {/* Two-column layout: Benefits + Dashboard mockup */}
            <div className="grid md:grid-cols-2 gap-12 items-start mb-20">

              {/* Left: Key Benefits */}
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-primary-container">Why Business Analytics?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { icon: 'trending_up', label: 'High-Demand Skill', desc: 'Analytics roles are among the fastest-growing jobs in India and globally.' },
                    { icon: 'payments', label: 'Great Salary Potential', desc: 'Entry-level analysts earn ₹4-8 LPA; experienced analysts earn significantly more.' },
                    { icon: 'insights', label: 'Real-World Business Impact', desc: 'Make decisions that directly affect revenue, operations, and strategy.' },
                    { icon: 'workspace_premium', label: 'Certification Included', desc: 'Earn a certificate of completion to showcase on LinkedIn and your resume.' },
                  ].map((benefit) => (
                    <div key={benefit.label} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                      <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-3 group-hover:bg-secondary/20 transition-colors">
                        <span className="material-symbols-outlined">{benefit.icon}</span>
                      </div>
                      <h4 className="font-bold text-on-surface text-sm mb-1">{benefit.label}</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{benefit.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Dashboard Mockup */}
              {/* TODO: Replace this CSS mockup with a real screenshot or designed asset when available */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/15 to-primary-container/10 blur-3xl -z-10 rounded-[3rem]"></div>
                <div className="glass-card p-4 rounded-2xl shadow-2xl border border-white/40">
                  <div className="bg-primary-container rounded-xl overflow-hidden shadow-inner">
                    {/* Window chrome */}
                    <div className="h-8 bg-inverse-surface/50 border-b border-white/10 flex items-center justify-between px-4">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-error"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                      </div>
                      <span className="text-[10px] text-white/50 font-medium">Business Analytics Dashboard</span>
                    </div>

                    {/* KPI Cards Row */}
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                          <p className="text-[10px] text-white/50 mb-1">Total Revenue</p>
                          <p className="text-sm font-bold text-white/90">₹2.45 Cr</p>
                          <span className="text-[10px] text-green-400 font-semibold">+18.6% ↑</span>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                          <p className="text-[10px] text-white/50 mb-1">Profit</p>
                          <p className="text-sm font-bold text-white/90">₹1.25 Cr</p>
                          <span className="text-[10px] text-green-400 font-semibold">+21.7% ↑</span>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                          <p className="text-[10px] text-white/50 mb-1">Orders</p>
                          <p className="text-sm font-bold text-white/90">8,425</p>
                          <span className="text-[10px] text-green-400 font-semibold">+12.4% ↑</span>
                        </div>
                      </div>

                      {/* Chart placeholders */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Revenue Over Time — line chart mockup */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10 col-span-2 sm:col-span-1">
                          <p className="text-[10px] text-white/40 mb-2 font-medium">Revenue Over Time</p>
                          <div className="flex items-end gap-1 h-16">
                            {[30, 42, 38, 55, 48, 62, 58, 70, 65, 78, 72, 85].map((h, i) => (
                              <div key={i} className="flex-1 bg-secondary/70 rounded-t-sm transition-all" style={{ height: `${h}%` }}></div>
                            ))}
                          </div>
                        </div>
                        {/* Channel Performance — horizontal bars */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10 col-span-2 sm:col-span-1">
                          <p className="text-[10px] text-white/40 mb-2 font-medium">Channel Performance</p>
                          <div className="space-y-2">
                            {[
                              { label: 'Direct', w: '78%' },
                              { label: 'Online', w: '62%' },
                              { label: 'Partner', w: '45%' },
                            ].map((ch) => (
                              <div key={ch.label} className="flex items-center gap-2">
                                <span className="text-[9px] text-white/40 w-10 text-right">{ch.label}</span>
                                <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-secondary-container/70 rounded-full" style={{ width: ch.w }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Top Products mini-table */}
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-[10px] text-white/40 mb-2 font-medium">Top Products</p>
                        <div className="space-y-1.5">
                          {[
                            { name: 'Product A', rev: '₹48.2L', pct: '+24%' },
                            { name: 'Product B', rev: '₹35.8L', pct: '+18%' },
                            { name: 'Product C', rev: '₹29.1L', pct: '+11%' },
                          ].map((p) => (
                            <div key={p.name} className="flex items-center justify-between text-[10px]">
                              <span className="text-white/60">{p.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-white/80 font-medium">{p.rev}</span>
                                <span className="text-green-400">{p.pct}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <p className="text-[9px] text-white/30 text-center italic">Illustrative sample data — not real metrics</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Easy Steps */}
            <div className="mb-20 reveal-on-scroll">
              <h3 className="text-2xl font-bold text-primary-container text-center mb-10">3 Easy Steps to Get Started</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[
                  { step: '1', icon: 'edit_note', title: 'Apply', desc: 'Register your interest using the application form below.' },
                  { step: '2', icon: 'mail', title: 'Get Enrollment Details', desc: 'We\u2019ll review your application and send you an enrollment invite within 24 hours.' },
                  { step: '3', icon: 'school', title: 'Start Learning', desc: 'Complete payment, access the dashboard, and join your first live session this week.' },
                ].map((s, i) => (
                  <div key={s.step} className="relative text-center">
                    {/* Connector line (hidden on mobile, shown on md+) */}
                    {i < 2 && (
                      <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-outline-variant/30"></div>
                    )}
                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4 relative z-10">
                      <span className="material-symbols-outlined text-secondary text-2xl">{s.icon}</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">Step {s.step}</span>
                    <h4 className="font-bold text-on-surface mb-1">{s.title}</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price + CTA */}
            <div className="max-w-xl mx-auto text-center bg-surface-container-lowest p-8 md:p-10 rounded-3xl border-2 border-secondary shadow-elevated reveal-on-scroll">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Course Fee</span>
              <div className="mb-2 flex items-center justify-center">
                <span className="text-2xl line-through text-outline mr-3">₹5,999</span>
                <span className="text-4xl font-extrabold text-primary-container">₹2,999</span>
              </div>
              <p className="text-sm text-on-surface-variant mb-6">One-time payment · Certification + Interview Prep included</p>
              <a
                href="#courses"
                className="inline-flex items-center justify-center bg-secondary text-on-secondary px-10 py-3.5 rounded-full font-bold text-lg hover:bg-secondary/90 transition-all btn-press shadow-lg"
              >
                Enroll Now <span className="material-symbols-outlined ml-2">arrow_forward</span>
              </a>
              <p className="text-xs text-outline mt-4">Apply first — pay only after you are selected.</p>
            </div>

            {/* Trust Badges Strip */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: 'emoji_people', label: 'Beginner Friendly' },
                { icon: 'schedule', label: 'Flexible Learning' },
                { icon: 'groups', label: 'Learn from Industry Experts' },
                { icon: 'work', label: 'Career Support' },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center text-center gap-2 py-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">{badge.icon}</span>
                  </div>
                  <span className="text-sm font-semibold text-on-surface">{badge.label}</span>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Outcome Stats Bar — TODO: Replace with real data */}
        <section className="py-8 bg-surface-container-high border-y border-outline-variant/20">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {/* TODO: Replace placeholder numbers with real outcome data */}
            <div>
              <span className="text-3xl font-extrabold text-secondary">4</span>
              <p className="text-sm text-on-surface-variant mt-1">Portfolio Projects</p>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-secondary">6+</span>
              <p className="text-sm text-on-surface-variant mt-1">Tools Covered</p>
            </div>
            <div>
              {/* TODO: Replace with real graduate count */}
              <span className="text-3xl font-extrabold text-secondary">—</span>
              <p className="text-sm text-on-surface-variant mt-1">Graduates to Date</p>
            </div>
            <div>
              {/* TODO: Replace with real salary range data */}
              <span className="text-3xl font-extrabold text-secondary">—</span>
              <p className="text-sm text-on-surface-variant mt-1">Avg. Starting Salary</p>
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section id="courses" className="py-24 bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 reveal-on-scroll">
              <h2 className="text-4xl font-extrabold text-primary-container mb-4 tracking-tight">Our Programs</h2>
              <p className="text-on-surface-variant max-w-3xl mx-auto text-lg">
                Choose the path that fits your career goals. Both programs feature hands-on projects, live sessions, and AI integration.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Data Analyst Course Card */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col justify-between hover:border-secondary transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-2xl">analytics</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-xs">lock</span>
                      Running &middot; Admissions Closed
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-primary-container mb-3 group-hover:text-secondary transition-colors">Data Analyst Bootcamp</h3>
                  <p className="text-sm text-secondary font-semibold mb-4">The Generative AI Data Analytics &amp; Engineering Accelerator</p>
                  
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                    Master Excel, SQL, Python, Power BI, and Microsoft Fabric. Build a robust portfolio and learn to use AI to 10x your productivity.
                  </p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-on-surface-variant">4 Weeks &middot; Live</div>
                    <Link href="/courses/data-analyst" className="bg-secondary text-on-secondary px-5 py-2 rounded-full font-semibold hover:bg-secondary/90 transition-all btn-press shadow-sm text-sm">
                      View Course
                    </Link>
                  </div>
                </div>
              </div>

              {/* Business Analyst Course Card */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col justify-between opacity-80">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-outline-variant/20 flex items-center justify-center text-outline">
                      <span className="material-symbols-outlined text-2xl">trending_up</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-surface-variant text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-xs">hourglass_empty</span>
                      Coming Soon
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-outline mb-3">Business Analytics</h3>
                  <p className="text-sm text-outline font-semibold mb-4">Mastering Business Intelligence and Strategy</p>
                  
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                    {/* TODO: Update description once course details are finalized */}
                    Learn how to translate data into actionable business strategies. Focus on storytelling, stakeholder management, and advanced visualization.
                  </p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-outline">Duration TBD</div>
                    <Link href="/courses/business-analytics" className="bg-secondary text-on-secondary px-5 py-2 rounded-full font-semibold hover:bg-secondary/90 transition-all btn-press shadow-sm text-sm">
                      Join Waitlist
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary-container mb-4">Master the Industry-Standard Stack</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto mb-16 text-lg">Learn the tools that hiring managers actually look for — with AI assistants helping you every step of the way.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { name: 'Excel', icon: 'table_view', desc: 'Data Modeling & Analysis', color: 'from-emerald-500/10 to-teal-500/5', hoverBorder: 'hover:border-emerald-500/50 hover:shadow-emerald-500/5', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 group-hover:bg-emerald-100' },
                { name: 'SQL', icon: 'database', desc: 'Queries & Databases', color: 'from-blue-500/10 to-indigo-500/5', hoverBorder: 'hover:border-blue-500/50 hover:shadow-blue-500/5', iconColor: 'text-blue-600', iconBg: 'bg-blue-50 group-hover:bg-blue-100' },
                { name: 'Python', icon: 'terminal', desc: 'Scripting & Automation', color: 'from-sky-500/10 to-blue-600/5', hoverBorder: 'hover:border-sky-500/50 hover:shadow-sky-500/5', iconColor: 'text-sky-600', iconBg: 'bg-sky-50 group-hover:bg-sky-100' },
                { name: 'Power BI', icon: 'bar_chart', desc: 'Dashboards & DAX', color: 'from-amber-500/10 to-yellow-500/5', hoverBorder: 'hover:border-amber-500/50 hover:shadow-amber-500/5', iconColor: 'text-amber-600', iconBg: 'bg-amber-50 group-hover:bg-amber-100' },
                { name: 'Fabric', icon: 'hub', desc: 'Cloud Data Platform', color: 'from-violet-500/10 to-purple-500/5', hoverBorder: 'hover:border-violet-500/50 hover:shadow-violet-500/5', iconColor: 'text-violet-600', iconBg: 'bg-violet-50 group-hover:bg-violet-100' },
                { name: 'AI Tools', icon: 'smart_toy', desc: 'ChatGPT, Copilot & More', color: 'from-fuchsia-500/10 to-pink-500/5', hoverBorder: 'hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/5', iconColor: 'text-fuchsia-600', iconBg: 'bg-fuchsia-50 group-hover:bg-fuchsia-100' }
              ].map((tool) => (
                <div key={tool.name} className={`relative overflow-hidden bg-gradient-to-br ${tool.color} border border-outline-variant/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${tool.hoverBorder}`}>
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

        {/* Brand Representation Banner */}
        <section className="py-12 bg-surface border-y border-outline-variant/10">
          <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
            <Logo variant="img2" className="h-32 md:h-40 w-auto mb-8 opacity-100" />
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-widest text-primary-container mt-6 uppercase">InsightNest AI Academy</h3>
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
              <li><a href="#courses" className="hover:text-secondary transition-colors">All Courses</a></li>
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
