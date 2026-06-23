import { Router, Request, Response } from "express";
import { google } from "googleapis";
import { randomUUID } from "crypto";
import { getSupabaseClient } from "../lib/supabase";

const router = Router();

// Server-side state store for OAuth flows — prevents token leakage in URLs
const oauthStateStore = new Map<string, { token: string; origin: string; createdAt: number }>();
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Cleanup expired state entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of oauthStateStore) {
    if (now - value.createdAt > STATE_TTL_MS) {
      oauthStateStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// GET /api/auth/google
// Initiates the Google OAuth flow, preserving the user's Supabase token and frontend origin in state
router.get("/google", async (req: Request, res: Response) => {
  const token = req.query.token as string;
  const origin = (req.query.origin as string) || process.env.FRONTEND_URL || "http://localhost:3000";

  if (!token) {
    return res.status(400).json({ error: "Missing active user authorization token." });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const scopes = [
    "https://www.googleapis.com/auth/calendar.events",
    "openid",
    "email",
    "profile"
  ];

  // Store token server-side and use a random state ID in the URL
  const stateId = randomUUID();
  oauthStateStore.set(stateId, { token, origin, createdAt: Date.now() });

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    state: stateId
  });

  res.redirect(authorizationUrl);
});

// GET /api/auth/google/callback
// Handles Google redirect, exchanges code for tokens, and updates Supabase
router.get("/google/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const stateParam = req.query.state as string;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  if (!stateParam) {
    return res.status(400).json({ error: "Missing state identifier" });
  }

  try {
    // Retrieve and consume the server-side state
    const stateData = oauthStateStore.get(stateParam);
    if (!stateData) {
      return res.status(400).json({ error: "Invalid or expired OAuth state. Please try again." });
    }
    oauthStateStore.delete(stateParam); // One-time use

    const { token, origin } = stateData;

    // Initialize Supabase authenticated with the user's token
    const supabase = getSupabaseClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth verification failed during callback:", authError);
      return res.status(401).json({ error: "Unauthorized user session" });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange code for Google credentials
    const { tokens } = await oauth2Client.getToken(code);

    const tokenPayload: Record<string, any> = {
      user_id: user.id,
      access_token: tokens.access_token,
      expiry_date: tokens.expiry_date,
      updated_at: new Date().toISOString()
    };

    if (tokens.refresh_token) {
      tokenPayload.refresh_token = tokens.refresh_token;
    }

    // Try to extract Google email from id_token
    let googleEmail: string | null = null;
    if (tokens.id_token) {
      try {
        const payloadBase64 = tokens.id_token.split(".")[1];
        if (payloadBase64) {
          const payload = JSON.parse(
            Buffer.from(payloadBase64, "base64").toString("utf-8")
          );
          googleEmail = payload.email || null;
        }
      } catch (err) {
        console.error("Failed to decode Google id_token:", err);
      }
    }

    // Fallback: fetch token info from Google API if id_token was missing or parsing failed
    if (!googleEmail && tokens.access_token) {
      try {
        const tokenInfo = await oauth2Client.getTokenInfo(tokens.access_token);
        googleEmail = tokenInfo.email || null;
      } catch (err) {
        console.error("Failed to fetch token info from Google:", err);
      }
    }

    if (!googleEmail) {
      return res.redirect(`${origin}/admin/sessions?error=${encodeURIComponent("Failed to retrieve Google email address during authentication.")}`);
    }

    if (googleEmail.toLowerCase() !== "zeeshan1820hussain@gmail.com") {
      return res.redirect(`${origin}/admin/sessions?error=${encodeURIComponent("Forbidden: Only zeeshan1820hussain@gmail.com is authorized to connect Google Calendar.")}`);
    }

    // Store tokens in user_google_tokens. Since client is authenticated as the user, RLS is satisfied.
    let { error: dbError } = await supabase
      .from("user_google_tokens")
      .upsert({
        ...tokenPayload,
        ...(googleEmail ? { google_email: googleEmail } : {})
      });

    // Fallback if the google_email column does not exist on the remote database yet
    if (dbError && googleEmail) {
      console.warn("Attempt to save google_email failed (column may not exist). Falling back...", dbError.message);
      const { error: fallbackError } = await supabase
        .from("user_google_tokens")
        .upsert(tokenPayload);
      dbError = fallbackError;
    }

    if (dbError) {
      console.error("Database storage error for Google tokens:", dbError);
      return res.redirect(`${origin}/admin/sessions?error=${encodeURIComponent(`Failed to store credentials: ${dbError.message}`)}`);
    }

    // Redirect user back to frontend sessions page
    res.redirect(`${origin}/admin/sessions?connected=true`);
  } catch (error: any) {
    console.error("OAuth callback exchange failed:", error);
    const stateParam = req.query.state as string;
    // Attempt state lookup to find correct origin, fallback to environment url or default port
    const stateData = stateParam ? oauthStateStore.get(stateParam) : null;
    const origin = stateData?.origin || process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${origin}/admin/sessions?error=${encodeURIComponent(`Failed to authenticate with Google: ${error.message}`)}`);
  }
});

export default router;
