import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase clients.
 *
 * SUPABASE_SERVICE_ROLE_KEY must never carry the NEXT_PUBLIC_ prefix — that
 * would ship it to every browser and hand out full database access.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value.trim();
}

/** Bypasses RLS. Only for webhooks and admin actions the user cannot perform. */
export function serviceClient() {
  const url =
    process.env.SUPABASE_URL?.trim() || required("NEXT_PUBLIC_SUPABASE_URL");
  return createClient(url, required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Acts as the signed-in caller, so RLS still applies. */
export function userClient(accessToken: string) {
  const url =
    process.env.SUPABASE_URL?.trim() || required("NEXT_PUBLIC_SUPABASE_URL");
  const anon =
    process.env.SUPABASE_ANON_KEY?.trim() ||
    required("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Result of an auth check. The `ok` discriminant lets callers narrow with a
 * plain `if (!auth.ok)` — an `"error" in auth` check does not narrow reliably
 * when the success branch has optional properties.
 */
export type AuthResult =
  | { ok: true; user: { id: string; email?: string }; token: string; supabase: ReturnType<typeof userClient> }
  | { ok: false; error: string; status: 401 | 403 };

/** Pull the bearer token off a request and resolve the user it belongs to. */
export async function authenticate(request: Request): Promise<AuthResult> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return { ok: false, error: "Unauthorized: missing authentication header", status: 401 };
  }

  const token = header.slice(7);
  const supabase = userClient(token);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { ok: false, error: "Unauthorized: invalid session", status: 401 };
  }
  return { ok: true, user, token, supabase };
}

/**
 * Authenticate, then require the caller to be an active admin.
 * The Express backend applied this to its whole admin router; route handlers
 * have no shared middleware, so each admin route must call this itself.
 */
export async function requireAdmin(request: Request): Promise<AuthResult> {
  const auth = await authenticate(request);
  if (!auth.ok) return auth;

  const { data: profile, error } = await auth.supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", auth.user.id)
    .single();

  if (error || !profile) return { ok: false, error: "Profile not found", status: 403 };
  if (!profile.is_active) return { ok: false, error: "Account is not active", status: 403 };
  if (profile.role !== "admin") return { ok: false, error: "Admin access required", status: 403 };

  return auth;
}
