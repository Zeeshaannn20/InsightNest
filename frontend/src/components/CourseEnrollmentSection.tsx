"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import RazorpayButton from "./RazorpayButton";
import Logo from "./Logo";

interface CourseEnrollmentSectionProps {
  courseSlug: string;
}

export default function CourseEnrollmentSection({ courseSlug }: CourseEnrollmentSectionProps) {
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  
  // Waitlist state
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchCourse() {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description, price_paise, status, duration_weeks")
        .eq("slug", courseSlug)
        .single();
      
      if (!error && data) {
        setCourse(data);
      }
      setLoading(false);
    }
    fetchCourse();
  }, [courseSlug, supabase]);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistLoading(true);
    setTimeout(() => {
      setWaitlistLoading(false);
      setWaitlistSubmitted(true);
      // Stub: in a real app, send to an endpoint or insert to a waitlist table
      const entries = JSON.parse(localStorage.getItem(`${courseSlug}_waitlist`) || "[]");
      entries.push({ email: waitlistEmail, date: new Date().toISOString() });
      localStorage.setItem(`${courseSlug}_waitlist`, JSON.stringify(entries));
    }, 1000);
  };

  if (loading) {
    return (
      <section id="enrollment" className="py-24 bg-surface flex justify-center items-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span>
      </section>
    );
  }

  if (!course) {
    return (
      <section id="enrollment" className="py-24 bg-surface text-center">
        <p className="text-error">Failed to load enrollment details.</p>
      </section>
    );
  }

  const isOpen = course.status === "open";
  const isClosed = course.status === "closed";
  const isComingSoon = course.status === "coming_soon";

  // Formatted price (assuming price_paise is available)
  const priceDisplay = course.price_paise ? (course.price_paise / 100).toLocaleString('en-IN') : "2,999";
  const originalPriceDisplay = "5,999";

  return (
    <section id="enrollment" className="py-24 bg-surface border-t border-outline-variant/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
            isOpen ? "bg-green-100 text-green-800" :
            isClosed ? "bg-amber-100 text-amber-800" :
            "bg-surface-variant text-on-surface-variant"
          }`}>
            <span className="material-symbols-outlined text-sm">
              {isOpen ? "check_circle" : isClosed ? "lock" : "hourglass_empty"}
            </span>
            {isOpen ? "Enrollments Open" : isClosed ? "Admissions Closed" : "Coming Soon"}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary-container mb-4">
            {isOpen ? "Start Your Journey Today" : isClosed ? "Cohort Enrollment" : "Join the Waitlist"}
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
            {isOpen 
              ? "Secure your spot and get instant access to the student dashboard."
              : isClosed 
                ? "The current cohort is underway. Join the waitlist to be notified when the next batch opens."
                : "Enrollments are opening soon. Register your interest below to be notified first."}
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto bg-surface-container-lowest p-8 md:p-12 rounded-3xl border-2 border-outline-variant/50 shadow-elevated relative overflow-hidden grid md:grid-cols-2 gap-12">
          {!isOpen && (
            <div className={`absolute top-0 right-0 px-6 py-1.5 rounded-bl-2xl text-xs font-bold uppercase tracking-wider text-white ${
              isClosed ? "bg-amber-500" : "bg-on-surface-variant"
            }`}>
              {isClosed ? "Admissions Closed" : "Coming Soon"}
            </div>
          )}
          
          {/* Left Column: Course details */}
          <div className="flex flex-col justify-between space-y-8">
            <div>
              <div className="flex justify-start mb-6">
                <Logo variant="img2" className="h-16 w-auto" />
              </div>
              
              <h3 className="text-2xl font-bold text-primary-container mb-2 text-left">{course.title}</h3>
              <p className="text-sm text-outline mb-6 text-left">{course.duration_weeks}-Week Live Cohort | AI-Powered Curriculum</p>
              
              <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 mb-6 text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Course Fee</span>
                <div className="flex items-center justify-center">
                  {isOpen && <span className="text-2xl line-through text-outline mr-3">&#x20B9;{originalPriceDisplay}</span>}
                  <span className="text-4xl font-extrabold text-primary-container">&#x20B9;{priceDisplay}</span>
                </div>
                <span className="text-outline text-xs block mt-1">One-time payment for full access</span>
              </div>
              
              <div className="bg-secondary/5 rounded-2xl p-5 border border-secondary/20 text-left">
                <h4 className="font-bold text-secondary text-sm mb-1.5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">schedule</span> Class Timings &amp; Live Schedule
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  All lectures are conducted live. Exact class timings and links will be announced by the instructor in the portal prior to each session.
                </p>
              </div>
            </div>

            {/* Already Enrolled — login link */}
            <div className="border-t border-outline-variant/30 pt-6">
              <p className="text-sm text-on-surface-variant text-left">
                Already enrolled?{" "}
                <Link href="/login" className="text-secondary font-semibold hover:underline">
                  Log in to your dashboard &#x2192;
                </Link>
              </p>
            </div>
          </div>

          {/* Right Column: CTA (Buy or Waitlist) */}
          <div className="border-t md:border-t-0 md:border-l border-outline-variant/30 pt-8 md:pt-0 md:pl-12 flex flex-col justify-center">
            {isOpen ? (
              // Open State: Buy Button
              <div className="space-y-6 text-left">
                <div>
                  <h4 className="text-2xl font-bold text-primary-container mb-2">Secure Your Spot</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Complete your payment via Razorpay. You will instantly receive dashboard access and a welcome email.
                  </p>
                </div>
                <RazorpayButton courseId={course.id} courseTitle={course.title} pricePaise={course.price_paise} />
                <div className="flex items-center gap-2 justify-center text-xs text-on-surface-variant mt-4">
                  <span className="material-symbols-outlined text-sm">lock</span> Secure 128-bit SSL Checkout
                </div>
              </div>
            ) : (
              // Closed / Coming Soon State: Waitlist Form
              waitlistSubmitted ? (
                <div className="text-center py-10 space-y-6 animate-scale-in">
                  <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-5xl">check_circle</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-primary-container mb-2">You are on the Waitlist!</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      We will notify you at <strong>{waitlistEmail}</strong> as soon as {isComingSoon ? "enrollments open" : "the next cohort opens"}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-left">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                      <span className="material-symbols-outlined text-sm">notifications</span>
                      Get Notified
                    </div>
                    <h4 className="text-2xl font-bold text-primary-container mb-2">Join the Waitlist</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Enter your email below and we will notify you when the cohort opens.
                    </p>
                  </div>

                  <form onSubmit={handleWaitlist} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email Address</label>
                      <input
                        type="email"
                        required
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm transition-all"
                        placeholder="john@example.com"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={waitlistLoading}
                      className="w-full bg-secondary text-on-secondary py-3.5 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-md flex items-center justify-center"
                    >
                      {waitlistLoading ? (
                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      ) : (
                        "Notify Me When Admissions Open"
                      )}
                    </button>
                  </form>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
