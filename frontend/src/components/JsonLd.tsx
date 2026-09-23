import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, absoluteUrl } from "@/lib/site";

/**
 * Schema.org structured data.
 *
 * Search engines and AI answer engines read this rather than guessing at the
 * prose. It is what turns "some page about SQL" into "a course with this
 * price, these topics, this provider", which is the form a machine can quote.
 *
 * JSON.stringify is what makes this safe: the payloads below are built from
 * our own data and serialised, so no user text is interpolated into a script
 * tag as raw markup. `<` is escaped to stop a string value ever closing the
 * script element early.
 */
function Script({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function OrganizationJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        logo: absoluteUrl("/icon.png"),
        email: "support@insightnest.in",
        telephone: "+91-63667-35759",
        areaServed: "IN",
        sameAs: [] as string[],
      }}
    />
  );
}

export function CourseJsonLd({
  price,
  startDate,
  offerEnds,
  durationWeeks,
  topics,
}: {
  price: number;
  /** Omitted while enrolment is rolling and no cohort date is announced. */
  startDate?: string;
  /** ISO date the offer stops being available, i.e. when enrolment closes. */
  offerEnds?: string;
  durationWeeks: number;
  topics: string[];
}) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Course",
        "@id": `${SITE_URL}/#course`,
        name: "Complete Data Analytics Program",
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        provider: { "@type": "EducationalOrganization", name: SITE_NAME, url: SITE_URL },
        inLanguage: ["en", "hi"],
        teaches: topics,
        educationalLevel: "Beginner to Advanced",
        offers: {
          "@type": "Offer",
          price: String(price),
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          // Lets a search or answer engine say when enrolment closes rather
          // than presenting the offer as open ended.
          ...(offerEnds ? { availabilityEnds: offerEnds } : {}),
          url: `${SITE_URL}/#pricing`,
          category: "Paid",
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "Online",
          courseWorkload: `PT${durationWeeks * 10}H`,
          // Advertising a date that has already passed reads worse in a search
          // result than no date at all, so emit the field only when set.
          ...(startDate ? { startDate } : {}),
          location: { "@type": "VirtualLocation", url: SITE_URL },
        },
      }}
    />
  );
}

export function FaqJsonLd({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  image,
  publishedAt,
  updatedAt,
}: {
  title: string;
  description: string | null;
  slug: string;
  image: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
}) {
  const url = absoluteUrl(`/articles/${slug}`);
  return (
    <>
      <Script
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title,
          description: description ?? undefined,
          image: image ?? undefined,
          datePublished: publishedAt ?? undefined,
          dateModified: updatedAt ?? publishedAt ?? undefined,
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          url,
          author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            logo: { "@type": "ImageObject", url: absoluteUrl("/icon.png") },
          },
        }}
      />
      <Script
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Articles", item: absoluteUrl("/articles") },
            { "@type": "ListItem", position: 3, name: title, item: url },
          ],
        }}
      />
    </>
  );
}

export function BlogJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": `${absoluteUrl("/articles")}#blog`,
        name: `${SITE_NAME} Articles`,
        description:
          "Practical writing on data analytics: SQL, Python, Power BI, Excel and the career side of becoming an analyst.",
        url: absoluteUrl("/articles"),
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      }}
    />
  );
}
