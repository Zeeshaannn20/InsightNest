/**
 * Assignment submission uploads.
 *
 * Files live in the private `submissions` bucket under
 * `<user id>/<assignment id>/<timestamp>-<file name>`. The first path segment is
 * what the bucket's RLS policies match against `auth.uid()`, so it has to stay
 * first — see `20261006120000_submissions_storage.sql`.
 *
 * `submissions.file_url` stores that object path, not a URL: the bucket is
 * private, so links are signed on demand and expire.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const SUBMISSION_BUCKET = "submissions";

/** How long a generated download link stays valid. */
const SIGNED_URL_TTL_SECONDS = 60;

/** Extension without the dot, lowercased. Empty when the name has none. */
export function fileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  // `> 0` so a dotfile ("…/.env") counts as having no extension.
  return dot > 0 ? fileName.slice(dot + 1).toLowerCase() : "";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

/** Extensions an assignment accepts, normalised (".PDF" and "pdf" both → "pdf"). */
export function allowedExtensions(allowedFileTypes: string[] | null | undefined): string[] {
  return (allowedFileTypes ?? [])
    .map((type) => type.replace(/^\./, "").trim().toLowerCase())
    .filter(Boolean);
}

/** `accept` attribute for a file input, or undefined when anything goes. */
export function acceptAttribute(allowedFileTypes: string[] | null | undefined): string | undefined {
  const extensions = allowedExtensions(allowedFileTypes);
  return extensions.length > 0 ? extensions.map((e) => `.${e}`).join(",") : undefined;
}

/**
 * Returns a message explaining why the file is not acceptable, or null when it
 * is. The bucket enforces its own size ceiling server-side; this is the
 * per-assignment rule, checked up front so the student finds out before a long
 * upload rather than after it.
 */
export function validateSubmissionFile(
  file: { name: string; size: number },
  rules: { allowed_file_types?: string[] | null; max_file_size?: number | null },
): string | null {
  if (file.size === 0) {
    return "That file is empty.";
  }

  const extensions = allowedExtensions(rules.allowed_file_types);
  if (extensions.length > 0 && !extensions.includes(fileExtension(file.name))) {
    return `This assignment accepts ${extensions.join(", ")} files only.`;
  }

  const maxBytes = rules.max_file_size ?? 0;
  if (maxBytes > 0 && file.size > maxBytes) {
    return `That file is ${formatBytes(file.size)}, over the ${formatBytes(maxBytes)} limit for this assignment.`;
  }

  return null;
}

/**
 * Storage object path for an upload. Object keys are restricted, so the file
 * name is reduced to a safe set and the timestamp keeps resubmissions distinct.
 */
export function submissionObjectPath(userId: string, assignmentId: string, fileName: string): string {
  const safeName = fileName.replace(/[^A-Za-z0-9._-]+/g, "_").slice(-100) || "submission";
  return `${userId}/${assignmentId}/${Date.now()}-${safeName}`;
}

/**
 * Message out of whatever an upload threw. Supabase reports storage failures as
 * `Error`s but database ones as plain `{ message, code, … }` objects, so an
 * `instanceof Error` check alone would drop the more useful half.
 */
export function errorMessage(err: unknown, fallback: string): string {
  const message =
    typeof err === "object" && err !== null && "message" in err
      ? String((err as { message: unknown }).message)
      : "";
  return message || fallback;
}

/** A link the browser can open for a stored submission. */
export async function submissionFileUrl(
  supabase: SupabaseClient,
  fileUrl: string,
): Promise<string> {
  // Rows predating storage uploads hold a plain URL; pass those through.
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  const { data, error } = await supabase.storage
    .from(SUBMISSION_BUCKET)
    .createSignedUrl(fileUrl, SIGNED_URL_TTL_SECONDS);

  if (error || !data) throw new Error(error?.message ?? "Could not open that file.");
  return data.signedUrl;
}
