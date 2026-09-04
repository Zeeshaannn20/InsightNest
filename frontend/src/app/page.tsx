"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import CourseEnrollmentSection from "@/components/CourseEnrollmentSection";
import { OrganizationJsonLd, CourseJsonLd, FaqJsonLd } from "@/components/JsonLd";
import {
  AUDIENCE_NO,
  AUDIENCE_YES,
  BATCH,
  CAREER_BLOCKS,
  COMPARISON,
  DIFFERENTIATORS,
  FAQS,
  INCLUDED,
  MAJOR_PROJECTS,
  MINI_PROJECTS,
  PRICE,
  PROBLEMS,
  STATS,
  TRACKS,
} from "@/lib/landing-content";

/* ---------------------------------- bits --------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  sub,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl mb-14">
      {eyebrow && (
        <p
          className={`text-xs font-bold uppercase tracking-[0.18em] mb-3 ${
            light ? "text-secondary-container" : "text-secondary"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`text-3xl md:text-[2.6rem] font-bold tracking-tight leading-[1.15] text-balance ${
          light ? "text-white" : "text-primary-container"
        }`}
      >
        {title}
      </h2>
      {sub && (
        <p className={`mt-4 text-lg leading-relaxed ${light ? "text-white/70" : "text-on-surface-variant"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

function TrackAccordion({ track, index }: { track: (typeof TRACKS)[number]; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const count = track.groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div
      className="border border-outline-variant/40 rounded-2xl overflow-hidden bg-surface-container-lowest transition-shadow hover:shadow-card"
      style={{ borderLeft: `4px solid ${track.hue}` }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-4 px-5 md:px-7 py-5 text-left hover:bg-surface-container-low/40 transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 text-white"
          style={{ background: track.hue }}
        >
          {index + 1}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-bold text-primary-container text-lg leading-snug">{track.name}</span>
          <span className="block text-sm text-on-surface-variant">
            {track.summary} — {count} lessons
          </span>
        </span>
        <span
          className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div className="px-5 md:px-7 pb-7 pt-1 grid gap-6 md:grid-cols-2 animate-slide-down">
          {track.groups.map((group) => (
            <div key={group.heading}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                {group.heading}
              </h4>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-on-surface leading-relaxed">
                    <span
                      className="material-symbols-outlined text-[18px] leading-5 shrink-0"
                      style={{ color: track.hue }}
                      aria-hidden="true"
                    >
                      check
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Faq({ item }: { item: (typeof FAQS)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-outline-variant/40">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-6 py-5 text-left group"
      >
        <span className="font-semibold text-primary-container group-hover:text-secondary transition-colors">
          {item.q}
        </span>
        <span
          className={`material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          add
        </span>
      </button>
      {open && (
        <p className="pb-6 -mt-1 text-on-surface-variant leading-relaxed max-w-3xl animate-slide-down">{item.a}</p>
      )}
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */

