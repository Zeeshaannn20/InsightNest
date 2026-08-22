import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { authenticate } from "@/lib/server/supabase-admin";

/**
 * Confirms the checkout signature Razorpay hands back in the browser.
 * Deliberately does NOT grant access — the webhook is the source of truth,
 * because it cannot be skipped or replayed by a client.
 */
export async function POST(request: Request) {
  try {
    const auth = await authenticate(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!secret) {
      return NextResponse.json({ error: "Payment verification misconfigured" }, { status: 500 });
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Constant-time compare so the signature can't be probed byte by byte.
    const a = Buffer.from(expected);
    const b = Buffer.from(String(razorpay_signature));
    const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

    return valid
      ? NextResponse.json({ success: true, message: "Signature verified" })
      : NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
