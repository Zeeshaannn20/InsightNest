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

    const { count, error } = await supabase
      .from("user_google_tokens")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to query user_google_tokens:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ isConnected: count !== null && count > 0 });
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

export default router;
