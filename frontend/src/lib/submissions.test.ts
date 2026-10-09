/**
 * Self-check for the submission upload rules. No framework: run it with
 *
 *   node frontend/src/lib/submissions.test.ts
 */

import assert from "node:assert/strict";
import {
  acceptAttribute,
  allowedExtensions,
  errorMessage,
  fileExtension,
  submissionObjectPath,
  validateSubmissionFile,
} from "./submissions.ts";

// The defaults carried by `assignments.max_file_size` / `allowed_file_types`.
const rules = {
  allowed_file_types: ["pdf", "xlsx", "py", "ipynb", "zip", "pbix", "sql", "png", "jpg"],
  max_file_size: 26214400, // 25 MB
};

// --- fileExtension -------------------------------------------------------
assert.equal(fileExtension("report.PDF"), "pdf");
assert.equal(fileExtension("archive.tar.gz"), "gz");
assert.equal(fileExtension("README"), "");
assert.equal(fileExtension(".env"), "", "a dotfile has no extension");

// --- allowedExtensions ---------------------------------------------------
assert.deepEqual(allowedExtensions([".PDF", "zip", " sql "]), ["pdf", "zip", "sql"]);
assert.deepEqual(allowedExtensions(null), []);

// --- acceptAttribute -----------------------------------------------------
assert.equal(acceptAttribute(["pdf", "zip"]), ".pdf,.zip");
assert.equal(acceptAttribute(null), undefined, "no restriction means no accept filter");

// --- validateSubmissionFile ----------------------------------------------
assert.equal(validateSubmissionFile({ name: "answers.pdf", size: 1024 }, rules), null);
assert.equal(
  validateSubmissionFile({ name: "answers.PDF", size: 1024 }, rules),
  null,
  "extension match is case-insensitive",
);

assert.match(
  validateSubmissionFile({ name: "notes.docx", size: 1024 }, rules) ?? "",
  /accepts pdf, xlsx/,
  "a disallowed extension is rejected and the message lists what is allowed",
);
assert.match(
  validateSubmissionFile({ name: "big.zip", size: 30 * 1024 * 1024 }, rules) ?? "",
  /30 MB.*25 MB limit/,
  "an oversized file is rejected and both sizes are named",
);
assert.match(validateSubmissionFile({ name: "empty.pdf", size: 0 }, rules) ?? "", /empty/);
assert.match(
  validateSubmissionFile({ name: "noext", size: 10 }, rules) ?? "",
  /accepts/,
  "a file with no extension cannot satisfy a restricted assignment",
);

// A row with no restrictions recorded accepts anything non-empty.
assert.equal(
  validateSubmissionFile({ name: "anything.xyz", size: 999_999_999 }, {
    allowed_file_types: null,
    max_file_size: null,
  }),
  null,
);

// --- submissionObjectPath ------------------------------------------------
const path = submissionObjectPath("user-1", "assignment-9", "my final report (v2).pdf");
assert.equal(
  path.split("/")[0],
  "user-1",
  "the owner must stay the first segment — the bucket's RLS policy matches on it",
);
assert.equal(path.split("/")[1], "assignment-9");
assert.match(
  path.split("/")[2],
  /^\d+-my_final_report_v2_.pdf$/,
  "the timestamp prefix is what keeps a resubmission from overwriting the first attempt",
);
assert.ok(
  !/[^A-Za-z0-9._\-/]/.test(path),
  "object keys stay within a safe character set",
);
// --- errorMessage --------------------------------------------------------
assert.equal(errorMessage(new Error("bucket not found"), "fallback"), "bucket not found");
assert.equal(
  // What a failed insert looks like: a plain object, not an Error.
  errorMessage({ message: "new row violates row-level security policy", code: "42501" }, "fallback"),
  "new row violates row-level security policy",
);
assert.equal(errorMessage(null, "fallback"), "fallback");
assert.equal(errorMessage({ message: "" }, "fallback"), "fallback", "an empty message is no message");

console.log("submissions: all checks passed");
