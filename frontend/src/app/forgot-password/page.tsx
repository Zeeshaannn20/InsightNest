"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setLoading(false);

    // Rate limiting is worth surfacing; anything else is reported as success
    // below so this form cannot be used to discover which emails have accounts.
    if (error && error.message.toLowerCase().includes("rate")) {
      setError("Too many attempts. Wait a minute and try again.");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="w-full max-w-md text-center animate-fade-in">
          <Logo variant="img2" className="h-14 w-auto mx-auto mb-8" />
          <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">mark_email_read</span>
          </div>
          <h1 className="text-2xl font-bold text-primary-container mb-3">Check your email</h1>
          <p className="text-on-surface-variant mb-2 leading-relaxed">
            If an account exists for <strong className="text-on-surface">{email}</strong>, we have sent a
            link to reset the password.
          </p>
          <p className="text-sm text-on-surface-variant mb-8">
            The link works once and expires in an hour. Check spam if it has not arrived in a few minutes.
          </p>
          <Link
            href="/login"
            className="inline-block bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-md"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md animate-fade-in">
        <Logo variant="img2" className="h-14 w-auto mx-auto mb-10" />

        <h1 className="text-3xl font-bold text-primary-container mb-2">Reset your password</h1>
        <p className="text-on-surface-variant mb-8">
          Enter the email you signed up with and we will send you a reset link.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-3 animate-slide-down">
            <span className="material-symbols-outlined text-error">error</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-on-secondary py-3.5 rounded-xl font-bold text-lg hover:bg-secondary/90 transition-all btn-press shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-8">
          Remembered it?{" "}
          <Link href="/login" className="text-secondary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
