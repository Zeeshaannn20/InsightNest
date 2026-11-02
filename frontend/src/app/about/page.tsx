import type { Metadata } from "next";
import Link from "next/link";
import { Instructor, SiteShell } from "@/components/CourseParts";
import { COURSES } from "@/lib/landing-content";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "About InsightNest and Our Instructors",
  "InsightNest offers live weekend courses in data analytics and product management, taught by top-class instructors from the industry.",
  "/about"
);

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="hero-gradient py-16 md:py-20 border-b border-outline-variant/20">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-container">About InsightNest</h1>
          <p className="mt-5 text-lg md:text-xl text-on-surface-variant leading-relaxed">
            InsightNest teaches practical data and product skills through live weekend classes, real projects and career support.
          </p>
        </div>
      </section>
      <section className="py-16 bg-surface">
        <div className="max-w-5xl mx-auto px-6 grid gap-10">
          <Instructor />
          <div>
            <h2 className="text-2xl font-bold text-primary-container">Our courses</h2>
            <div className="mt-5 grid md:grid-cols-2 gap-5">
              {COURSES.map((c) => (
                <Link key={c.name} href={c.curriculumHref} className="block bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 hover:border-secondary transition-colors">
                  <h3 className="font-bold text-primary-container leading-snug">{c.name}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">{c.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
