import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateTerritory,
  extractStateCode,
} from "../src/features/territory/territory-rules.ts";
import {
  PUBLISHED_FINANCIAL_THRESHOLDS,
  FRANCHISE_INVESTMENT_DISCLOSURE,
  ESTIMATED_INITIAL_INVESTMENT_TABLE,
  ITEM_19_FPR_DATA,
} from "../src/features/financials/financial-data.ts";
import {
  buildInsertFddReceiptQuery,
  buildSelectFddReceiptByTokenQuery,
  buildSignFddReceiptQuery,
} from "../src/features/fdd/db-storage.ts";
import {
  InMemoryFddStorage,
  defaultFddStorage,
} from "../src/features/fdd/storage-adapter.ts";
import { classifyInquiry } from "../src/features/inquiry/storage-adapter.ts";

test("extractStateCode identifies state abbreviations and full names", () => {
  assert.equal(extractStateCode("Honolulu, HI"), "HI");
  assert.equal(extractStateCode("Salt Lake City, UT"), "UT");
  assert.equal(extractStateCode("Austin, Texas"), "TX");
  assert.equal(extractStateCode("Seattle, Washington"), "WA");
  assert.equal(extractStateCode("New York City"), "NY");
  assert.equal(extractStateCode("London, UK"), "UK");
});

test("evaluateTerritory classifies approved, pending, and expansion markets", () => {
  const hawaii = evaluateTerritory("HI");
  assert.equal(hawaii.status, "APPROVED");
  assert.equal(hawaii.isAvailableForActiveOffering, true);

  const utah = evaluateTerritory("Salt Lake City, UT");
  assert.equal(utah.status, "APPROVED");
  assert.equal(utah.isAvailableForActiveOffering, true);

  const newYork = evaluateTerritory("NY");
  assert.equal(newYork.status, "PENDING_REGISTRATION");
  assert.equal(newYork.isAvailableForActiveOffering, false);

  const oregon = evaluateTerritory("OR");
  assert.equal(oregon.status, "FUTURE_EXPANSION");
  assert.equal(oregon.isAvailableForActiveOffering, false);
});

test("classifyInquiry correctly handles broker codes and experience", () => {
  const brokerLead = {
    firstName: "Test",
    lastName: "Candidate",
    email: "lead@example.com",
    phone: "(808) 555-0100",
    cityState: "Honolulu, HI",
    marketInterest: "Oahu",
    experience: "General business experience",
    investmentRange: FRANCHISE_INVESTMENT_DISCLOSURE.inquiryOptions[1],
    preferredTimeline: "0 - 6 months",
    brokerId: "FSO-999",
    consent: "on",
  };

  assert.equal(classifyInquiry(brokerLead), "BROKER_REFERRAL");

  const qualifiedLead = {
    ...brokerLead,
    brokerId: undefined,
    experience: "15 years multi-unit restaurant and bakery general manager.",
  };
  assert.equal(classifyInquiry(qualifiedLead), "QUALIFIED_CANDIDATE");
});

test("financial datasets provide accurate thresholds and Item 19 FPR benchmarks", () => {
  assert.equal(PUBLISHED_FINANCIAL_THRESHOLDS.initialFranchiseFee, 35000);
  assert.equal(PUBLISHED_FINANCIAL_THRESHOLDS.estimatedInvestmentLow, 425000);
  assert.equal(PUBLISHED_FINANCIAL_THRESHOLDS.estimatedInvestmentHigh, 875000);
  assert.equal(PUBLISHED_FINANCIAL_THRESHOLDS.liquidCapitalRequirement, 150000);

  assert.ok(ESTIMATED_INITIAL_INVESTMENT_TABLE.length >= 5);
  assert.ok(ITEM_19_FPR_DATA.some((r) => r.metric.includes("AUV")));
});

test("FDD db queries and storage adapter record Item 23 digital receipt", async () => {
  const receiptInput = {
    id: "FDD-TEST-001",
    token: "token-abc-123",
    inquiryId: "INQ-1001",
    prospectName: "Maya Lindqvist",
    prospectEmail: "maya@example.com",
    fddVersion: "2026.1",
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 100000).toISOString(),
  };

  // 1. Test SQL query builders
  const insertQuery = buildInsertFddReceiptQuery(receiptInput);
  assert.ok(insertQuery.text.includes("INSERT INTO fdd_receipts"));
  assert.equal(insertQuery.values[1], "token-abc-123");

  const selectQuery = buildSelectFddReceiptByTokenQuery("token-abc-123");
  assert.ok(selectQuery.text.includes("WHERE token = $1"));
  assert.deepEqual(selectQuery.values, ["token-abc-123"]);

  const signQuery = buildSignFddReceiptQuery("token-abc-123", "Maya Lindqvist", "1.1.1.1", "Chrome");
  assert.ok(signQuery.text.includes("UPDATE fdd_receipts"));
  assert.equal(signQuery.values[1], "Maya Lindqvist");

  // 2. Test In-Memory Storage execution
  const storage = new InMemoryFddStorage();
  const created = await storage.createReceipt(receiptInput);
  assert.equal(created.status, "PENDING");

  const retrieved = await storage.getReceiptByToken("token-abc-123");
  assert.ok(retrieved);
  assert.equal(retrieved?.prospectEmail, "maya@example.com");

  const signed = await storage.recordSignature("token-abc-123", "Maya Lindqvist", "192.168.1.1", "Mozilla");
  assert.ok(signed);
  assert.equal(signed?.status, "SIGNED");
  assert.equal(signed?.signatureLegalName, "Maya Lindqvist");
  assert.ok(signed?.signedAt);
});
