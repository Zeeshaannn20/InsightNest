"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect signup to the login page's register tab
export default function SignupRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?tab=register");
  }, [router]);

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
      <div className="glass-card w-full max-w-md rounded-3xl p-10 text-center animate-scale-in">
        <span className="material-symbols-outlined text-secondary text-4xl animate-spin mb-4 block">progress_activity</span>
        <p className="text-on-surface-variant">Redirecting to registration...</p>
      </div>
    </div>
  );
}
