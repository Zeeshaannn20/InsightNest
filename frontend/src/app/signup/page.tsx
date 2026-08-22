"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

type Outcome = "check_email";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    // Only the display name is sent. Role and activation are set by the
    // database, never by the browser.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });

    if (signUpError) {
      setError(
        signUpError.message.toLowerCase().includes("already registered")
          ? "An account with this email already exists. Try signing in instead."
          : signUpError.message
      );
      setLoading(false);
      return;
    }

    // With email confirmation on, there is no session yet.
    if (!data.session) {
      setOutcome("check_email");
      setLoading(false);
      return;
    }

    // Accounts are active on creation, so send them straight in. Course content
    // is still gated by enrollment, which only a payment or an admin grant creates.
    router.push("/dashboard");
  };

  if (outcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="w-full max-w-md text-center animate-fade-in">
          <Logo variant="img2" className="h-14 w-auto mx-auto mb-8" />
          <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">mark_email_unread</span>
          </div>
          <h1 className="text-2xl font-bold text-primary-container mb-3">Confirm your email</h1>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            We sent a confirmation link to <strong className="text-on-surface">{email}</strong>.
            Open it to verify your address, then sign in.
          </p>
          <Link
            href="/login"
            className="inline-block bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-md"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-surface-container-low to-surface-container-highest flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 flex items-center">
          <Logo variant="img2" className="h-16 w-auto" />
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold text-on-surface mb-6 leading-tight">
            Create your InsightNest account.
          </h1>
          <p className="text-lg text-on-surface-variant mb-12">
            Live instruction, hands-on projects and mentorship from working analysts.
          </p>
          <ul className="space-y-3 text-on-surface-variant">
            {[
              "Live classes with recordings you keep",
              "Real projects, reviewed by a mentor",
              "Certificate on completion",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">check_circle</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-on-surface-variant text-sm">
          © 2026 InsightNest. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col bg-surface p-6 lg:p-12 overflow-y-auto">
        <div className="lg:hidden flex items-center mb-10 justify-center">
          <Logo variant="img2" className="h-14 w-auto" />
        </div>

        <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-3 animate-slide-down">
              <span className="material-symbols-outlined text-error">error</span>
              <p>{error}</p>
            </div>
          )}

          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-primary-container mb-2">Create your account</h2>
            <p className="text-on-surface-variant mb-8">
              Already have one?{" "}
              <Link href="/login" className="text-secondary font-semibold hover:underline">
                Sign in
              </Link>
            </p>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="block text-sm font-semibold text-on-surface">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">
                    person
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-semibold text-on-surface">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-on-surface">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-on-surface"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">
                    lock_reset
                  </span>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface"
                    placeholder="Re-enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary text-on-secondary py-3.5 rounded-xl font-bold text-lg hover:bg-secondary/90 transition-all btn-press shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  "Create Account"
                )}
              </button>

              <p className="text-xs text-on-surface-variant text-center pt-1">
                By creating an account you agree to our{" "}
                <Link href="/terms" className="text-secondary hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-secondary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
