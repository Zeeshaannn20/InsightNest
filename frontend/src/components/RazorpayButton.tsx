"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

/**
 * Fire a Meta Pixel event if the pixel is loaded.
 *
 * The pixel only mounts in production, so this is a no-op in development
 * rather than something that has to be guarded at every call site.
 */
function trackPixel(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
  fbq?.("track", event, params);
}

interface RazorpayButtonProps {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  pricePaise: number;
  disabled?: boolean;
}

export default function RazorpayButton({ courseId, courseTitle, pricePaise, disabled }: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [askAccount, setAskAccount] = useState(false);
  const { session, profile } = useAuth();
  const router = useRouter();

  // A visitor without an account gets it made in place and goes straight on
  // to checkout, rather than being sent away to /login and losing the page.
  const handleClick = () => {
    if (session) startPayment(session, profile?.full_name ?? "");
    else setAskAccount(true);
  };

  const startPayment = async (session: Session, fullName: string) => {
    setAskAccount(false);
    setLoading(true);

    try {
      // 1. Load Razorpay script
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // 2. Create Order on Backend
      const response = await fetch("/api/enrollment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ course_id: courseId })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create order");
        setLoading(false);
        return;
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: "INR",
        name: "InsightNest",
        description: courseTitle,
        order_id: data.order_id,
        prefill: {
          name: fullName,
          email: session.user.email,
        },
        theme: {
          color: "#2563eb"
        },
        handler: async function (response: any) {
          try {
            // Verify payment signature asynchronously
                  const verifyRes = await fetch("/api/enrollment/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyRes.ok) {
              alert("Payment verification failed. If money was deducted, please contact support.");
              return;
            }

            // Only now is the payment genuinely confirmed. Firing Purchase on
            // the raw callback would let a forged response inflate conversion
            // data and mislead ad optimisation.
            trackPixel("Purchase", {
              value: pricePaise / 100,
              currency: "INR",
              content_name: courseTitle,
              content_ids: [courseId],
              content_type: "product",
            });

            // Success handler - Webhook handles the actual DB insertion securely
            router.push("/dashboard?success=true");
          } catch (err) {
            console.error("Verification error:", err);
            router.push("/dashboard?success=true"); // Fallback to webhook processing
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);

      trackPixel("InitiateCheckout", {
        value: pricePaise / 100,
        currency: "INR",
        content_name: courseTitle,
        content_ids: [courseId],
        content_type: "product",
      });

      paymentObject.open();

      paymentObject.on("payment.failed", function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });

    } catch (err) {
      console.error("Payment initiation failed:", err);
      // A network-level throw means the request never reached the backend —
      // usually the API is unreachable rather than the payment being refused.
      const unreachable = err instanceof TypeError;
      alert(
        unreachable
          ? "We couldn't reach the payment service. Please try again in a few minutes, or contact support@insightnest.in and we'll get you enrolled."
          : `We couldn't start the payment: ${
              err instanceof Error ? err.message : "unknown error"
            }. Please contact support@insightnest.in if this continues.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {askAccount && (
      <QuickAccount onClose={() => setAskAccount(false)} onReady={startPayment} />
    )}
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className="w-full bg-secondary text-on-secondary py-3.5 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
      ) : (
        "Enroll Now"
      )}
    </button>
    </>
  );
}

/**
 * Create an account (or sign in to an existing one) without leaving the page.
 * New accounts are auto-confirmed and active in the database, so signUp is
 * followed by an immediate sign-in and the session goes straight to checkout.
 */
function QuickAccount({
  onClose,
  onReady,
}: {
  onClose: () => void;
  onReady: (session: Session, fullName: string) => void;
}) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const supabase = createClient();

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.session) return null;
    return data.session;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    if (mode === "signin") {
      const session = await signIn();
      setBusy(false);
      if (!session) return setError("That email and password don’t match. Try again or reset your password.");
      return onReady(session, (session.user.user_metadata?.full_name as string) ?? "");
    }

    // Only the display name is sent. Role and activation are set by the
    // database, never by the browser.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });

    // An already-registered address comes back either as an error or as
    // success with no identities (Supabase's anti-enumeration response).
    const exists =
      signUpError?.message.toLowerCase().includes("already registered") ||
      (!signUpError && (data.user?.identities?.length ?? 0) === 0);
    if (exists) {
      setBusy(false);
      setMode("signin");
      setPassword("");
      return setError("You already have an account with this email. Enter your password to continue.");
    }
    if (signUpError) {
      setBusy(false);
      return setError(signUpError.message);
    }

    const session = data.session ?? (await signIn());
    setBusy(false);
    if (!session) return setError("Your account was created, but we couldn’t sign you in. Please log in to continue.");
    onReady(session, fullName.trim());
  };

  const input =
    "w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface";

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-account-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl text-left animate-slide-up"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="quick-account-title" className="text-xl font-bold text-primary-container">
              {mode === "signup" ? "One step to checkout" : "Welcome back"}
            </h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              {mode === "signup"
                ? "Create your login so your course is waiting in your dashboard after payment."
                : "Sign in and we’ll take you straight to payment."}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-on-surface-variant hover:text-on-surface -mr-2 -mt-1 p-2">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <p className="mt-4 p-3 bg-error-container text-on-error-container rounded-xl text-sm">{error}</p>
        )}

        <form onSubmit={submit} className="mt-5 space-y-3">
          {mode === "signup" && (
            <input
              required
              autoFocus
              autoComplete="name"
              aria-label="Full name"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={input}
            />
          )}
          <input
            required
            type="email"
            autoComplete="email"
            aria-label="Email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
          />
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              minLength={mode === "signup" ? 8 : undefined}
              autoFocus={mode === "signin"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              aria-label="Password"
              placeholder={mode === "signup" ? "Choose a password (8+ characters)" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${input} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-secondary text-on-secondary py-3.5 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-md flex items-center justify-center disabled:opacity-70"
          >
            {busy ? (
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            ) : (
              "Continue to payment"
            )}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-on-surface-variant">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button onClick={() => { setMode("signin"); setError(null); }} className="text-secondary font-semibold hover:underline">
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{" "}
              <button onClick={() => { setMode("signup"); setError(null); }} className="text-secondary font-semibold hover:underline">
                Create an account
              </button>
              {" · "}
              <Link href="/forgot-password" className="text-secondary font-semibold hover:underline">
                Forgot password
              </Link>
            </>
          )}
        </p>
        <p className="mt-3 text-[11px] text-center text-outline">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

// Utility to dynamically load Razorpay script
function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
