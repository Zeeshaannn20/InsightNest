import type { Metadata } from "next";
import CourseEnrollmentSection from "@/components/CourseEnrollmentSection";
import { CourseHero, FaqList, Instructor, MentorSessionBanner, SectionHeading, SiteShell, Testimonials } from "@/components/CourseParts";
import { CourseJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { AUDIENCE_NO, AUDIENCE_YES, BATCH, CAREER_BLOCKS, COMPARISON, FAQS, MAJOR_PROJECTS, MINI_PROJECTS, PRICE, TRACKS } from "@/lib/landing-content";
import { pageMeta } from "@/lib/site";

const NAME = "Data Analytics with GenAI for Placement Bootcamp";
const DESCRIPTION =
  "Learn Excel, SQL, Python, Power BI and statistics live on weekends. Build 7 portfolio projects with career support in 8 weeks, for ₹2,999.";

export const metadata: Metadata = pageMeta("Live Data Analytics Course with GenAI", DESCRIPTION, "/courses/data-analytics");

export default function DataAnalyticsCoursePage() {
  return (
    <SiteShell enrollHref="#enrollment">
      <CourseJsonLd
        name={NAME}
        description={DESCRIPTION}
        path="/courses/data-analytics"
        price={PRICE.now}
        durationWeeks={8}
        topics={TRACKS.map((t) => t.name)}
        offerEnds={BATCH.enrolmentCloseIso}
      />
      <FaqJsonLd faqs={FAQS} />

      <CourseHero
        title={NAME}
        sub="Excel, SQL, Python, Statistics, Power BI and Data Storytelling. Taught live by top-class industry instructors and built on 7 real projects."
        note="Placement preparation covers your resume, LinkedIn, job applications and mock interviews. We do not guarantee a job."
        points={["16 live sessions over 8 weeks", "7 portfolio projects", "Lifetime recordings", "Career support included"]}
      />

      <section id="curriculum" className="py-16 md:py-20 bg-surface scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow="Curriculum" title="7 skill tracks in 8 weeks" />
          <div className="grid md:grid-cols-2 gap-5 items-start">
            {TRACKS.map((track, i) => (
              <details key={track.id} open={i === 0} className="group bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="block text-lg font-bold text-primary-container leading-snug">{track.name}</span>
                    <span className="text-sm text-on-surface-variant">{track.summary}</span>
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant transition-transform group-open:rotate-45" aria-hidden="true">add</span>
                </summary>
                {track.groups.map((group) => (
                  <div key={group.heading} className="mt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{group.heading}</h3>
                    <ul className="space-y-1.5">
                      {group.items.map((item) => (
                        <li key={item} className="flex gap-2 text-sm text-on-surface leading-relaxed">
                          <span className="material-symbols-outlined text-[18px] leading-5 shrink-0 text-secondary" aria-hidden="true">check</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="py-16 md:py-20 bg-surface-container-low scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow="Projects" title="Build a portfolio with 7 real projects" />
          <div className="grid md:grid-cols-2 gap-5">
            {MAJOR_PROJECTS.map((p, i) => (
              <div key={p.title} className="bg-primary-container text-white rounded-2xl p-6">
                <p className="text-xs font-bold text-white/70 tracking-wider">MAJOR PROJECT {i + 1}</p>
                <h3 className="mt-1 text-lg font-bold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-white/80 leading-relaxed">{p.body}</p>
                <p className="mt-3 text-sm font-semibold text-secondary-container">{p.deliverable}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid md:grid-cols-3 gap-5">
            {MINI_PROJECTS.map((p) => (
              <div key={p.title} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
                <p className="text-xs font-bold text-secondary tracking-wider">MINI PROJECT</p>
                <h3 className="mt-1 font-bold text-primary-container leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow="Career support" title="Prepare for placements, live" sub={`Live classes run on ${BATCH.timing}, in ${BATCH.language}.`} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAREER_BLOCKS.map((block) => (
              <div key={block.title} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5">
                <h3 className="font-bold text-primary-container">{block.title}</h3>
                <ul className="mt-3 space-y-1.5">
                  {block.items.map((item) => (
                    <li key={item} className="text-sm text-on-surface-variant leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6 grid gap-12">
          <Instructor />
          <div><Testimonials /></div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow="Is this right for you?" title="Built for career-switchers on weekends" />
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: "This is for you if", items: AUDIENCE_YES, icon: "check", color: "text-green-700" },
              { title: "This is not for you if", items: AUDIENCE_NO, icon: "close", color: "text-red-700" },
            ].map((list) => (
              <div key={list.title} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30">
                <h3 className="font-bold text-primary-container mb-4">{list.title}</h3>
                <ul className="space-y-3">
                  {list.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-on-surface leading-relaxed">
                      <span className={`material-symbols-outlined text-[18px] shrink-0 ${list.color}`} aria-hidden="true">{list.icon}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h3 className="mt-12 mb-4 text-xl font-bold text-primary-container">How we compare</h3>
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/30">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-primary-container text-white">
                  <th className="text-left px-5 py-3.5 font-semibold">Feature</th>
                  <th className="px-4 py-3.5 font-bold">InsightNest</th>
                  {COMPARISON.columns.map((col) => (
                    <th key={col} className="px-4 py-3.5 font-medium text-white/80">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.rows.map((row, ri) => (
                  <tr key={row.label} className={ri % 2 === 0 ? "bg-surface-container-lowest" : "bg-surface-container-low"}>
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
      </section>

      <MentorSessionBanner />
      <CourseEnrollmentSection courseSlug="data-analyst" />

      <section id="faq" className="py-16 md:py-20 bg-surface-container-low scroll-mt-20">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeading eyebrow="FAQ" title="Data Analytics course questions" />
          <FaqList faqs={FAQS} />
        </div>
      </section>
    </SiteShell>
  );
}
