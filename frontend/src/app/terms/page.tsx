import Link from "next/link";
import Image from "next/image";

export default function TermsAndRefundPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Navigation Bar */}
      <nav className="fixed w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-3xl">school</span>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                InsightNest
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2.5 text-on-surface hover:bg-surface-variant rounded-full font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface-container-lowest rounded-3xl p-8 md:p-12 shadow-sm border border-outline-variant/30 prose prose-slate max-w-none">
            <h1 className="text-4xl font-bold text-primary-container mb-4">Terms of Service & Refund Policy</h1>
            <p className="text-on-surface-variant mb-10"><strong>Last Updated:</strong> July 13, 2026</p>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary-container mb-6 border-b border-outline-variant/30 pb-2">Refund Policy – InsightNest</h2>
              <p className="text-on-surface mb-6">
                At InsightNest, we are committed to providing a high-quality learning experience through structured curriculum, live sessions, recorded lectures, projects, mentorship, and continuous academic support. Please read this Refund Policy carefully before purchasing any course.
              </p>

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">1. Refund Eligibility Period</h3>
              <p className="text-on-surface mb-4">
                Refund requests must be submitted within <strong>7 calendar days</strong> from the date of purchase by emailing <a href="mailto:support@insightnest.in" className="text-primary hover:underline font-bold">support@insightnest.in</a>.
              </p>
              <p className="text-on-surface">
                Refund requests submitted after the 7-day period will not be considered.
              </p>

              <hr className="my-8 border-outline-variant/30" />

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">2. Refund Eligibility</h3>
              <p className="text-on-surface mb-4">A refund request will only be considered if <strong>all</strong> of the following conditions are met:</p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface">
                <li>A significant issue exists with course access, LMS functionality, website functionality, or course delivery.</li>
                <li>The issue has been reported to InsightNest Support via email.</li>
                <li>InsightNest is unable to resolve the reported issue within <strong>48 hours</strong> of receiving complete information.</li>
                <li>The issue materially prevents the student from accessing or participating in the course.</li>
              </ul>

              <hr className="my-8 border-outline-variant/30" />

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">3. Student Responsibilities</h3>
              <p className="text-on-surface mb-4">Before requesting a refund, students are expected to:</p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface mb-4">
                <li>Report technical or academic issues promptly through the official support channels.</li>
                <li>Cooperate with the InsightNest team during troubleshooting.</li>
                <li>Follow the recommended course structure and learning path.</li>
                <li>Attend live sessions whenever possible or watch the available recordings.</li>
              </ul>
              <p className="text-on-surface">
                Failure to report issues through the official support channels may affect refund eligibility.
              </p>

              <hr className="my-8 border-outline-variant/30" />

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">4. Course Structure</h3>
              <p className="text-on-surface mb-4">
                InsightNest follows a structured curriculum for every learner.
              </p>
              <p className="text-on-surface mb-4">
                All students, regardless of prior knowledge or professional experience, are required to complete the foundational modules before progressing to intermediate, advanced, and industry project modules.
              </p>
              <p className="text-on-surface">
                Students cannot request refunds solely because they expected advanced topics before completing the scheduled curriculum.
              </p>

              <hr className="my-8 border-outline-variant/30" />

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">5. Non-Refundable Situations</h3>
              <p className="text-on-surface mb-4">Refunds will <strong>not</strong> be granted for:</p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface">
                <li>Change of mind after enrollment.</li>
                <li>Lack of time or personal scheduling conflicts.</li>
                <li>Failure to attend live sessions.</li>
                <li>Failure to watch available recordings.</li>
                <li>Failure to complete quizzes, assignments, or projects.</li>
                <li>Dissatisfaction arising from personal learning pace or expectations.</li>
                <li>Existing knowledge of introductory topics.</li>
                <li>Requests for refunds after the 7-day eligibility period.</li>
                <li>Failure to follow the published curriculum sequence.</li>
              </ul>

              <hr className="my-8 border-outline-variant/30" />

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">6. Goodwill Refunds</h3>
              <p className="text-on-surface mb-4">
                InsightNest may, at its sole discretion, offer a partial or full goodwill refund in exceptional circumstances.
              </p>
              <p className="text-on-surface">
                Such goodwill refunds are voluntary, do not constitute an admission of fault, and shall not create a precedent for future refund requests.
              </p>

              <hr className="my-8 border-outline-variant/30" />

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">7. Refund Process</h3>
              <p className="text-on-surface mb-4">To request a refund, email <a href="mailto:support@insightnest.in" className="text-primary hover:underline font-bold">support@insightnest.in</a> with:</p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface mb-4">
                <li>Full Name</li>
                <li>Registered Email Address</li>
                <li>Course Name</li>
                <li>Enrollment ID (if available)</li>
                <li>Description of the issue</li>
                <li>Relevant screenshots or supporting evidence</li>
              </ul>
              <p className="text-on-surface">
                Our team will acknowledge your request and review it according to this policy.
              </p>

              <hr className="my-8 border-outline-variant/30" />

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">8. Certificate Eligibility</h3>
              <p className="text-on-surface mb-4">
                Course completion certificates are issued only after successful completion of all required coursework, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface mb-4">
                <li>Watching the required lectures</li>
                <li>Completing assignments</li>
                <li>Attempting quizzes</li>
                <li>Meeting any published completion requirements</li>
              </ul>
              <p className="text-on-surface">
                Students who discontinue the course before completing these requirements will not be eligible for certification.
              </p>

              <hr className="my-8 border-outline-variant/30" />

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">9. Final Decision</h3>
              <p className="text-on-surface mb-4">
                InsightNest reserves the right to investigate every refund request using attendance records, LMS activity, communication history, course access logs, assignment submissions, quiz records, and other relevant information.
              </p>
              <p className="text-on-surface font-medium">
                The decision made by InsightNest after completing the review shall be final.
              </p>

              <hr className="my-8 border-outline-variant/30" />

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">Contact Us</h3>
              <p className="text-on-surface mb-4">
                For refunds, academic support, technical assistance, certificates, or general inquiries:<br />
                <strong>Email:</strong> <a href="mailto:support@insightnest.in" className="text-primary hover:underline">support@insightnest.in</a>
              </p>
              <p className="text-on-surface">
                By purchasing any InsightNest course, you acknowledge that you have read, understood, and agreed to these Terms of Service and Refund Policy.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant/30 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">school</span>
            <span className="text-xl font-bold text-on-surface">InsightNest</span>
          </div>
          <p className="text-on-surface-variant text-sm">
            © {new Date().getFullYear()} InsightNest. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
