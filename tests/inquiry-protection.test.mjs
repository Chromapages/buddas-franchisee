import assert from "node:assert/strict";
import test from "node:test";
import {
  issueInquiryFormSession,
  verifyInquiryFormSession,
} from "../src/features/inquiry/form-token.ts";
import {
  getInquiryProtectionResult,
  reserveInquiry,
  recordDeliveredInquiry,
} from "../src/features/inquiry/protection.ts";
import { FRANCHISE_INVESTMENT_DISCLOSURE } from "../src/features/financials/financial-data.ts";

test("issueInquiryFormSession & verifyInquiryFormSession validate signed tokens", () => {
  const { session, token } = issueInquiryFormSession();
  assert.ok(token);

  const verification = verifyInquiryFormSession(token);
  assert.equal(verification.kind, "valid");
  if (verification.kind === "valid") {
    assert.equal(verification.data.id, session.id);
  }
});

test("verifyInquiryFormSession detects expired sessions", () => {
  const past = Date.now() - 1000 * 60 * 65; // 65 mins ago
  const { token } = issueInquiryFormSession(past);

  const verification = verifyInquiryFormSession(token, Date.now());
  assert.equal(verification.kind, "expired");
});

test("getInquiryProtectionResult prevents duplicate submissions", () => {
  const sampleInquiry = {
    firstName: "Koa",
    lastName: "Akana",
    email: "koa@example.com",
    phone: "(808) 555-9876",
    cityState: "La'ie, HI",
    marketInterest: "North Shore",
    experience: "Experienced operator",
    investmentRange: FRANCHISE_INVESTMENT_DISCLOSURE.inquiryOptions[2],
    preferredTimeline: "0 - 6 months",
    consent: "on",
  };

  const prot1 = getInquiryProtectionResult(sampleInquiry, "1.2.3.4", undefined, "tok-1");
  assert.equal(prot1.allowed, true);
  if (prot1.allowed) {
    reserveInquiry(prot1, "tok-1");
    recordDeliveredInquiry(prot1);
  }

  const prot2 = getInquiryProtectionResult(sampleInquiry, "1.2.3.4", undefined, "tok-1");
  assert.equal(prot2.allowed, false);
  if (!prot2.allowed) {
    assert.equal(prot2.reason, "delivered");
  }
});
