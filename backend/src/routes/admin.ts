import { Router, Request, Response } from "express";
import { getSupabaseClient } from "../lib/supabase";
import { generateGoogleMeetLink } from "../lib/google-meet";

const router = Router();

// Middleware to authenticate user using Supabase Bearer token and check for active admin privileges
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

    // Fetch profile and check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: "Forbidden: User profile not found" });
    }

    if (!profile.is_active) {
      return res.status(403).json({ error: "Forbidden: User account is deactivated" });
    }

    if (profile.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin privileges required" });
    }

    // Attach user and token to request object for use in handlers
    (req as any).user = user;
    (req as any).token = token;
    next();
  } catch (err: any) {
    return res.status(500).json({ error: `Authentication check failed: ${err.message}` });
  }
}

// Apply authentication middleware to all admin routes
router.use(authenticateUser);

// GET /api/admin/google-status
router.get("/google-status", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const token = (req as any).token;
    const supabase = getSupabaseClient(token);

    const { data, error } = await supabase
      .from("user_google_tokens")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to query user_google_tokens:", error);
      return res.status(500).json({ error: error.message });
    }

    const row = data && data[0];
    res.json({ 
      isConnected: !!row,
      googleEmail: row ? (row.google_email || null) : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/google-disconnect
router.post("/google-disconnect", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const token = (req as any).token;
    const supabase = getSupabaseClient(token);

    const { error } = await supabase
      .from("user_google_tokens")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to disconnect Google Calendar:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/sessions/create
router.post("/sessions/create", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const token = (req as any).token;
    const supabase = getSupabaseClient(token);

    const {
      course_id,
      title,
      description,
      session_date,
      start_time,
      end_time,
      create_meet_link
    } = req.body;

    // Validate inputs
    if (!course_id || !title || !session_date || !start_time || !end_time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let meet_link: string | null = null;

    if (create_meet_link) {
      try {
        meet_link = await generateGoogleMeetLink({
          userId: user.id,
          token,
          title,
          description: description || "",
          sessionDate: session_date,
          startTime: start_time,
          endTime: end_time
        });
      } catch (meetErr: any) {
        console.error("Google Meet Generation error:", meetErr);
        if (meetErr.message && (meetErr.message.includes("invalid_grant") || meetErr.code === "invalid_grant")) {
          console.warn("invalid_grant detected. Automatically deleting user_google_tokens.");
          try {
            await supabase
              .from("user_google_tokens")
              .delete()
              .eq("user_id", user.id);
          } catch (dbDelErr) {
            console.error("Failed to auto-delete invalid tokens:", dbDelErr);
          }
        }
        return res.status(400).json({
          error: `Google Meet link generation failed: ${meetErr.message}. Ensure your Google Calendar is connected.`
        });
      }
    }

    // Insert live session entry
    const { data: session, error: dbError } = await supabase
      .from("live_sessions")
      .insert({
        course_id,
        instructor_id: user.id,
        title,
        description: description || null,
        session_date,
        start_time,
        end_time,
        meet_link,
        status: "scheduled"
      })
      .select(`
        *,
        course:courses(title),
        instructor:profiles!live_sessions_instructor_id_fkey(full_name)
      `)
      .single();

    if (dbError) {
      console.error("Database error inserting session:", dbError);
      return res.status(500).json({ error: dbError.message });
    }

    res.json({
      success: true,
      session
    });
  } catch (error: any) {
    console.error("Session creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/grant-access
router.post("/grant-access", async (req: Request, res: Response) => {
  try {
    const { studentEmail, courseId } = req.body;

    if (!studentEmail || !courseId) {
      return res.status(400).json({ error: "studentEmail and courseId are required" });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: "Missing Supabase Service Role configuration" });
    }

    const { createClient } = require("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Check if user exists, else invite
    let userId: string;
    
    // In production, you would probably search by email or use an RPC if listUsers is too large,
    // but for this MVP, we'll use listUsers since we just need to find the user.
    // Better: just try to invite, if it fails because they exist, get them.
    // However inviteUserByEmail is clean. Let's just create user directly if not found.
    const { data: users, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (searchError) {
      return res.status(500).json({ error: searchError.message });
    }

    const existingUser = users.users.find((u: any) => u.email === studentEmail);

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create via magic link invite
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(studentEmail);
      if (inviteError || !inviteData.user) {
        return res.status(500).json({ error: inviteError?.message || "Failed to invite user" });
      }
      userId = inviteData.user.id;
    }

    // 2. Ensure profile exists and is active
    const { data: profile } = await supabaseAdmin.from("profiles").select("id").eq("id", userId).single();
    if (!profile) {
      await supabaseAdmin.from("profiles").insert({
        id: userId,
        full_name: studentEmail.split("@")[0],
        role: "student",
        is_active: true
      });
    } else {
      await supabaseAdmin.from("profiles").update({ is_active: true }).eq("id", userId);
    }

    // 3. Insert Enrollment (idempotent due to unique constraint)
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from("enrollments")
      .upsert({
        student_id: userId,
        course_id: courseId,
        source: "manual",
        status: "active",
        enrolled_at: new Date().toISOString()
      }, {
        onConflict: 'student_id, course_id'
      })
      .select()
      .single();

    if (enrollError) {
      return res.status(500).json({ error: enrollError.message });
    }

    res.json({
      success: true,
      message: existingUser ? "Access granted to existing user" : "User invited and access granted",
      user_id: userId
    });

  } catch (error: any) {
    console.error("Admin grant error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
