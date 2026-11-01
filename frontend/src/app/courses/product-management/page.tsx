import Link from "next/link";
import Logo from "@/components/Logo";
import CourseEnrollmentSection from "@/components/CourseEnrollmentSection";
import { BATCH, PM_MODULES, PRICE } from "@/lib/landing-content";

const price = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function ProductManagementCoursePage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo variant="img1" className="h-16 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#courses" className="text-on-surface hover:text-secondary font-medium transition-colors">All Courses</Link>
            <a href="#curriculum" className="text-on-surface hover:text-secondary font-medium transition-colors">Curriculum</a>
            <a href="#enrollment" className="text-on-surface hover:text-secondary font-medium transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/login" className="text-on-surface hover:text-secondary font-medium transition-colors">Login</Link>
            <a href="#enrollment" className="bg-secondary text-on-secondary px-4 md:px-5 py-2 rounded-full font-semibold hover:bg-secondary/90 transition-all btn-press shadow-md text-sm md:text-base">
              Enroll Now
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary-container text-white py-16 md:py-24">
          <div className="absolute -top-40 -right-32 w-[36rem] h-[36rem] bg-secondary/30 rounded-full blur-[140px] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {BATCH.enrolmentNote}
              </div>
              <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] text-balance">
                Product Management with Generative AI
              </h1>
              <p className="mt-6 text-lg md:text-xl text-white/75 leading-relaxed max-w-2xl">
                Go from market research and user discovery to PRDs, product metrics and launch, then
                use AI to build and present an end-to-end capstone.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href="#enrollment"
                  className="bg-secondary text-on-secondary px-7 py-3.5 rounded-xl font-bold text-base hover:bg-secondary/90 transition-all btn-press shadow-lg shadow-secondary/25"
                >
                  Enroll Now for {price(PRICE.now)}
                </a>
                <a
                  href="#curriculum"
                  className="border border-white/25 text-white px-7 py-3.5 rounded-xl font-bold text-base hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  See Full Curriculum
                </a>
              </div>
            </div>

            {/* price card */}
            <div className="lg:justify-self-end w-full max-w-sm bg-white/10 border border-white/15 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary-container">Complete Program</p>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-5xl font-bold tracking-tight">{price(PRICE.now)}</span>
                <span className="text-xl text-white/40 line-through mb-1.5">{price(PRICE.was)}</span>
              </div>
              <div className="mt-6 space-y-3 text-sm">
                {[`${PM_MODULES.length} modules`, "Hands-on with Figma and Jira", "AI for product work", "End-to-end capstone"].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-white/85">
                    <span className="material-symbols-outlined text-[18px] text-green-400">check_circle</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section id="curriculum" className="py-16 md:py-24 bg-surface scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3 text-secondary">Curriculum</p>
            <h2 className="text-3xl md:text-[2.6rem] font-bold tracking-tight leading-[1.15] text-primary-container mb-10">
              {PM_MODULES.length} modules, from first idea to product launch
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {PM_MODULES.map((m, i) => (
                <div key={m.title} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
                  <p className="text-xs font-bold text-secondary tracking-wider">
                    MODULE {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-primary-container leading-snug">{m.title}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CourseEnrollmentSection courseSlug="product-management" />
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low text-on-surface-variant py-10 border-t border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm">
          <p>&copy; 2026 InsightNest. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-secondary transition-colors">Data Analytics</Link>
            <Link href="/about" className="hover:text-secondary transition-colors">About Us</Link>
            <Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-secondary transition-colors">Terms &amp; Refunds</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
