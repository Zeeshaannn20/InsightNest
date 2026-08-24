import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing point for links Supabase emails out — password recovery today,
 * magic links or email confirmation if they are ever turned on.
 *
 * Supabase sends either a `code` (PKCE) or a `token_hash` + `type`, depending
 * on how the email template is written, so both are handled. Exchanging here
 * rather than in the browser means the session is written as an httpOnly
 * cookie the server can read.
 */

/**
 * `next` arrives in the query string, so it is attacker-controllable. Only
 * same-site paths are allowed — without this check a crafted link could send
 * someone from a genuine insightnest.in email to another origin.
 */
function safeNext(next: string | null): string {
  if (!next) return "/dashboard";
  if (!next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//")) return "/dashboard";   // protocol-relative URL
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeNext(searchParams.get("next"));

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "recovery" | "email" | "signup" | "invite" | "magiclink",
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  // Recovery links are single use and time limited, so an expired or reused
  // link lands here. Say so rather than showing a blank failure.
  return NextResponse.redirect(`${origin}/login?error=link_expired`);
}
