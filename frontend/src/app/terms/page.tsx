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
            <p className="text-on-surface-variant mb-10">Last Updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary-container mb-6 border-b border-outline-variant/30 pb-2">Refund Policy – InsightNest</h2>
              <p className="text-on-surface mb-6">
                At InsightNest, we are committed to providing high-quality education and learning support. Before purchasing any course, please carefully read our refund policy.
              </p>

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">1. Refund Eligibility Period</h3>
              <p className="text-on-surface">
                Students may request a refund within <strong>30 days (1 month)</strong> from the date of purchase by sending an email to <a href="mailto:support@insightnest.in" className="text-primary hover:underline">support@insightnest.in</a>.
              </p>

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">2. Conditions for Refund Approval</h3>
              <p className="text-on-surface mb-4">A refund will only be considered under the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface">
                <li>There is a significant issue related to the course academics, learning platform, or website functionality.</li>
                <li>The reported issue is not resolved by the InsightNest team within <strong>24 hours</strong> of receiving the complaint.</li>
                <li>The issue materially affects the student's ability to access or complete the course.</li>
              </ul>

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">3. Course Completion Requirement</h3>
              <p className="text-on-surface mb-4">To be eligible for a refund request, the student must have:</p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface mb-4">
                <li>Completed all assigned coursework.</li>
                <li>Attempted and completed all quizzes.</li>
                <li>Submitted all required assignments.</li>
                <li>Watched all available course video lectures.</li>
              </ul>
              <p className="text-on-surface">Refund requests from students who have not completed the above requirements will not be considered.</p>

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">4. Learning Expectations</h3>
              <p className="text-on-surface mb-4">InsightNest follows a simple principle:</p>
              <blockquote className="border-l-4 border-primary pl-4 italic text-on-surface-variant my-4 bg-surface-variant/30 py-2 pr-4 rounded-r-lg">
                <strong>"Trust the Process."</strong>
              </blockquote>
              <p className="text-on-surface mb-4">
                Learning data analytics, business analytics, financial analytics, product analytics, or any professional skill requires consistent effort and practice. Knowledge and career outcomes cannot be guaranteed within a single day, week, or short period of time.
              </p>
              <p className="text-on-surface mb-4">Refunds will not be granted based on:</p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface">
                <li>Lack of immediate results.</li>
                <li>Personal expectations regarding job placement or salary.</li>
                <li>Insufficient time spent on learning and practice.</li>
                <li>Failure to follow the course curriculum and recommended learning path.</li>
              </ul>

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">5. Non-Refundable Cases</h3>
              <p className="text-on-surface mb-4">Refunds will not be approved for:</p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface">
                <li>Change of mind after purchase.</li>
                <li>Lack of time to attend the course.</li>
                <li>Failure to complete assignments, quizzes, or lectures.</li>
                <li>Dissatisfaction due to personal learning pace.</li>
                <li>Requests made after the 30-day refund period.</li>
              </ul>

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">6. How to Request a Refund</h3>
              <p className="text-on-surface mb-4">To request a refund, send an email to <a href="mailto:support@insightnest.in" className="text-primary hover:underline">support@insightnest.in</a> with:</p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface mb-4">
                <li>Full Name</li>
                <li>Registered Email Address</li>
                <li>Course Name</li>
                <li>Description of the Issue</li>
                <li>Relevant Screenshots or Evidence</li>
              </ul>
              <p className="text-on-surface">Our team will review the request and respond within a reasonable timeframe.</p>

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">7. Final Decision</h3>
              <p className="text-on-surface mb-4">
                InsightNest reserves the right to review each refund request individually and make the final decision based on the terms outlined in this policy.
              </p>
              <p className="text-on-surface font-medium">
                By purchasing any course from InsightNest, you acknowledge that you have read, understood, and agreed to this Refund Policy.
              </p>

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">8. Certificate Eligibility</h3>
              <p className="text-on-surface mb-4">To receive a course completion certificate from InsightNest, students must:</p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface mb-4">
                <li>Complete all course video lectures.</li>
                <li>Successfully complete all assignments.</li>
                <li>Attempt and complete all quizzes.</li>
                <li>Meet any minimum performance requirements specified for the course.</li>
              </ul>
              <p className="text-on-surface mb-4">
                Certificates will only be issued after the successful completion and verification of all required coursework.
              </p>
              <p className="text-on-surface mb-4">
                Students who do not complete the required assignments, quizzes, or other course activities will not be eligible to receive a certificate, regardless of course enrollment status.
              </p>
              <p className="text-on-surface">
                The InsightNest certificate is intended to recognize active participation, learning, and successful completion of the course requirements.
              </p>

              <h3 className="text-xl font-bold text-on-surface mt-8 mb-4">Contact Information</h3>
              <p className="text-on-surface">
                For support, refunds, certificates, academic concerns, website issues, compliance requests, and general inquiries, please contact:<br />
                <strong>Email:</strong> <a href="mailto:support@insightnest.in" className="text-primary hover:underline">support@insightnest.in</a>
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
