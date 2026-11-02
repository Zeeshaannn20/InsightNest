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
  CAREER_CASE,
  COURSES,
  COMPARISON,
  DIFFERENTIATORS,
  FAQS,
  MAJOR_PROJECTS,
  MINI_PROJECTS,
  PRICE,
  STATS,
  TESTIMONIALS,
  TRACKS,
} from "@/lib/landing-content";

const price = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/* ---------------------------------- bits --------------------------------- */

// Each of the five screens is at least one viewport tall (less the 5rem
// navbar), so the page reads as five scrolls, each ending in a CTA.
const SCREEN = "min-h-[calc(100svh-5rem)] flex flex-col justify-center py-16 md:py-20 scroll-mt-20";

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="max-w-3xl mb-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3 text-secondary">{eyebrow}</p>
      <h2 className="text-3xl md:text-[2.6rem] font-bold tracking-tight leading-[1.15] text-balance text-primary-container">
        {title}
      </h2>
      {sub && <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">{sub}</p>}
    </div>
  );
}

/** The call to action that closes every screen. */
function CtaBand({
  title,
  sub,
  primary = `Enroll Now for ${price(PRICE.now)}`,
  href = "#pricing",
}: {
  title: string;
  sub: string;
  primary?: string;
  href?: string;
}) {
  return (
    <div className="mt-12 relative overflow-hidden rounded-3xl bg-primary-container text-white px-6 py-8 md:px-10 md:py-9 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div className="absolute -top-24 -right-16 w-72 h-72 bg-secondary/30 rounded-full blur-[90px] pointer-events-none" />
      <div className="relative">
        <p className="text-xl md:text-2xl font-bold leading-snug text-balance">{title}</p>
        <p className="mt-1.5 text-white/65">{sub}</p>
      </div>
      <div className="relative flex flex-wrap gap-3 shrink-0">
        <a
          href={href}
          className="bg-secondary text-on-secondary px-6 py-3.5 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-lg shadow-secondary/25"
        >
          {primary}
        </a>
        <a
          href={BATCH.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-white/25 px-6 py-3.5 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">chat</span>
          WhatsApp us
        </a>
      </div>
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
        className="w-full flex items-start justify-between gap-6 py-4 text-left group"
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
      {open && <p className="pb-5 -mt-1 text-on-surface-variant leading-relaxed animate-slide-down">{item.a}</p>}
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */

export default function DataAnalystCoursePage() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const track = TRACKS[trackIndex];

  // A menu left open while the page scrolls behind it is disorienting, so the
  // body is locked for as long as it is showing.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
        offerEnds={BATCH.enrolmentCloseIso}
      />
      <FaqJsonLd faqs={FAQS} />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo variant="img1" className="h-16 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#courses" className="text-on-surface hover:text-secondary font-medium transition-colors">Courses</a>
            <a href="#curriculum" className="text-on-surface hover:text-secondary font-medium transition-colors">Curriculum</a>
            <a href="#projects" className="text-on-surface hover:text-secondary font-medium transition-colors">Projects</a>
            <a href="#pricing" className="text-on-surface hover:text-secondary font-medium transition-colors">Pricing</a>
            <a href="#faq" className="text-on-surface hover:text-secondary font-medium transition-colors">FAQ</a>
                        <Link href="/articles" className="hidden lg:block text-on-surface hover:text-secondary font-medium transition-colors">Articles</Link>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/login" className="text-on-surface hover:text-secondary font-medium transition-colors hidden md:block">Login</Link>
            <a href="#courses" className="inline-flex items-center min-h-11 whitespace-nowrap bg-secondary text-on-secondary px-4 md:px-5 py-2 rounded-full font-semibold hover:bg-secondary/90 transition-all btn-press shadow-md text-sm md:text-base">
              Enroll Now
            </a>

            {/* Without this the only things reachable on a phone were the logo
                and Enroll Now — an existing student had no way to sign in. */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="md:hidden w-11 h-11 -mr-2 flex items-center justify-center text-on-surface rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[26px]">
                {menuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-outline-variant/30 bg-surface animate-slide-down">
            <div className="px-6 py-3 flex flex-col">
              {[
                { href: "#courses", label: "Courses" },
                { href: "#curriculum", label: "Curriculum" },
                { href: "#projects", label: "Projects" },
                { href: "#pricing", label: "Pricing" },
                { href: "#faq", label: "FAQ" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3.5 text-on-surface font-medium border-b border-outline-variant/20 active:text-secondary"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/courses/product-management"
                onClick={() => setMenuOpen(false)}
                className="py-3.5 text-on-surface font-medium border-b border-outline-variant/20 active:text-secondary"
              >
                Product Management
              </Link>
              <Link
                href="/articles"
                onClick={() => setMenuOpen(false)}
                className="py-3.5 text-on-surface font-medium border-b border-outline-variant/20 active:text-secondary"
              >
                Articles
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-3 mb-2 py-3 text-center rounded-xl border border-outline-variant font-semibold text-primary-container active:bg-surface-container-low"
              >
                Log in to your dashboard
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* pb-28 clears the ~70px sticky price bar with room to spare; without
          it the footer sits underneath and the last links are untappable. */}
      <main className="pt-20 pb-28 md:pb-0">
        {/* ------------------------- SCREEN 1 · HERO ------------------------ */}
        <section id="courses" className={`relative overflow-hidden bg-primary-container text-white ${SCREEN} max-md:py-6!`}>
          <div className="absolute -top-40 -right-32 w-[36rem] h-[36rem] bg-secondary/30 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-52 -left-20 w-[30rem] h-[30rem] bg-secondary-container/20 rounded-full blur-[130px] pointer-events-none" />

          {/* On a phone the cards come before the numbers, so both courses are seen first. */}
          <div className="relative w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-8 lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live weekend batch · {BATCH.enrolmentNote}
                </div>
                <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight leading-[1.08] text-balance">
                  Two live courses. Pick your path into data or product.
                </h1>
                <p className="hidden md:block mt-4 text-lg text-white/75 leading-relaxed max-w-2xl">
                  Learn live on weekends, build a real portfolio and get career support. {price(PRICE.now)} per course.
                </p>
              </div>

              <div className="order-last lg:order-none grid grid-cols-4 gap-3 lg:pb-1">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums">{s.value}</p>
                    <p className="mt-0.5 text-[11px] md:text-xs text-white/70 leading-snug">{s.label}</p>
                  </div>
                ))}
              </div>

            <div className="lg:col-span-2 grid md:grid-cols-2 gap-4 md:gap-5">
              {COURSES.map((c) => (
                <div
                  key={c.name}
                  className="flex flex-col bg-white/10 border border-white/15 rounded-3xl p-5 md:p-7 backdrop-blur-md shadow-2xl"
                >
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary-container">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{c.icon}</span>
                    {c.tag}
                  </div>
                  <h2 className="mt-2 md:mt-3 text-xl md:text-2xl font-bold leading-snug text-balance">{c.name}</h2>
                  <p className="hidden md:block mt-2 text-sm text-white/75 leading-relaxed">{c.summary}</p>
                  <ul className="hidden md:block mt-4 mb-6 space-y-2 text-sm">
                    {c.points.map((point) => (
                      <li key={point} className="flex items-center gap-2.5 text-white/85">
                        <span className="material-symbols-outlined text-[18px] text-green-400" aria-hidden="true">check_circle</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 md:mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <p className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-3xl font-bold tracking-tight">{price(PRICE.now)}</span>
                      <span className="text-white/60 line-through">{price(PRICE.was)}</span>
                    </p>
                    <div className="flex items-center gap-4">
                      <Link href={c.curriculumHref} className="py-3 text-sm font-semibold text-white/85 underline underline-offset-4 hover:text-white">
                        Curriculum
                      </Link>
                      <Link
                        href={c.enrollHref}
                        className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-lg shadow-secondary/25"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------- WHY THESE SKILLS ----------------------- */}
        <section id="why-these-skills" className="bg-surface-container-low py-16 md:py-20 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeading
              eyebrow="Why these skills"
              title="Why learn this, and what does it pay?"
              sub="Both careers reward people who can use evidence to make better business decisions. Here is what each one offers."
            />
            <div className="grid md:grid-cols-2 gap-5">
              {CAREER_CASE.map((c) => (
                <div key={c.field} className="flex flex-col bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-7">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined" aria-hidden="true">{c.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-primary-container">{c.field}</h3>
                  </div>
                  <ul className="mt-5 mb-6 space-y-3">
                    {c.why.map((line) => (
                      <li key={line} className="flex gap-2.5 text-sm text-on-surface leading-relaxed">
                        <span className="material-symbols-outlined text-[18px] leading-5 text-secondary shrink-0" aria-hidden="true">check</span>
                        {line}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Typical market pay in India</p>
                    <dl className="grid grid-cols-3 gap-2">
                      {c.pay.map((row) => (
                        <div key={row.level} className="bg-surface-container-low rounded-xl p-3">
                          <dt className="text-xs text-on-surface-variant leading-snug">{row.level}</dt>
                          <dd className="mt-1 text-sm md:text-base font-bold text-primary-container leading-snug">{row.range}</dd>
                        </div>
                      ))}
                    </dl>
                    {c.note && <p className="mt-3 text-xs text-on-surface-variant leading-relaxed">{c.note}</p>}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-on-surface-variant leading-relaxed max-w-4xl">
              Approximate market ranges from 2026 salary guides citing Glassdoor. Pay varies by city, company and experience. These
              are general market figures, not InsightNest student results or a promise of any job or salary.
            </p>
          </div>
        </section>

        {/* -------------------------- SCREEN 2 · WHY ------------------------ */}
        <section className={`bg-surface ${SCREEN}`}>
          <div className="w-full max-w-7xl mx-auto px-6 reveal-on-scroll">
            <SectionHeading
              eyebrow="Why InsightNest"
              title="Most people don’t fail at learning analytics. They fail at finishing."
              sub="Recorded courses leave you with half-finished videos and no answer to the question every interviewer asks:"
            />

            <blockquote className="max-w-3xl border-l-4 border-secondary bg-surface-container-low rounded-r-2xl px-7 py-5 mb-10">
              <p className="text-lg md:text-xl font-medium text-primary-container leading-snug italic">
                “Walk me through a project you built and the business decision it changed.”
              </p>
            </blockquote>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {DIFFERENTIATORS.map((d, i) => (
                <div
                  key={d.title}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 hover:shadow-card transition-shadow"
                >
                  <div className="w-11 h-11 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined">{d.icon}</span>
                  </div>
                  <p className="mt-4 text-xs font-bold text-secondary tracking-wider">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 font-bold text-primary-container leading-snug">{d.title}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">{d.body}</p>
                </div>
              ))}
            </div>

            <CtaBand
              title="Stop starting over. Finish this time."
              sub={`Live classes, real projects and career support for ${price(PRICE.now)}.`}
            />
          </div>
        </section>

        {/* ------------------- SOCIAL PROOF · TESTIMONIALS ------------------ */}
        <section className="bg-surface-container-low py-16 md:py-20 border-b border-outline-variant/20">
          <div className="w-full max-w-7xl mx-auto px-6 reveal-on-scroll">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <SectionHeading
                eyebrow="Student stories"
                title="Real people. Real switches."
              />
              <div className="flex items-center gap-2 shrink-0 mb-10">
                {[1,2,3,4,5].map((s) => (
                  <span key={s} className="material-symbols-outlined text-[20px] filled text-amber-400">star</span>
                ))}
                <span className="text-sm font-semibold text-on-surface-variant ml-1">{STATS[0].value} students taught</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 flex flex-col gap-4 hover:shadow-card transition-shadow"
                >
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className="material-symbols-outlined text-[16px] filled text-amber-400">star</span>
                    ))}
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed flex-1">“{t.quote}”</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/20">
                    <div className="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-sm shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-primary-container">{t.name}</p>
                      <p className="text-[11px] text-on-surface-variant leading-snug">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------- SCREEN 3 · WHAT YOU LEARN ----------------- */}
        <section id="curriculum" className={`bg-surface-container-low border-y border-outline-variant/20 ${SCREEN}`}>
          <div className="w-full max-w-7xl mx-auto px-6 reveal-on-scroll">
            <SectionHeading
              eyebrow="Data Analytics curriculum & projects"
              title="7 skill tracks. 7 portfolio projects. 8 weeks."
            />

            <Link
              href="/courses/product-management#curriculum"
              className="-mt-6 mb-8 inline-flex items-center gap-1.5 py-2 font-semibold text-secondary hover:underline"
            >
              Looking for Product Management? See its 8 modules
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_forward</span>
            </Link>

            <div className="grid lg:grid-cols-[1.25fr_1fr] gap-6">
              {/* track picker */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 md:p-7">
                <div className="flex flex-wrap gap-2" role="tablist" aria-label="Skill tracks">
                  {TRACKS.map((t, i) => (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={i === trackIndex}
                      onClick={() => setTrackIndex(i)}
                      className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                        i === trackIndex
                          ? "text-white border-transparent"
                          : "border-outline-variant/50 text-on-surface-variant hover:text-primary-container"
                      }`}
                      style={i === trackIndex ? { background: t.hue } : undefined}
                    >
                      {t.name.replace(" for Analysts", "").replace(" & Communication", "")}
                    </button>
                  ))}
                </div>

                <div key={track.id} className="mt-6 animate-slide-down" role="tabpanel">
                  <p className="font-bold text-lg text-primary-container">{track.name}</p>
                  <p className="text-sm text-on-surface-variant">{track.summary}</p>
                  <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-5">
                    {track.groups.map((group) => (
                      <div key={group.heading}>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                          {group.heading}
                        </h4>
                        <ul className="space-y-1.5">
                          {group.items.slice(0, 4).map((item) => (
                            <li key={item} className="flex gap-2 text-sm text-on-surface leading-relaxed">
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
                </div>
              </div>

              {/* projects */}
              <div id="projects" className="scroll-mt-24 bg-primary-container text-white rounded-3xl p-6 md:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary-container">
                  A portfolio, not a certificate
                </p>
                <ul className="mt-4 divide-y divide-white/10">
                  {MAJOR_PROJECTS.map((p, i) => (
                    <li key={p.title} className="py-3.5">
                      <p className="text-[11px] font-bold text-white/50 tracking-wider">MAJOR {i + 1}</p>
                      <p className="font-bold leading-snug">{p.title}</p>
                      <p className="mt-0.5 text-sm text-white/60">{p.deliverable}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 pt-4 border-t border-white/10 text-sm text-white/70">
                  + {MINI_PROJECTS.length} mini projects: {MINI_PROJECTS.map((p) => p.title).join(", ")}.
                </p>
              </div>
            </div>

            <CtaBand
              title="Start building your portfolio this weekend."
              sub="Every tool is taught inside a real business problem."
            />
          </div>
        </section>

        {/* ---------------------- SCREEN 4 · HOW IT WORKS ------------------- */}
        <section className={`bg-surface ${SCREEN}`}>
          <div className="w-full max-w-7xl mx-auto px-6 reveal-on-scroll">
            <SectionHeading
              eyebrow="Live weekends + career launchpad"
              title="Learn live on weekends. Leave ready to get hired."
            />

            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
              <div className="bg-surface-container-low rounded-3xl p-6 md:p-7 space-y-5">
                {[
                  { icon: "cast_for_education", day: "Saturday", title: "Concept + live build on a real dataset" },
                  { icon: "groups", day: "Sunday", title: "Project lab + open doubt clearing" },
                ].map((s) => (
                  <div key={s.day} className="flex gap-4">
                    <span className="material-symbols-outlined text-secondary text-3xl">{s.icon}</span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">{s.day}</p>
                      <p className="font-bold text-primary-container">{s.title}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-5 border-t border-outline-variant/30 grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: "Timing", value: BATCH.timing },
                    { label: "Language", value: BATCH.language },
                    { label: "Duration", value: "8 weeks, 16 sessions" },
                    { label: "Missed a class?", value: "Lifetime recordings" },
                  ].map((m) => (
                    <div key={m.label}>
                      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{m.label}</p>
                      <p className="mt-0.5 font-semibold text-primary-container leading-snug">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {CAREER_BLOCKS.map((block) => (
                  <div
                    key={block.title}
                    className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">{block.icon}</span>
                      </div>
                      <h3 className="font-bold text-primary-container">{block.title}</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {block.items.slice(0, 3).map((item) => (
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

            <CtaBand
              title={`Live classes, projects and career prep. All for ${price(PRICE.now)}.`}
              sub={`That’s ${price(Math.round(PRICE.now / 16))} per live session, less than an hour with a private tutor.`}
              primary="Claim My Seat"
            />
          </div>
        </section>

        {/* ------------------- WHO IS THIS FOR + COMPARISON ----------------- */}
        <section className={`bg-surface ${SCREEN}`}>
          <div className="w-full max-w-7xl mx-auto px-6 reveal-on-scroll">
            <SectionHeading
              eyebrow="Is this right for you?"
              title="Built for career-switchers on weekends. Not for everyone."
            />

            <div className="grid md:grid-cols-2 gap-5 mb-12">
              {/* Good fit */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  </span>
                  <p className="font-bold text-primary-container">This is for you if</p>
                </div>
                <ul className="space-y-3">
                  {AUDIENCE_YES.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-on-surface leading-relaxed">
                      <span className="material-symbols-outlined text-[18px] text-green-600 shrink-0 mt-0.5">check</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bad fit */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                  </span>
                  <p className="font-bold text-primary-container">This is NOT for you if</p>
                </div>
                <ul className="space-y-3">
                  {AUDIENCE_NO.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-on-surface leading-relaxed">
                      <span className="material-symbols-outlined text-[18px] text-red-500 shrink-0 mt-0.5">close</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-5 border-t border-outline-variant/20 bg-surface rounded-xl p-4">
                  <p className="text-sm text-on-surface-variant">
                    <span className="font-semibold text-primary-container">Still unsure?</span>{" "}
                    Message us on WhatsApp — we’ll be honest about whether this is the right fit.
                  </p>
                  <a
                    href={BATCH.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Comparison table */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary mb-5">
                How we compare
              </p>
              <div className="overflow-x-auto rounded-2xl border border-outline-variant/30">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="bg-primary-container text-white">
                      <th className="text-left px-5 py-3.5 font-semibold rounded-tl-2xl">Feature</th>
                      <th className="px-4 py-3.5 font-bold text-secondary-container">InsightNest</th>
                      {COMPARISON.columns.map((col, i) => (
                        <th
                          key={col}
                          className={`px-4 py-3.5 font-medium text-white/60 ${i === COMPARISON.columns.length - 1 ? "rounded-tr-2xl" : ""}`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.rows.map((row, ri) => (
                      <tr
                        key={row.label}
                        className={ri % 2 === 0 ? "bg-surface-container-lowest" : "bg-surface-container-low"}
                      >
                        <td className="px-5 py-3 font-medium text-primary-container">{row.label}</td>
                        <td className="px-4 py-3 text-center font-semibold text-secondary">{row.ours}</td>
                        {row.others.map((val, i) => (
                          <td key={i} className="px-4 py-3 text-center text-on-surface-variant">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <CtaBand
              title="The most affordable full-stack analytics program in India."
              sub={`${price(PRICE.now)} for everything listed above. No EMI, no loan, no hidden fee.`}
            />
          </div>
        </section>

        {/* ---------------------- SCREEN 5 · ENROL + FAQ -------------------- */}
        <section className="bg-surface-container-low border-t border-outline-variant/20">
          <div id="pricing" className="scroll-mt-20">
            <CourseEnrollmentSection courseSlug="data-analyst" />
          </div>

          <div id="faq" className="scroll-mt-24 max-w-7xl mx-auto px-6 pb-20">
            <div className="grid lg:grid-cols-[1fr_1.6fr] gap-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3 text-secondary">FAQ</p>
                <h2 className="text-3xl font-bold tracking-tight text-primary-container text-balance">
                  Questions people actually ask
                </h2>
                <p className="mt-3 text-on-surface-variant">
                  Still unsure? Message us and we usually reply within a few hours.
                </p>
              </div>
              <div>
                {FAQS.map((item) => (
                  <Faq key={item.q} item={item} />
                ))}
              </div>
            </div>

            <CtaBand
              title="Two months from now, you’ll either have a portfolio or another excuse."
              sub={`${BATCH.enrolmentNote}. One payment, everything included.`}
            />
          </div>
        </section>
      </main>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary-container">{price(PRICE.now)}</span>
            <span className="text-sm text-outline line-through">{price(PRICE.was)}</span>
          </div>
          <p className="text-[11px] text-on-surface-variant">2 courses · per course</p>
        </div>
        <a
          href="#courses"
          className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold text-sm shadow-md btn-press"
        >
          Choose Course
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
              Live, project-first training in data analytics and product management. Built for people switching careers on weekends.
            </p>
            <div className="text-sm space-y-1 pt-2">
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">chat</span>
                {BATCH.whatsapp}
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">mail</span>
                <a href={`mailto:${BATCH.email}`} className="inline-block py-1.5 hover:text-secondary transition-colors">
                  {BATCH.email}
                </a>
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-on-surface font-bold mb-4">Program</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#curriculum" className="inline-block py-1.5 hover:text-secondary transition-colors">Curriculum</a></li>
              <li><a href="#projects" className="inline-block py-1.5 hover:text-secondary transition-colors">Projects</a></li>
              <li><a href="#pricing" className="inline-block py-1.5 hover:text-secondary transition-colors">Pricing</a></li>
              <li><a href="#faq" className="inline-block py-1.5 hover:text-secondary transition-colors">FAQ</a></li>
              <li><Link href="/courses/product-management" className="inline-block py-1.5 hover:text-secondary transition-colors">Product Management</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-on-surface font-bold mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="inline-block py-1.5 hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="inline-block py-1.5 hover:text-secondary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="inline-block py-1.5 hover:text-secondary transition-colors">Terms &amp; Refunds</Link></li>
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
