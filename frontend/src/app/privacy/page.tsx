"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <Logo variant="img1" className="h-16 w-auto" />
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#courses" className="text-on-surface hover:text-secondary font-medium transition-colors">Syllabus</Link>
            <Link href="/#pricing" className="text-on-surface hover:text-secondary font-medium transition-colors">Unlock Dashboard / Buy</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-on-surface hover:text-secondary font-medium transition-colors hidden md:block">Dashboard</Link>
            <Link href="/login" className="text-on-surface hover:text-secondary font-medium transition-colors hidden md:block">Login</Link>
            <Link href="/#pricing" className="bg-secondary text-on-secondary px-5 py-2 rounded-full font-semibold hover:bg-secondary/90 transition-all btn-press shadow-md">Apply Now</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 flex-1">
        {/* Header Section */}
        <section className="hero-gradient py-20 text-center border-b border-outline-variant/20">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary-container mb-6 tracking-tight">
              Privacy <span className="text-secondary">Policy</span>
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Effective Date: June 20, 2026. Your privacy is paramount to us at InsightNest.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 bg-surface">
          <div className="max-w-3xl mx-auto px-6">
            <div className="prose prose-slate max-w-none text-on-surface-variant text-base leading-relaxed space-y-8">
              <div>
                <h3 className="text-xl font-bold text-primary-container mb-3">1. Information We Collect</h3>
                <p>
                  When you apply for admission to the InsightNest cohort or use our platform, we collect information necessary to process your request and provide services. This includes:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-sm">
                  <li><strong>Personal Identifiers:</strong> Name, Email Address, and Phone Number provided during the application process.</li>
                  <li><strong>Account Credentials:</strong> Email addresses and passwords created when signing up.</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with our courses, lectures, files, and chat portals.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary-container mb-3">2. How We Use Your Information</h3>
                <p>
                  We utilize the collected information to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-sm">
                  <li>Evaluate admissions and contact candidates regarding their selection state.</li>
                  <li>Provide LMS dashboard access, course materials, assignments, and certificates.</li>
                  <li>Facilitate cohort discussions, live stream chats, and direct Q&A support.</li>
                  <li>Improve our unified analytics learning platform and user experience.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary-container mb-3">3. High-Quality Selection Process</h3>
                <p>
                  Because we choose a handful of people for each cohort to maintain premium mentorship standards, candidate details are reviewed individually by our committee led by Zeeshan. Your profile details will never be sold, leased, or rented to third-party marketing companies.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary-container mb-3">4. Cookies and Analytics</h3>
                <p>
                  We use cookies and similar web tracking technologies to authenticate users and cache preferences (such as locally saving application submissions and live chat messages). You can configure your browser settings to refuse cookies, but some portal features may not function correctly as a result.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary-container mb-3">5. Third-Party Integrations</h3>
                <p>
                  We coordinate with trusted services to operate our digital infrastructure:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-sm">
                  <li><strong>Supabase:</strong> For account authentication and storage of profile records.</li>
                  <li><strong>Google Meet API:</strong> For creating and coordinating scheduled live lecture slots.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary-container mb-3">6. Security Measures</h3>
                <p>
                  We secure your personal information using standard encryption and database protection protocols. Access is restricted solely to authorized administrative staff reviewing admissions and grading coursework.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary-container mb-3">7. Contact Information</h3>
                <p>
                  If you have any questions or require data updates, please contact Zeeshan, founder of InsightNest, through the student portal dashboard coordinates.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low text-on-surface-variant py-16 border-t border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center">
                <Logo variant="img2" className="h-14 w-auto" />
              </Link>
            </div>
            <p className="text-sm">Empowering next-gen analysts with AI-powered education and career transformation.</p>
          </div>
          <div>
            <h4 className="text-on-surface font-bold mb-4">Bootcamp</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/#courses" className="hover:text-secondary transition-colors">Curriculum</Link></li>
              <li><Link href="/#pricing" className="hover:text-secondary transition-colors">Projects</Link></li>
              <li><Link href="/#pricing" className="hover:text-secondary transition-colors">Mentors</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-on-surface font-bold mb-4">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-secondary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Career Guide</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Success Stories</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-on-surface font-bold mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>© 2026 InsightNest AI. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-secondary transition-colors"><span className="material-symbols-outlined">share</span></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
