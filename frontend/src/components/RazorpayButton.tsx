"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

interface RazorpayButtonProps {
  courseId: string;
  courseTitle: string;
  pricePaise: number;
  disabled?: boolean;
}

export default function RazorpayButton({ courseId, courseTitle, pricePaise, disabled }: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const { session, profile } = useAuth();
  const router = useRouter();

  const handlePayment = async () => {
    if (!session) {
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/enrollment/create-order`, {
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
          name: profile?.full_name || "",
          email: session.user.email,
        },
        theme: {
          color: "#2563eb"
        },
        handler: function (response: any) {
          // Success handler - Webhook handles the actual DB insertion securely
          router.push("/dashboard?success=true");
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

      paymentObject.on("payment.failed", function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });

    } catch (err) {
      console.error("Payment initiation failed:", err);
      alert("Something went wrong initiating the payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading}
      className="w-full bg-secondary text-on-secondary py-3.5 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
      ) : (
        "Enroll Now"
      )}
    </button>
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
