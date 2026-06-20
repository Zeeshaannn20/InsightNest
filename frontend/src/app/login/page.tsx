"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

function LoginContent() {
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // ============================================================
  // LOGIN: Enrolled Student / Admin / Instructor
  // ============================================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: Sign in with the email + password directly
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (signInError || !signInData.user) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Step 2: Look up user role and active status in profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", signInData.user.id)
        .single();

      if (profileError || !profile) {
        setError("User profile not found.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!profile.is_active) {
        setError("Your account is not yet activated. Please contact admin.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Step 3: Redirect based on role
      const redirectMap: Record<string, string> = {
        admin: "/admin",
        instructor: "/instructor",
        student: "/dashboard",
      };

      router.push(redirectMap[profile.role] || "/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

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
            Your Data Analytics Journey Starts Here.
          </h1>
          <p className="text-lg text-on-surface-variant mb-12">
            Master AI-powered data analytics with live instruction, hands-on projects, and real-time mentorship.
          </p>
          <div className="flex gap-4">
            <div className="w-12 h-32 bg-secondary/20 rounded-full overflow-hidden flex flex-col justify-end p-1"><div className="w-full h-2/3 bg-secondary rounded-full"></div></div>
            <div className="w-12 h-40 bg-secondary-container/20 rounded-full overflow-hidden flex flex-col justify-end p-1"><div className="w-full h-1/2 bg-secondary-container rounded-full"></div></div>
            <div className="w-12 h-24 bg-surface-container-highest/50 rounded-full overflow-hidden flex flex-col justify-end p-1"><div className="w-full h-3/4 bg-secondary rounded-full"></div></div>
            <div className="w-12 h-48 bg-secondary/20 rounded-full overflow-hidden flex flex-col justify-end p-1"><div className="w-full h-5/6 bg-secondary rounded-full"></div></div>
          </div>
        </div>

        <div className="relative z-10 text-on-surface-variant text-sm">
          © 2026 InsightNest. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Auth Forms */}
      <div className="flex-1 flex flex-col bg-surface p-6 lg:p-12 overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center mb-10 justify-center">
          <Logo variant="img2" className="h-14 w-auto" />
        </div>

        <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-3 animate-slide-down">
              <span className="material-symbols-outlined text-error">error</span>
              <p>{error}</p>
            </div>
          )}

          {/* LOGIN FORM */}
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-primary-container mb-2">Welcome Back</h2>
            <p className="text-on-surface-variant mb-8">Sign in with your email to continue.</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-on-surface">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">mail</span>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface"
                    placeholder="zeeshan1820hussain@gmail.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-on-surface">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">lock</span>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showLoginPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
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
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen hero-gradient flex items-center justify-center p-6 bg-surface">
        <span className="material-symbols-outlined animate-spin text-3xl text-secondary">progress_activity</span>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
