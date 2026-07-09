import { Router, Request, Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { Resend } from "resend";
import { getSupabaseClient } from "../lib/supabase";
import { createClient } from "@supabase/supabase-js";

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware to authenticate user using Supabase Bearer token
async function authenticateUser(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or malformed authentication header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const supabase = getSupabaseClient(token);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ error: "Unauthorized: Invalid session token" });
    }

    (req as any).user = user;
    (req as any).token = token;
    next();
  } catch (err: any) {
    return res.status(500).json({ error: `Authentication check failed: ${err.message}` });
  }
}

// POST /api/enrollment/create-order
router.post("/create-order", authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const token = (req as any).token;
    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({ error: "course_id is required" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys missing in environment");
      return res.status(500).json({ error: "Server misconfiguration: Payment gateway unavailable" });
    }

    const supabase = getSupabaseClient(token);

    // 1. Fetch course details
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, status, price_paise")
      .eq("id", course_id)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.status !== "open") {
      return res.status(400).json({ error: "Course is not open for enrollment" });
    }

    if (!course.price_paise) {
      return res.status(400).json({ error: "Course price is not configured" });
    }

    // 2. Create Razorpay order
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: course.price_paise,
      currency: "INR",
      receipt: `rcpt_${user.id.substring(0, 8)}_${course_id.substring(0, 8)}`,
      notes: {
        user_id: user.id,
        course_id: course_id,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/enrollment/razorpay-webhook
// This must be unauthenticated as it's called by Razorpay
router.post("/razorpay-webhook", async (req: Request, res: Response) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
    return res.status(500).json({ error: "Webhook misconfigured" });
  }

  // 1. Verify Signature
  const signature = req.headers["x-razorpay-signature"] as string;
  if (!signature) {
    return res.status(400).json({ error: "Missing signature" });
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.error("Invalid signature");
    return res.status(400).json({ error: "Invalid signature" });
  }

  const event = req.body.event;
  if (event === "payment.captured" || event === "order.paid") {
    const payment = req.body.payload.payment.entity;
    
    // Fallback to order if notes aren't on payment (depends on razorpay config)
    let notes = payment.notes;
    if (!notes || !notes.user_id) {
      if (req.body.payload.order && req.body.payload.order.entity) {
        notes = req.body.payload.order.entity.notes;
      }
    }

    if (!notes || !notes.user_id || !notes.course_id) {
      console.error("Missing user_id or course_id in Razorpay notes", req.body);
      return res.status(400).json({ error: "Missing notes" });
    }

    const { user_id, course_id } = notes;

    try {
      // 2. Initialize Service Role Supabase Client
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing Supabase Service Role configuration");
      }

      const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // 3. Upsert Enrollment (Idempotent by razorpay_payment_id due to UNIQUE constraint)
      const { data: enrollment, error: enrollError } = await supabaseAdmin
        .from("enrollments")
        .upsert({
          student_id: user_id, // we use student_id in the DB
          course_id: course_id,
          source: "razorpay",
          razorpay_order_id: payment.order_id,
          razorpay_payment_id: payment.id,
          status: "active",
          purchased_at: new Date().toISOString(),
          enrolled_at: new Date().toISOString()
        }, {
          onConflict: 'razorpay_payment_id'
        })
        .select()
        .single();

      if (enrollError) {
        console.error("Failed to insert enrollment:", enrollError);
        return res.status(500).json({ error: "Failed to process enrollment" });
      }

      // 4. Send Welcome Email
      // First get user's email
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id);
      
      if (!userError && userData?.user?.email && process.env.RESEND_API_KEY) {
        // Get course title for email
        const { data: courseData } = await supabaseAdmin
          .from("courses")
          .select("title")
          .eq("id", course_id)
          .single();

        const courseTitle = courseData?.title || "your new course";

        try {
          await resend.emails.send({
            from: "InsightNest <hello@insightnest.in>",
            to: userData.user.email,
            subject: `Welcome to ${courseTitle}!`,
            html: `
              <h2>Payment Successful</h2>
              <p>Welcome to <strong>${courseTitle}</strong>!</p>
              <p>Your payment of ₹${(payment.amount / 100).toFixed(2)} has been received (Receipt: ${payment.id}).</p>
              <p>You now have full access to your student dashboard.</p>
              <br/>
              <a href="https://insightnest.in/login" style="background:#2563eb;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;">Log in to Dashboard</a>
            `,
          });
        } catch (emailErr) {
          console.error("Failed to send welcome email:", emailErr);
          // Don't fail the webhook if email fails
        }
      }

      return res.status(200).json({ success: true });
    } catch (err: any) {
      console.error("Webhook processing error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Acknowledge other events
  res.status(200).json({ success: true, message: "Event ignored" });
});

// POST /api/enrollment/waitlist
// Public endpoint to capture waitlist emails
router.post("/waitlist", async (req: Request, res: Response) => {
  const { email, course_slug } = req.body;
  if (!email || !course_slug) {
    return res.status(400).json({ error: "Email and course_slug are required" });
  }

  try {
    // STUB: The waitlist table doesn't exist in the database yet.
    // So we just log it and simulate a successful insertion.
    // In the future, this would use the service role key to insert into a 'waitlist' table.
    console.log(`[WAITLIST STUB] Captured waitlist entry: ${email} for course ${course_slug}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    res.json({ success: true, message: "Added to waitlist" });
  } catch (error) {
    console.error("Waitlist error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
