"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <Logo variant="img1" className="h-16 w-auto" />
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#courses" className="text-on-surface hover:text-secondary font-medium transition-colors">Syllabus</Link>
            <Link href="/#pricing" className="text-on-surface hover:text-secondary font-medium transition-colors">Unlock Dashboard / Buy</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-on-surface hover:text-secondary font-medium transition-colors hidden md:block">Dashboard</Link>
            <Link href="/login" className="text-on-surface hover:text-secondary font-medium transition-colors hidden md:block">Login</Link>
            <Link href="/#pricing" className="bg-secondary text-on-secondary px-5 py-2 rounded-full font-semibold hover:bg-secondary/90 transition-all btn-press shadow-md">Apply Now</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 flex-1">
        {/* About Hero Section */}
        <section className="hero-gradient py-20 text-center border-b border-outline-variant/20">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary-container mb-6 tracking-tight">
              About <span className="text-secondary">InsightNest</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed">
              We are building the future of analytics education—a unified, AI-augmented academy designed to scale data expertise at 10x velocity.
            </p>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-20 bg-surface">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-primary-container text-center mb-10">A Unified Analytics Platform</h2>
            <div className="prose prose-slate max-w-none text-on-surface-variant text-base leading-relaxed space-y-6">
              <p>
                At InsightNest, we believe that data shouldn't be siloed. Traditional analytics programs split learning into disconnected parts, leaving students struggling to synthesize business objectives with technical stacks.
              </p>
              <p>
                We want to be a <strong>unified analytics platform</strong> where people can learn all types of analytics and data, including:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pt-4 pb-4">
                <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-0.5">query_stats</span>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm mb-1">Business & Product Analytics</h4>
                    <p className="text-xs">Master conversion funnels, user retention modeling, and product growth KPI frameworks.</p>
                  </div>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-0.5">account_balance</span>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm mb-1">Financial & Revenue Analytics</h4>
                    <p className="text-xs">Design automated margin leakage tools, forecasting, and revenue growth architecture.</p>
                  </div>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-0.5">hub</span>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm mb-1">Data Architecture & Engineering</h4>
                    <p className="text-xs">Build high-fidelity relational pipelines, OneLake databases, and Microsoft Fabric models.</p>
                  </div>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-0.5">psychology</span>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm mb-1">Generative AI Operations</h4>
                    <p className="text-xs">Orchestrate agentic workflows, prompt-driven engineering, and automated code reviewers.</p>
                  </div>
                </div>
              </div>
              <p>
                By blending cognitive UI/UX design with live, expert-led cohorts, we guide students through the end-to-end stack—from basic quantitative foundations in Excel and advanced relational SQL queries, to AI-assisted Python compilation and enterprise Power BI suites.
              </p>
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className="py-20 bg-surface-container-low border-t border-outline-variant/20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-10 items-center">
              <div className="md:col-span-1 text-center">
                <div className="w-40 h-40 bg-secondary/15 rounded-full mx-auto flex items-center justify-center border-2 border-secondary shadow-lg">
                  <span className="material-symbols-outlined text-6xl text-secondary">person_play</span>
                </div>
                <h3 className="text-xl font-bold text-primary-container mt-4">Zeeshan</h3>
                <p className="text-xs text-secondary font-semibold uppercase tracking-wider">Founder & Instructor Analyst</p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <span className="text-xs font-bold text-secondary uppercase tracking-widest block">Meet Your Instructor</span>
                <h2 className="text-3xl font-extrabold text-primary-container">Led by Industry Experts</h2>
                <p className="text-on-surface-variant text-base leading-relaxed">
                  InsightNest was founded by <strong>Zeeshan</strong>, a veteran analyst, instructor, and tech lead who has spent years designing enterprise data pipelines and training professional teams.
                </p>
                <p className="text-on-surface-variant text-base leading-relaxed">
                  Frustrated by traditional programming courses that focused on syntax rote learning rather than business synthesis, Zeeshan designed the 4-Week Accelerator to empower analysts to direct AI to write code, design Lakehouse models, and present insights directly to executives.
                </p>
              </div>
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
              <li><Link href="/#courses" className="hover:text-secondary transition-colors">Curriculum</Link></li>
              <li><Link href="/#pricing" className="hover:text-secondary transition-colors">Projects</Link></li>
              <li><Link href="/#pricing" className="hover:text-secondary transition-colors">Mentors</Link></li>
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
