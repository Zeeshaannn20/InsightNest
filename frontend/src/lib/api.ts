/**
 * Base URL of the backend API.
 *
 * Environment variables pasted into a hosting dashboard routinely pick up a
 * trailing newline or stray whitespace, which produces a URL like
 * "https://host\n/api/..." — malformed, so fetch throws before any request is
 * made and the failure looks like a server problem. Trim defensively here so a
 * bad paste can never break checkout again.
 */
export function apiBase(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5001";

  return raw.trim().replace(/\/+$/, "");
}
