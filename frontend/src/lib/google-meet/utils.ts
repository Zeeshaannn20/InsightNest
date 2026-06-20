import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";

/**
 * Creates and configures a Google OAuth2 client with tokens fetched from Supabase.
 * Sets up token refresh listener to automatically save updated access tokens to the database.
 */
export async function getGoogleOAuthClient(userId: string) {
  const supabase = await createClient();

  // 1. Fetch saved tokens
  const { data: tokenData, error: tokenError } = await supabase
    .from("user_google_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (tokenError || !tokenData) {
    throw new Error("Google Calendar integration is not set up or disconnected.");
  }

  // 2. Initialize OAuth client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expiry_date: Number(tokenData.expiry_date)
  });

  // 3. Set up event listener to automatically refresh access token in DB when expired
  oauth2Client.on("tokens", async (newTokens) => {
    const updateData: Record<string, string | number> = {};
    if (newTokens.access_token) {
      updateData.access_token = newTokens.access_token;
    }
    if (newTokens.expiry_date) {
      updateData.expiry_date = newTokens.expiry_date;
    }
    
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("user_google_tokens")
        .update(updateData)
        .eq("user_id", userId);
        
      if (updateError) {
        console.error("Failed to update refreshed Google tokens in database:", updateError);
      }
    }
  });

  return oauth2Client;
}

interface MeetGenerationInput {
  userId: string;
  title: string;
  description: string;
  sessionDate: string; // YYYY-MM-DD
  startTime: string;   // HH:MM or HH:MM:SS
  endTime: string;     // HH:MM or HH:MM:SS
}

/**
 * Creates a calendar event on the user's primary Google Calendar with Google Meet enabled.
 * Returns the generated Google Meet link.
 */
export async function generateGoogleMeetLink({
  userId,
  title,
  description,
  sessionDate,
  startTime,
  endTime
}: MeetGenerationInput): Promise<string> {
  const oauth2Client = await getGoogleOAuthClient(userId);

  // Initialize Google Calendar Client
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Format start/end times into ISO strings.
  // Assumes local dates/times. If inputs are just time (e.g. HH:MM), format properly.
  const startISO = new Date(`${sessionDate}T${startTime}`).toISOString();
  const endISO = new Date(`${sessionDate}T${endTime}`).toISOString();

  // Create event with conference data
  const response = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1, // Must be 1 to enable hangoutLink generation
    requestBody: {
      summary: title,
      description: description,
      start: {
        dateTime: startISO,
        timeZone: "UTC"
      },
      end: {
        dateTime: endISO,
        timeZone: "UTC"
      },
      conferenceData: {
        createRequest: {
          requestId: `session-${Date.now()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet"
          }
        }
      }
    }
  });

  const meetLink = response.data.hangoutLink;

  if (!meetLink) {
    throw new Error("Failed to generate Google Meet URL from event creation.");
  }

  return meetLink;
}
