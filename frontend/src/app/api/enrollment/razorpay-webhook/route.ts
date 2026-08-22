import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { Resend } from "resend";
import { serviceClient } from "@/lib/server/supabase-admin";

/**
 * Razorpay payment webhook — the only thing that grants course access.
 *
 * Razorpay signs the EXACT bytes it sent, so the signature is checked against
 * the raw request body. The previous Express implementation re-serialised the
 * parsed body with JSON.stringify, which can produce different bytes (key
 * order, spacing) and silently reject real payments.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 500 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await request.text();
  const expected = crypto.createHmac("sha256", webhookSecret).update(raw).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    console.error("Rejected webhook with invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const event = body.event;
  if (event !== "payment.captured" && event !== "order.paid") {
    // Acknowledge everything else so Razorpay stops retrying it.
    return NextResponse.json({ success: true, message: "Event ignored" });
  }

  const payment = body.payload?.payment?.entity;
  if (!payment) {
    return NextResponse.json({ error: "Missing payment entity" }, { status: 400 });
  }

  // Notes live on the payment for payment.captured, but on the order for
  // order.paid — check both before giving up.
  const notes =
    payment.notes?.user_id ? payment.notes : body.payload?.order?.entity?.notes;

  if (!notes?.user_id || !notes?.course_id) {
    console.error("Webhook missing user_id/course_id in notes", { event, payment_id: payment.id });
    return NextResponse.json({ error: "Missing notes" }, { status: 400 });
  }

  try {
    const supabase = serviceClient();
    const now = new Date().toISOString();

    // Idempotent: razorpay_payment_id is UNIQUE, so a retried webhook updates
    // the same row rather than enrolling the student twice.
    const { error: enrollError } = await supabase.from("enrollments").upsert(
      {
        student_id: notes.user_id,
        course_id: notes.course_id,
        source: "razorpay",
        razorpay_order_id: payment.order_id,
        razorpay_payment_id: payment.id,
        status: "active",
        purchased_at: now,
        enrolled_at: now,
      },
      { onConflict: "razorpay_payment_id" }
    );

    if (enrollError) {
      // Returning 500 makes Razorpay retry, which is what we want — the
      // customer has paid and must end up enrolled.
      console.error("Enrollment write failed:", enrollError);
      return NextResponse.json({ error: "Failed to record enrollment" }, { status: 500 });
    }

    // Record the payment itself so refunds and revenue have somewhere to live.
    await supabase
      .from("payments")
      .insert({
        user_id: notes.user_id,
        amount: payment.amount / 100,
        currency: payment.currency ?? "INR",
        plan_type: "course",
        payment_method: payment.method ?? "razorpay",
        payment_id: payment.id,
        status: "captured",
      })
      .then(({ error }) => {
        if (error) console.error("Payment record failed (non-fatal):", error.message);
      });

    await sendWelcomeEmail(supabase, notes.user_id, notes.course_id, payment);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

/** Email failures must never fail the webhook — the enrollment already landed. */
async function sendWelcomeEmail(
  supabase: ReturnType<typeof serviceClient>,
  userId: string,
  courseId: string,
  payment: { amount: number; id: string }
) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping welcome email");
    return;
  }

  try {
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const email = userData?.user?.email;
    if (!email) return;

    const { data: course } = await supabase
      .from("courses")
      .select("title")
      .eq("id", courseId)
      .single();

    const courseTitle = course?.title ?? "your new course";

    await new Resend(apiKey).emails.send({
      from: "InsightNest <support@insightnest.in>",
      to: email,
      subject: `Welcome to ${courseTitle}`,
      html: `
        <h2>Payment received</h2>
        <p>Welcome to <strong>${courseTitle}</strong>.</p>
        <p>We've received ₹${(payment.amount / 100).toFixed(2)} (receipt: ${payment.id}).</p>
        <p>Your student dashboard is ready.</p>
        <p><a href="https://insightnest.in/login" style="background:#4355b9;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Log in to your dashboard</a></p>
      `,
    });
  } catch (error) {
    console.error("Welcome email failed (non-fatal):", error);
  }
}
