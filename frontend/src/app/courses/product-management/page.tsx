import type { Metadata } from "next";
import CourseEnrollmentSection from "@/components/CourseEnrollmentSection";
import { CourseHero, FaqList, Instructor, MentorSessionBanner, SectionHeading, SiteShell } from "@/components/CourseParts";
import { CourseJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { BATCH, PM_FAQS, PM_MODULES, PRICE } from "@/lib/landing-content";
import { pageMeta } from "@/lib/site";

const NAME = "Product Management with Generative AI";
const DESCRIPTION =
  "Learn product strategy, user research, PRDs, Agile, metrics and launch in 8 modules, using generative AI and ending in a capstone. ₹2,999.";

export const metadata: Metadata = pageMeta("Product Management Course with Generative AI", DESCRIPTION, "/courses/product-management");

export default function ProductManagementCoursePage() {
  return (
    <SiteShell enrollHref="#enrollment">
      <CourseJsonLd
        name={NAME}
        description={DESCRIPTION}
        path="/courses/product-management"
        price={PRICE.now}
        durationWeeks={8}
        topics={PM_MODULES.map((m) => m.title)}
        offerEnds={BATCH.enrolmentCloseIso}
      />
      <FaqJsonLd faqs={PM_FAQS} />

      <CourseHero
        title={NAME}
        sub="Go from market research and user discovery to PRDs, product metrics and launch. Taught live by top-class industry instructors, using AI to build and present an end-to-end capstone."
        points={[`${PM_MODULES.length} modules`, "Hands-on with Figma and Jira", "AI for product work", "End-to-end capstone"]}
      />

      <section id="curriculum" className="py-16 md:py-20 bg-surface scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow="Curriculum" title={`${PM_MODULES.length} modules, from first idea to product launch`} />
          <div className="grid md:grid-cols-2 gap-5">
            {PM_MODULES.map((m, i) => (
              <div key={m.title} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
                <p className="text-xs font-bold text-secondary tracking-wider">MODULE {String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 text-lg font-bold text-primary-container leading-snug">{m.title}</h3>
                <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <Instructor />
        </div>
      </section>

      <MentorSessionBanner />
      <CourseEnrollmentSection courseSlug="product-management" />

      <section id="faq" className="py-16 md:py-20 bg-surface-container-low scroll-mt-20">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeading eyebrow="FAQ" title="Product Management course questions" />
          <FaqList faqs={PM_FAQS} />
        </div>
      </section>
    </SiteShell>
  );
}
