import assert from "node:assert/strict";
import test from "node:test";
import {
  CANDIDATE_FINANCIAL_QUALIFICATION,
  FRANCHISE_INVESTMENT_DISCLOSURE,
  getApprovedCandidateProfileFinancialQualification,
  isApprovedPublicFinancialPlacement,
  PUBLISHED_FINANCIAL_THRESHOLDS,
} from "../src/features/financials/financial-data.ts";
import { investmentRangeOptions } from "../src/features/inquiry/schema.ts";

test("hero and inquiry investment values share the FDD-backed disclosure config", () => {
  assert.equal(PUBLISHED_FINANCIAL_THRESHOLDS.estimatedInvestmentLow, 425_000);
  assert.equal(PUBLISHED_FINANCIAL_THRESHOLDS.estimatedInvestmentHigh, 875_000);
  assert.equal(FRANCHISE_INVESTMENT_DISCLOSURE.displayRange, "$425,000 – $875,000");
  assert.equal(investmentRangeOptions, FRANCHISE_INVESTMENT_DISCLOSURE.inquiryOptions);
  assert.equal(
    FRANCHISE_INVESTMENT_DISCLOSURE.publicationStatus,
    "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW",
  );
  assert.equal(FRANCHISE_INVESTMENT_DISCLOSURE.governance.fddEdition, null);
  assert.equal(FRANCHISE_INVESTMENT_DISCLOSURE.governance.effectiveDate, null);
  assert.equal(FRANCHISE_INVESTMENT_DISCLOSURE.governance.approvalExpiresAt, null);
  assert.deepEqual(FRANCHISE_INVESTMENT_DISCLOSURE.governance.approvedPlacements, []);
  assert.equal(CANDIDATE_FINANCIAL_QUALIFICATION.investmentRange, FRANCHISE_INVESTMENT_DISCLOSURE.displayRange);
  assert.equal(CANDIDATE_FINANCIAL_QUALIFICATION.contentOwner, "Franchise Development");
  assert.equal(getApprovedCandidateProfileFinancialQualification(), null);
});

test("public financial placements fail closed when approval metadata is stale", () => {
  const expiredApproval = {
    ...FRANCHISE_INVESTMENT_DISCLOSURE.governance,
    fddEdition: "2025 FDD",
    effectiveDate: "2025-01-01",
    reviewStatus: "APPROVED",
    reviewedBy: "Franchise Legal",
    reviewedAt: "2025-01-01",
    approvalExpiresAt: "2025-12-31",
    approvedPlacements: ["candidate-profile"],
  };

  assert.equal(
    isApprovedPublicFinancialPlacement(
      expiredApproval,
      "candidate-profile",
      new Date("2026-01-01"),
    ),
    false,
  );
});
