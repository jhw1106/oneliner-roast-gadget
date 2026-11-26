// One-Line Roast entry: writes a single original roast of an everyday
// gadget to $MAKEFUN_OUTPUT_DIR/entry.txt (default /output).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE = "My printer only ever works when it senses I have absolutely nowhere to be.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const chars = [...LINE].length;
if (LINE.trim().length === 0 || chars < 1 || chars > 200) {
  console.error(`entry line must be 1-200 characters, got ${chars}`);
  process.exit(1);
}
// A one-line entry means exactly one line: any embedded carriage return or
// newline must fail, and the byte size must stay under the cap too, since a
// line of wide characters could otherwise pass the character count yet break
// the gate's byte limit.
if (/[\r\n]/.test(LINE)) {
  console.error("entry line must not contain a line break");
  process.exit(1);
}
const bytes = Buffer.byteLength(LINE, "utf8");
if (bytes > 800) {
  console.error(`entry line is ${bytes} UTF-8 bytes, over the 800-byte cap`);
  process.exit(1);
}
// Reject invisible control characters other than ordinary spaces, which
// could survive the length checks while corrupting the single-line entry.
if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(LINE)) {
  console.error("entry line must not contain control characters");
  process.exit(1);
}

const target = join(outDir, "entry.txt");
mkdirSync(outDir, { recursive: true });
writeFileSync(target, LINE, "utf8");
// Read back what landed on disk and confirm it is exactly the validated
// line, so a partial or mangled write can never pass silently.
if (readFileSync(target, "utf8") !== LINE) {
  console.error(`read-back mismatch in ${target}`);
  process.exit(1);
}
console.log(`wrote ${chars} characters to ${target} (verified)`);
