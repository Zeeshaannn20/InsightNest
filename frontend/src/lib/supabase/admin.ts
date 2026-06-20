import { createServerClient } from "@supabase/ssr";

// Admin client with service role key — bypasses RLS
// Used for user management operations (create user, reset password, etc.)
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your .env.local file.\n" +
      "Find it in Supabase Dashboard → Settings → API → service_role key."
    );
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}
