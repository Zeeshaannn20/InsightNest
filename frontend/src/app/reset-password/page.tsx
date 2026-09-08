"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  /**
   * Supabase can deliver a recovery link in three shapes, and which one
   * arrives depends on project settings and the email template. All three are
   * handled here, in the browser, because:
   *
   *   - a `#fragment` never reaches a server route, and a server redirect
   *     would drop it;
   *   - a PKCE `?code=` can only be exchanged where the code verifier was
   *     stored, which is the browser that asked for the reset;
   *   - `?token_hash=` works anywhere, and is what makes opening the email on
   *     a different device than you requested it from work at all.
   */
  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      const type = params.get("type");

      try {
        if (tokenHash) {
          // Device independent: no verifier needed.
          await supabase.auth.verifyOtp({
            type: (type as "recovery") || "recovery",
            token_hash: tokenHash,
          });
        } else if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
        // A #fragment is picked up automatically by the browser client, so it
        // needs no branch here — getSession below sees the result.
      } catch (err) {
        console.error("Recovery link could not be redeemed:", err);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      setHasSession(Boolean(session));
      setChecking(false);

      // Drop the token from the address bar once it has been redeemed, so it
      // is not left in history or copied out of the URL.
      if (window.location.search || window.location.hash) {
        window.history.replaceState({}, "", "/reset-password");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-4xl text-secondary">
          progress_activity
        </span>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="w-full max-w-md text-center animate-fade-in">
          <Logo variant="img2" className="h-14 w-auto mx-auto mb-8" />
          <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">link_off</span>
          </div>
          <h1 className="text-2xl font-bold text-primary-container mb-3">This link has expired</h1>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            Password reset links work once and expire after an hour. Request a fresh one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-md"
          >
            Send a new link
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="w-full max-w-md text-center animate-fade-in">
          <Logo variant="img2" className="h-14 w-auto mx-auto mb-8" />
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <h1 className="text-2xl font-bold text-primary-container mb-3">Password updated</h1>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            You are signed in with your new password.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-block bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-md"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md animate-fade-in">
        <Logo variant="img2" className="h-14 w-auto mx-auto mb-10" />

        <h1 className="text-3xl font-bold text-primary-container mb-2">Choose a new password</h1>
        <p className="text-on-surface-variant mb-8">Pick something you have not used here before.</p>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-3 animate-slide-down">
            <span className="material-symbols-outlined text-error">error</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-semibold text-on-surface">
              New Password
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
                placeholder="At least 8 characters"
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface"
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
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-on-surface">
              Confirm New Password
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
                placeholder="Re-enter your password"
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
              "Update password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
