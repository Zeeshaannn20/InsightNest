import Link from "next/link";
import Logo from "@/components/Logo";
import { BATCH, INSTRUCTORS, PRICE, STATS, TESTIMONIALS } from "@/lib/landing-content";

const price = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
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

/** Native disclosure, so every answer stays in the HTML for search engines. */
export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div>
      {faqs.map((item) => (
        <details key={item.q} className="group border-b border-outline-variant/40">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 font-semibold text-primary-container hover:text-secondary transition-colors [&::-webkit-details-marker]:hidden">
            {item.q}
            <span className="material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
              add
            </span>
          </summary>
          <p className="pb-5 -mt-1 text-on-surface-variant leading-relaxed">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Instructor() {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-6 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-10">
      <div className="w-20 h-20 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[40px]" aria-hidden="true">school</span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Your instructors</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-container text-balance">{INSTRUCTORS.title}</h2>
        <p className="mt-3 max-w-2xl text-on-surface-variant leading-relaxed">{INSTRUCTORS.body}</p>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <>
      <SectionHeading eyebrow="Student stories" title="Real people. Real switches." />
      <div className="grid md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 flex flex-col gap-4">
            <p className="text-sm text-on-surface leading-relaxed flex-1">“{t.quote}”</p>
            <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/20">
              <div className="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-sm shrink-0" aria-hidden="true">
                {t.avatar}
              </div>
              <div>
                <p className="font-bold text-sm text-primary-container">{t.name}</p>
                <p className="text-xs text-on-surface-variant leading-snug">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function CourseHero({ title, sub, note, points }: { title: string; sub: string; note?: string; points: string[] }) {
  return (
    <section className="relative overflow-hidden bg-primary-container text-white py-12 md:py-20">
      <div className="absolute -top-40 -right-32 w-[36rem] h-[36rem] bg-secondary/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live weekend batch · {BATCH.enrolmentNote}
          </div>
          <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.08] text-balance">{title}</h1>
          <p className="mt-5 text-lg text-white/75 leading-relaxed max-w-2xl">{sub}</p>
          {note && <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-2xl">{note}</p>}
          <div className="mt-7 grid grid-cols-4 gap-3 max-w-xl">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums">{s.value}</p>
                <p className="mt-0.5 text-xs text-white/70 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:justify-self-end w-full max-w-sm bg-white/10 border border-white/15 rounded-3xl p-7 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary-container">Complete course</p>
          <p className="mt-3 flex items-end gap-3">
            <span className="text-5xl font-bold tracking-tight">{price(PRICE.now)}</span>
            <span className="text-xl text-white/60 line-through mb-1">{price(PRICE.was)}</span>
          </p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {points.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-white/85">
                <span className="material-symbols-outlined text-[18px] text-green-400" aria-hidden="true">check_circle</span>
                {item}
              </li>
            ))}
          </ul>
          <a href="#enrollment" className="mt-6 block text-center bg-secondary text-on-secondary py-3.5 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press">
            Enroll Now
          </a>
          <a href="#curriculum" className="mt-3 block py-2 text-center text-sm font-semibold text-white/85 underline underline-offset-4 hover:text-white">
            See full curriculum
          </a>
        </div>
      </div>
    </section>
  );
}

/** Nav, footer and mobile enroll bar shared by the course pages and About. */
export function SiteShell({ enrollHref = "/#courses", children }: { enrollHref?: string; children: React.ReactNode }) {
  const onCourse = enrollHref.startsWith("#");
  return (
    <div className="min-h-screen bg-background text-on-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo variant="img1" className="h-16 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/courses/data-analytics" className="text-on-surface hover:text-secondary font-medium transition-colors">Data Analytics</Link>
            <Link href="/courses/product-management" className="whitespace-nowrap text-on-surface hover:text-secondary font-medium transition-colors">Product Management</Link>
            <Link href="/articles" className="hidden lg:block text-on-surface hover:text-secondary font-medium transition-colors">Articles</Link>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/login" className="py-3 text-on-surface hover:text-secondary font-medium transition-colors">Login</Link>
            <a href={enrollHref} className="inline-flex items-center min-h-11 whitespace-nowrap bg-secondary text-on-secondary px-4 md:px-5 py-2 rounded-full font-semibold hover:bg-secondary/90 transition-all btn-press shadow-md text-sm md:text-base">
              Enroll Now
            </a>
          </div>
        </div>
      </nav>

      <main className={`pt-20 ${onCourse ? "pb-24 md:pb-0" : ""}`}>{children}</main>

      {onCourse && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 px-4 py-3 flex items-center justify-between gap-4">
          <p className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary-container">{price(PRICE.now)}</span>
            <span className="text-sm text-on-surface-variant line-through">{price(PRICE.was)}</span>
          </p>
          <a href={enrollHref} className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold text-sm shadow-md btn-press">
            Enroll Now
          </a>
        </div>
      )}

      <footer className="bg-surface-container-low text-on-surface-variant py-12 border-t border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-[2fr_1fr_1fr]">
          <div className="space-y-3 text-sm">
            <Link href="/" className="flex items-center"><Logo variant="img2" className="h-14 w-auto" /></Link>
            <p className="max-w-sm">Live training in data analytics and product management.</p>
            <p>{BATCH.whatsapp} · {BATCH.email}</p>
          </div>
          <div>
            <h3 className="text-on-surface font-bold mb-3">Courses</h3>
            <ul className="text-sm">
              <li><Link href="/courses/data-analytics" className="inline-block py-2 hover:text-secondary transition-colors">Data Analytics</Link></li>
              <li><Link href="/courses/product-management" className="inline-block py-2 hover:text-secondary transition-colors">Product Management</Link></li>
              <li><Link href="/articles" className="inline-block py-2 hover:text-secondary transition-colors">Articles</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-on-surface font-bold mb-3">Company</h3>
            <ul className="text-sm">
              <li><Link href="/about" className="inline-block py-2 hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="inline-block py-2 hover:text-secondary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="inline-block py-2 hover:text-secondary transition-colors">Terms &amp; Refunds</Link></li>
            </ul>
          </div>
        </div>
        <p className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-outline-variant/30 text-sm">&copy; 2026 InsightNest. All rights reserved.</p>
      </footer>
    </div>
  );
}