export default function DataAnalystCoursePage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-slide-up");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Structured data — how search and AI answer engines read this page */}
      <OrganizationJsonLd />
      <CourseJsonLd
        price={PRICE.now}
        durationWeeks={8}
        topics={TRACKS.map((t) => t.name)}
      />
      <FaqJsonLd faqs={FAQS} />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo variant="img1" className="h-16 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#curriculum" className="text-on-surface hover:text-secondary font-medium transition-colors">Curriculum</a>
            <a href="#projects" className="text-on-surface hover:text-secondary font-medium transition-colors">Projects</a>
            <a href="#pricing" className="text-on-surface hover:text-secondary font-medium transition-colors">Pricing</a>
            <a href="#faq" className="text-on-surface hover:text-secondary font-medium transition-colors">FAQ</a>
            <Link href="/articles" className="text-on-surface hover:text-secondary font-medium transition-colors">Articles</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-on-surface hover:text-secondary font-medium transition-colors hidden md:block">Login</Link>
            <a href="#pricing" className="bg-secondary text-on-secondary px-5 py-2 rounded-full font-semibold hover:bg-secondary/90 transition-all btn-press shadow-md">
              Enroll Now
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-20 md:pb-0">
        {/* ---------------------------- 1 · HERO ---------------------------- */}
        <section className="relative overflow-hidden bg-primary-container text-white">
          <div className="absolute -top-40 -right-32 w-[36rem] h-[36rem] bg-secondary/30 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-52 -left-20 w-[30rem] h-[30rem] bg-secondary-container/20 rounded-full blur-[130px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 grid lg:grid-cols-[1.15fr_1fr] gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live weekend batch, beginner to advanced, 2 months
              </div>

              <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] text-balance">
                Become a Job-Ready Data Analyst in 8 Weekends
              </h1>

              <p className="mt-6 text-lg md:text-xl text-white/75 leading-relaxed max-w-2xl">
                Excel, SQL, Python, Statistics, Power BI and Data Storytelling. Taught live, built on
                7 real projects, finished with a resume and an interview plan.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href="#pricing"
                  className="bg-secondary text-on-secondary px-7 py-3.5 rounded-xl font-bold text-base hover:bg-secondary/90 transition-all btn-press shadow-lg shadow-secondary/25"
                >
                  Enroll Now for ₹{PRICE.now.toLocaleString("en-IN")}
                </a>
                <a
                  href="#curriculum"
                  className="border border-white/25 text-white px-7 py-3.5 rounded-xl font-bold text-base hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  See Full Syllabus
                </a>
              </div>

              <p className="mt-6 text-sm text-white/55 leading-relaxed">
                487+ students taught. Lifetime recordings, 7 portfolio projects, career support included.
              </p>
            </div>

            {/* price card */}
            <div className="lg:justify-self-end w-full max-w-sm bg-white/10 border border-white/15 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary-container">
                Complete Program
              </p>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-5xl font-bold tracking-tight">₹{PRICE.now.toLocaleString("en-IN")}</span>
                <span className="text-xl text-white/40 line-through mb-1.5">
                  ₹{PRICE.was.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/60">
                One-time fee. Full program. No hidden charges.
              </p>

              <div className="mt-6 space-y-3 text-sm">
                {[
                  "16 live sessions over 8 weeks",
                  "7 portfolio projects",
                  "Lifetime recordings",
                  "Career support included",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-white/85">
                    <span className="material-symbols-outlined text-[18px] text-green-400">check_circle</span>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-white/15 flex items-center gap-2 text-xs text-white/60">
                <span className="material-symbols-outlined text-[16px]">event_available</span>
                {BATCH.enrolmentNote}
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------- STATS BAND --------------------------- */}
        <section className="bg-surface-container-lowest border-b border-outline-variant/30">
          <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-secondary tracking-tight tabular-nums">
                  {s.value}
                </p>
                <p className="mt-1 text-xs md:text-sm font-medium text-on-surface-variant">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --------------------------- 2 · PROBLEM -------------------------- */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6 reveal-on-scroll">
            <SectionHeading
              eyebrow="Why most people stall"
              title="Most people don’t fail at learning analytics. They fail at finishing."
              sub="You’ve watched the free tutorials. You may have a course sitting at 12% complete. And you still can’t answer the one question every interviewer asks."
            />

            <blockquote className="max-w-3xl border-l-4 border-secondary bg-surface-container-low rounded-r-2xl px-7 py-6 mb-14">
              <p className="text-xl md:text-2xl font-medium text-primary-container leading-snug italic">
                “Walk me through a project you built and the business decision it changed.”
              </p>
            </blockquote>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {PROBLEMS.map((p) => (
                <div
                  key={p.title}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 hover:border-error/40 transition-colors"
                >
                  <span className="material-symbols-outlined text-error text-3xl">{p.icon}</span>
                  <h3 className="mt-4 font-bold text-primary-container leading-snug">{p.title}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>

            <p className="mt-10 text-lg font-semibold text-primary-container">
              InsightNest is built to fix exactly these four gaps.
            </p>
          </div>
        </section>

        {/* ------------------------ 3 · DIFFERENTIATORS --------------------- */}
        <section className="py-24 bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6 reveal-on-scroll">
            <SectionHeading
              eyebrow="What makes this different"
              title="Four things you won’t get from a ₹499 recorded course"
            />
            <div className="grid md:grid-cols-2 gap-6">
              {DIFFERENTIATORS.map((d, i) => (
                <div
                  key={d.title}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-7 flex gap-5 hover:shadow-card transition-shadow"
                >
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">{d.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary tracking-wider mb-1">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="font-bold text-lg text-primary-container leading-snug">{d.title}</h3>
                    <p className="mt-2 text-on-surface-variant leading-relaxed">{d.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------- 4 · AUDIENCE ------------------------- */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6 reveal-on-scroll">
            <SectionHeading eyebrow="Who this is for" title="Built for people switching in, not starting over" />
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest border border-green-200 rounded-2xl p-8">
                <h3 className="flex items-center gap-2 font-bold text-lg text-primary-container mb-5">
                  <span className="material-symbols-outlined text-green-600">check_circle</span>
                  This is for you if
                </h3>
                <ul className="space-y-4">
                  {AUDIENCE_YES.map((item) => (
                    <li key={item} className="flex gap-3 text-on-surface leading-relaxed">
                      <span className="material-symbols-outlined text-green-600 text-[20px] mt-0.5 shrink-0">done</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-8">
                <h3 className="flex items-center gap-2 font-bold text-lg text-primary-container mb-5">
                  <span className="material-symbols-outlined text-error">cancel</span>
                  This is not for you if
                </h3>
                <ul className="space-y-4">
                  {AUDIENCE_NO.map((item) => (
                    <li key={item} className="flex gap-3 text-on-surface-variant leading-relaxed">
                      <span className="material-symbols-outlined text-error text-[20px] mt-0.5 shrink-0">close</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------- 5 · CURRICULUM ------------------------ */}
        <section id="curriculum" className="py-24 bg-surface-container-low border-y border-outline-variant/20 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6 reveal-on-scroll">
            <SectionHeading
              eyebrow="The curriculum"
              title="8 weeks. 7 skill tracks. Beginner to advanced."
              sub="Tap any track to see every topic covered inside it."
            />
            <div className="space-y-4">
              {TRACKS.map((track, i) => (
                <TrackAccordion key={track.id} track={track} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------- 6 · PROJECTS ------------------------- */}
        <section id="projects" className="py-24 bg-surface scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6 reveal-on-scroll">
            <SectionHeading
              eyebrow="Projects"
              title="A portfolio, not a certificate"
              sub="3 mini projects to build the muscle, then 4 major ones that become your interview material."
            />

            <div className="grid md:grid-cols-3 gap-5 mb-14">
              {MINI_PROJECTS.map((p, i) => (
                <div key={p.title} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
                  <span className="text-xs font-bold text-secondary tracking-wider">MINI {i + 1}</span>
                  <h3 className="mt-2 font-bold text-primary-container leading-snug">{p.title}</h3>
                  <p className="mt-2.5 text-sm text-on-surface-variant leading-relaxed">{p.body}</p>
                  <p className="mt-4 text-xs text-outline">{p.skills}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {MAJOR_PROJECTS.map((p, i) => (
                <div
                  key={p.title}
                  className="relative bg-primary-container text-white rounded-3xl p-8 overflow-hidden group"
                >
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-secondary/25 rounded-full blur-3xl group-hover:bg-secondary/40 transition-colors" />
                  <div className="relative">
                    <span className="text-xs font-bold text-secondary-container tracking-wider">
                      MAJOR PROJECT {i + 1}
                    </span>
                    <h3 className="mt-2 text-2xl font-bold leading-snug">{p.title}</h3>
                    <p className="mt-3 text-white/70 leading-relaxed">{p.body}</p>
                    <div className="mt-5 pt-5 border-t border-white/15 flex items-start gap-2 text-sm text-white/80">
                      <span className="material-symbols-outlined text-[18px] text-secondary-container shrink-0">
                        inventory_2
                      </span>
                      {p.deliverable}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------ 7 · LIVE SESSIONS ----------------------- */}
        <section className="py-24 bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6 reveal-on-scroll">
            <SectionHeading
              eyebrow="Live weekend sessions"
              title="Every Saturday & Sunday. Live. With a human."
            />

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {[
                {
                  day: "Saturday",
                  icon: "cast_for_education",
                  title: "Concept + live build",
                  body: "A new topic taught by working through a real dataset on screen — you follow along, not watch a slide deck.",
                },
                {
                  day: "Sunday",
                  icon: "groups",
                  title: "Project lab + doubt clearing",
                  body: "You build, we review, and every question gets answered. No question is too basic.",
                },
              ].map((s) => (
                <div key={s.day} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-secondary text-3xl">{s.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">{s.day}</span>
                  </div>
                  <h3 className="font-bold text-xl text-primary-container">{s.title}</h3>
                  <p className="mt-2 text-on-surface-variant leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {[
                { icon: "schedule", label: "Batch timing", value: BATCH.timing },
                { icon: "calendar_month", label: "Duration", value: "8 weeks, 16 live sessions" },
                { icon: "translate", label: "Language", value: BATCH.language },
                { icon: "hourglass_top", label: "Enrolment", value: "Closing soon" },
              ].map((m) => (
                <div key={m.label} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5">
                  <span className="material-symbols-outlined text-secondary text-[22px]">{m.icon}</span>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{m.label}</p>
                  <p className="mt-1 font-semibold text-primary-container text-sm leading-snug">{m.value}</p>
                </div>
              ))}
            </div>

            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-4xl">
              {[
                "Live teaching, never a pre-recorded replay",
                "Screen-share project building you can code along with",
                "Open doubt-solving in every session",
                "Code, datasets and notes shared after every class",
                "Full recording of every session, so a missed weekend doesn’t set you back",
                "A private community group for the days in between",
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-on-surface leading-relaxed">
                  <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5 shrink-0">check</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ------------------------ 8 · CAREER LAUNCHPAD -------------------- */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6 reveal-on-scroll">
            <SectionHeading
              eyebrow="Career launchpad"
              title="The part every other course leaves out"
              sub="Learning the tools gets you competent. This gets you hired."
            />
            <div className="grid md:grid-cols-2 gap-6">
              {CAREER_BLOCKS.map((block) => (
                <div key={block.title} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">{block.icon}</span>
                    </div>
                    <h3 className="font-bold text-lg text-primary-container">{block.title}</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm text-on-surface-variant leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------- 9 · WHAT YOU GET ----------------------- */}
        <section className="py-24 bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-5xl mx-auto px-6 reveal-on-scroll">
            <SectionHeading eyebrow="What you get" title="Everything included, one price" />
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden">
              {INCLUDED.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-4 px-7 py-4 border-b border-outline-variant/20"
                >
                  <span className="text-on-surface">{item}</span>
                  <span className="material-symbols-outlined text-green-600 shrink-0">check_circle</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 px-7 py-6 bg-primary-container text-white">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl">₹{PRICE.now.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------- 10 · COMPARISON ----------------------- */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6 reveal-on-scroll">
            <SectionHeading
              eyebrow="Comparison"
              title="How InsightNest compares to the big institutes"
              sub="Category ranges, drawn from publicly reported 2026 market data. Verify current pricing on each provider’s own site."
            />

            <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
              <table className="w-full text-sm min-w-[52rem]">
                <thead>
                  <tr className="border-b border-outline-variant/30">
                    <th className="text-left font-semibold text-on-surface-variant px-5 py-4 w-56"> </th>
                    <th className="text-left font-bold text-white px-5 py-4 bg-primary-container">InsightNest</th>
                    {COMPARISON.columns.map((c) => (
                      <th key={c} className="text-left font-semibold text-on-surface-variant px-5 py-4">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.rows.map((row) => (
                    <tr key={row.label} className="border-b border-outline-variant/15 last:border-0">
                      <td className="px-5 py-3.5 font-semibold text-primary-container">{row.label}</td>
                      <td className="px-5 py-3.5 font-bold text-secondary bg-secondary/5">{row.ours}</td>
                      {row.others.map((cell, i) => (
                        <td key={i} className="px-5 py-3.5 text-on-surface-variant">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 max-w-3xl border-l-4 border-secondary bg-surface-container-low rounded-r-2xl px-7 py-6">
              <p className="text-on-surface leading-relaxed">
                The big programs are good, and expensive: often 20–100× the cost and 3–6× the time. Much of
                that goes into brand marketing and large sales teams.
              </p>
              <p className="mt-3 text-on-surface leading-relaxed">
                InsightNest keeps what gets you hired: the same skill stack, real projects, live teaching and
                career support, in 2 months for ₹{PRICE.now.toLocaleString("en-IN")}.
              </p>
            </div>
          </div>
        </section>

        {/* --------------------------- 11 · PRICING ------------------------- */}
        <div id="pricing" className="scroll-mt-20">
          <CourseEnrollmentSection courseSlug="data-analyst" />
        </div>

        <div className="bg-surface py-10 text-center px-6">
          <p className="text-on-surface-variant">
            That’s <span className="font-bold text-primary-container">₹{Math.round(PRICE.now / 16)} per live session</span>{" "}
            — less than a single hour with a private tutor.
          </p>
        </div>

        {/* ------------------------- 12 · CREDIBILITY ----------------------- */}
        <section className="py-24 bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-4xl mx-auto px-6 text-center reveal-on-scroll">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary mb-3">
              Track record
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-container tracking-tight text-balance">
              487+ students have already learned with us
            </h2>
            <p className="mt-5 text-lg text-on-surface-variant leading-relaxed">
              This is the version we arrived at after teaching hundreds of learners: tightened around what
              actually got people interviews.
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-4 text-left">
              {[
                {
                  icon: "school",
                  title: "Taught, not theorised",
                  body: "Every track has been run with real students and revised from their questions.",
                },
                {
                  icon: "group",
                  title: "Small live batches",
                  body: "Kept deliberately small so doubt-solving stays direct.",
                },
                {
                  icon: "forum",
                  title: "Direct instructor access",
                  body: "You ask the person teaching, not a support ticket queue.",
                },
              ].map((b) => (
                <div key={b.title} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
                  <span className="material-symbols-outlined text-secondary">{b.icon}</span>
                  <h3 className="mt-2 font-bold text-primary-container">{b.title}</h3>
                  <p className="mt-1 text-sm text-on-surface-variant leading-relaxed">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------- 13 · FAQ --------------------------- */}
        <section id="faq" className="py-24 bg-surface scroll-mt-24">
          <div className="max-w-4xl mx-auto px-6 reveal-on-scroll">
            <SectionHeading eyebrow="FAQ" title="Questions people actually ask" />
            <div>
              {FAQS.map((item) => (
                <Faq key={item.q} item={item} />
              ))}
            </div>

            <div className="mt-10 bg-surface-container-low rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-primary-container">Still have a question?</p>
                <p className="text-sm text-on-surface-variant">We usually reply within a few hours.</p>
              </div>
              <a
                href={BATCH.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                Talk to us on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* -------------------------- 14 · FINAL CTA ------------------------ */}
        <section className="relative overflow-hidden bg-primary-container text-white py-24">
          <div className="absolute -top-32 left-1/3 w-[34rem] h-[34rem] bg-secondary/25 rounded-full blur-[130px] pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] text-balance">
              Two months from now, you’ll either have a portfolio or another excuse.
            </h2>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">
              {BATCH.enrolmentNote}. Sixteen live sessions, seven projects, one career plan.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <span className="text-2xl text-white/40 line-through">₹{PRICE.was.toLocaleString("en-IN")}</span>
              <span className="text-5xl font-bold">₹{PRICE.now.toLocaleString("en-IN")}</span>
            </div>
            <p className="mt-2 text-white/60 text-sm">Everything included.</p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#pricing"
                className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-bold text-lg hover:bg-secondary/90 transition-all btn-press shadow-lg shadow-secondary/25"
              >
                Enroll Now
              </a>
              <a
                href={BATCH.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/25 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Talk to Us on WhatsApp
              </a>
            </div>

            <p className="mt-8 text-sm text-white/50">
              Questions? {BATCH.whatsapp} ·{" "}
              <a href={`mailto:${BATCH.email}`} className="underline hover:text-white">
                {BATCH.email}
              </a>
            </p>
          </div>
        </section>
      </main>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary-container">₹{PRICE.now.toLocaleString("en-IN")}</span>
            <span className="text-sm text-outline line-through">₹{PRICE.was.toLocaleString("en-IN")}</span>
          </div>
          <p className="text-[11px] text-on-surface-variant">Everything included</p>
        </div>
        <a
          href="#pricing"
          className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold text-sm shadow-md btn-press"
        >
          Enroll Now
        </a>
      </div>

      {/* Footer */}
      <footer className="bg-surface-container-low text-on-surface-variant py-16 border-t border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center">
              <Logo variant="img2" className="h-14 w-auto" />
            </Link>
            <p className="text-sm max-w-sm">
              Live, project-first data analytics training. Built for people switching careers on weekends.
            </p>
            <div className="text-sm space-y-1 pt-2">
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">chat</span>
                {BATCH.whatsapp}
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">mail</span>
                <a href={`mailto:${BATCH.email}`} className="hover:text-secondary transition-colors">
                  {BATCH.email}
                </a>
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-on-surface font-bold mb-4">Program</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#curriculum" className="hover:text-secondary transition-colors">Curriculum</a></li>
              <li><a href="#projects" className="hover:text-secondary transition-colors">Projects</a></li>
              <li><a href="#pricing" className="hover:text-secondary transition-colors">Pricing</a></li>
              <li><a href="#faq" className="hover:text-secondary transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-on-surface font-bold mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-secondary transition-colors">Terms &amp; Refunds</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-outline-variant/30 text-sm">
          <p>&copy; 2026 InsightNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
