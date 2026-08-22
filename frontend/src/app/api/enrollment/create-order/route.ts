import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { authenticate } from "@/lib/server/supabase-admin";

export async function POST(request: Request) {
  try {
    const auth = await authenticate(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { course_id } = await request.json();
    if (!course_id) {
      return NextResponse.json({ error: "course_id is required" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keyId || !keySecret) {
      console.error("Razorpay keys missing from environment");
      return NextResponse.json(
        { error: "Payments are temporarily unavailable. Please contact support@insightnest.in." },
        { status: 500 }
      );
    }

    // Read the course as the signed-in user, so RLS still applies.
    const { data: course, error: courseError } = await auth.supabase
      .from("courses")
      .select("id, status, price_paise, title")
      .eq("id", course_id)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    if (course.status !== "open") {
      return NextResponse.json(
        { error: "This course is not open for enrollment right now." },
        { status: 400 }
      );
    }
    if (!course.price_paise) {
      return NextResponse.json({ error: "Course price is not configured" }, { status: 400 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // user_id and course_id ride along in notes — the webhook reads them back
    // to decide who to enrol, so they must be set here.
    const order = await razorpay.orders.create({
      amount: course.price_paise,
      currency: "INR",
      receipt: `rcpt_${auth.user.id.slice(0, 8)}_${String(course_id).slice(0, 8)}`,
      notes: { user_id: auth.user.id, course_id },
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      key_id: keyId,
    });
  } catch (error) {
    console.error("Create order failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not start the payment" },
      { status: 500 }
    );
  }
}
