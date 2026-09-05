import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const homepage = fs.readFileSync(path.resolve("src/app/franchise/page.tsx"), "utf8");
const inquirySchema = fs.readFileSync(path.resolve("src/features/inquiry/schema.ts"), "utf8");

test("mobile hero proof points use the approved inquiry capital bracket", () => {
  assert.match(homepage, /FRANCHISE_INVESTMENT_DISCLOSURE/);
  assert.match(homepage, /<MapPin/);
  assert.match(homepage, /<DollarSign/);
  assert.match(homepage, /2 Operating Utah Restaurants/);
  assert.match(inquirySchema, /FRANCHISE_INVESTMENT_DISCLOSURE\.inquiryOptions/);
});
