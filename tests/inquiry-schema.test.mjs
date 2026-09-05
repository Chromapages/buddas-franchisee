import assert from "node:assert/strict";
import test from "node:test";
import { inquirySchema } from "../src/features/inquiry/schema.ts";

test("inquirySchema validates clean, valid franchise inquiry", () => {
  const validData = {
    firstName: "Maya",
    lastName: "Lindqvist",
    email: "maya@example.com",
    phone: "(808) 555-0199",
    cityState: "Honolulu, HI",
    marketInterest: "Oahu - Windward Coast",
    experience: "10 years managing high-volume multi-unit bakery restaurants.",
    investmentRange: "$425,000 – $875,000",
    preferredTimeline: "6 - 12 months",
    message: "Interested in a multi-unit territory.",
    brokerId: "FSO-889",
    consent: "on",
  };

  const parsed = inquirySchema.safeParse(validData);
  assert.ok(parsed.success);
  if (parsed.success) {
    assert.equal(parsed.data.firstName, "Maya");
    assert.equal(parsed.data.email, "maya@example.com");
    assert.equal(parsed.data.brokerId, "FSO-889");
  }
});

test("inquirySchema rejects invalid email and missing consent", () => {
  const invalidData = {
    firstName: "Maya",
    lastName: "Lindqvist",
    email: "not-an-email",
    phone: "123",
    cityState: "Honolulu, HI",
    marketInterest: "Oahu",
    experience: "Experience details",
    investmentRange: "$425,000 – $875,000",
    preferredTimeline: "6 - 12 months",
  };

  const parsed = inquirySchema.safeParse(invalidData);
  assert.equal(parsed.success, false);
});

test("inquirySchema rejects empty required fields and short experience", () => {
  const parsed = inquirySchema.safeParse({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cityState: "",
    marketInterest: "",
    experience: "Too short",
    investmentRange: "$425,000 – $875,000",
    preferredTimeline: "6 - 12 months",
    consent: "",
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    assert.equal(errors.firstName?.[0], "First name is required.");
    assert.match(errors.experience?.[0] ?? "", /at least 20 characters/);
  }
});

test("inquirySchema rejects malformed email and phone formats", () => {
  const parsed = inquirySchema.safeParse({
    firstName: "Maya",
    lastName: "Lindqvist",
    email: "maya.example.com",
    phone: "abc",
    cityState: "Honolulu, HI",
    marketInterest: "Oahu",
    experience: "I have operated restaurant teams for more than ten years.",
    investmentRange: "$425,000 – $875,000",
    preferredTimeline: "6 - 12 months",
    message: "",
    brokerId: "",
    consent: "on",
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    assert.equal(errors.email?.[0], "Enter a valid email address.");
    assert.equal(errors.phone?.[0], "Enter a valid phone number.");
  }
});
