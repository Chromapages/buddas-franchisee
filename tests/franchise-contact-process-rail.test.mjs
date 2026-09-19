import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const page = fs.readFileSync(path.resolve("src/app/franchise/contact/page.tsx"), "utf8");
const styles = fs.readFileSync(path.resolve("src/app/franchise/contact/contact-desktop.css"), "utf8");

test("contact follow-up rail preserves sequence and conditional path", () => {
  assert.match(page, /<ol className="contact-process-rail[^"]*" aria-label="Inquiry follow-up path">/);
  assert.match(page, /Step 1 · Internal review/);
  assert.match(page, /Step 2 · Team outreach/);
  assert.match(page, /Step 3 · Discovery call/);
  assert.doesNotMatch(page, /Franchise journey · stage 2|Next stage/);
  assert.match(page, /href="#inquiry-form" className="contact-process-return"/);
  assert.match(page, /aria-hidden="true"/);
  assert.match(styles, /\.contact-process-step:not\(:last-child\)::after[\s\S]*left: 3\.5rem/);
  assert.match(styles, /@media \(max-width: 63\.999rem\)/);
  assert.match(styles, /font-size: 1rem; line-height: 1\.5/);
});
