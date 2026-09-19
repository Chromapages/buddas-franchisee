import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  getApprovedPillarEvidence,
  FinancialPerformanceEvidenceSchema,
  PillarQuoteSchema,
  getPublicWhyBuddasPillarsContent,
  PillarEvidenceItemSchema,
  PillarsSchema,
  WHY_BUDDAS_PILLARS,
  WHY_BUDDAS_PILLARS_SECTION,
  selectPublicPillarQuotePillarId,
} from "../src/features/why-buddas/pillars-config.ts";

const approvedProvenance = (claimId, contentOwners) => ({
  claimId,
  sourceId: "test-source",
  sourceReference: "Internal approval fixture",
  measurementDefinition: null,
  measurementPeriod: null,
  applicableOutlets: null,
  contentOwners,
  approvalOwner: "Test approval owner",
  lastReviewedAt: "2026-01-01",
  publicUsePermission: "APPROVED",
  fddItem19Mapping: null,
  expiresAt: null,
  reviewTrigger: null,
});

test("WHY_BUDDAS_PILLARS exposes four stable proof-rail destinations", () => {
  assert.deepEqual(
    WHY_BUDDAS_PILLARS.map((pillar) => pillar.id),
    ["bakery-product", "daypart-format", "production-approach", "hospitality-standard"]
  );
  assert.deepEqual(
    WHY_BUDDAS_PILLARS.map((pillar) => pillar.number),
    ["01", "02", "03", "04"]
  );
});

test("each pillar uses the same candidate-facing content anatomy", () => {
  for (const pillar of WHY_BUDDAS_PILLARS) {
    assert.equal(pillar.publicationStatus, "PUBLISHED");
    assert.equal(pillar.claimReviewStatus, "REVIEW_REQUIRED");
    assert.ok(pillar.publicTitle.text.length > 0, `${pillar.id} has a public title`);
    assert.ok(pillar.shortLabel.text.length > 0, `${pillar.id} has a short label`);
    assert.ok(pillar.operatingThesis.text.length > 0, `${pillar.id} has an operating thesis`);
    assert.ok(pillar.evidenceHeading.text.length > 0, `${pillar.id} has an evidence heading`);
    assert.ok(pillar.evidenceEmptyState.text.length > 0, `${pillar.id} has an evidence fallback`);
    assert.ok(pillar.operatorLens.text.length > 0, `${pillar.id} has a diligence lens`);
    assert.ok(pillar.visualFallback.text.length > 0, `${pillar.id} has a non-image fallback`);
    assert.ok(Array.isArray(pillar.evidenceItems), `${pillar.id} has evidence items`);
    assert.equal(pillar.provenance.sourceReference, null);
  }
});

test("the authoritative schema accepts approved qualitative and quantitative evidence", () => {
  assert.equal(PillarsSchema.safeParse(WHY_BUDDAS_PILLARS).success, true);

  const approvedEvidence = PillarEvidenceItemSchema.parse({
    id: "sample-quantitative-evidence",
    kind: "QUANTITATIVE",
    classification: "QUANTITATIVE_OPERATING",
    label: "Approved sample measure",
    value: "42",
    explanation: "A fixture proving the schema can represent an approved public metric.",
    publicationStatus: "PUBLISHED",
    claimReviewStatus: "APPROVED",
    provenance: approvedProvenance("test.sample-quantitative-evidence", ["Operations"]),
    financialPerformance: null,
  });

  const pillarWithApprovedEvidence = {
    ...WHY_BUDDAS_PILLARS[0],
    evidenceItems: [approvedEvidence],
  };

  assert.deepEqual(getApprovedPillarEvidence(pillarWithApprovedEvidence), [approvedEvidence]);
  assert.deepEqual(
    getApprovedPillarEvidence({
      ...pillarWithApprovedEvidence,
      evidenceItems: [
        {
          ...approvedEvidence,
          provenance: {
            ...approvedEvidence.provenance,
            expiresAt: "2025-01-01",
          },
        },
      ],
    }),
    []
  );
});

test("financial-performance evidence cannot render without complete franchise approval", () => {
  const financialApprovalRecord = FinancialPerformanceEvidenceSchema.parse({
    approvedSourceReference: "Item 19 approved source fixture",
    currentValue: "42%",
    sampleDefinition: "A defined sample population",
    measurementPeriod: "Calendar year 2025",
    limitations: "Illustrative test fixture only",
    writtenSubstantiationReference: "Internal substantiation fixture",
    franchiseApprovalStatus: "PENDING_REVIEW",
    requiresItem19: true,
    item19ApprovalStatus: "PENDING_REVIEW",
  });

  const pendingFinancialEvidence = PillarEvidenceItemSchema.parse({
    id: "pending-financial-evidence",
    kind: "QUANTITATIVE",
    classification: "FINANCIAL_PERFORMANCE",
    label: "Sample revenue fixture",
    value: "42%",
    explanation: "A test-only financial-performance evidence record.",
    publicationStatus: "PUBLISHED",
    claimReviewStatus: "APPROVED",
    provenance: approvedProvenance("test.pending-financial-evidence", ["Franchise Legal"]),
    financialPerformance: financialApprovalRecord,
  });

  const pillarWithPendingFinancialEvidence = {
    ...WHY_BUDDAS_PILLARS[0],
    evidenceItems: [pendingFinancialEvidence],
  };

  assert.deepEqual(getApprovedPillarEvidence(pillarWithPendingFinancialEvidence), []);
  assert.equal(
    PillarEvidenceItemSchema.safeParse({
      ...pendingFinancialEvidence,
      classification: "QUANTITATIVE_OPERATING",
      financialPerformance: null,
    }).success,
    false
  );
});

test("the evidence schema supports qualitative proof alongside zero to three metrics", () => {
  for (const kind of ["QUALITATIVE", "OPERATING_FACT", "PRODUCT_SYSTEM_FACT", "PROCESS_STANDARD", "SOURCE_STATEMENT"]) {
    assert.equal(
      PillarEvidenceItemSchema.safeParse({
        id: `sample-${kind.toLowerCase().replaceAll("_", "-")}`,
        kind,
        classification: "QUALITATIVE_OPERATING",
        label: "Approved qualitative fixture",
        value: null,
        explanation: "A fixture proving the evidence system does not require a metric.",
        publicationStatus: "PUBLISHED",
        claimReviewStatus: "APPROVED",
        provenance: approvedProvenance(`test.${kind.toLowerCase()}`, ["Operations"]),
        financialPerformance: null,
      }).success,
      true,
      `${kind} should be a valid qualitative proof type`
    );
  }
});

test("quotes require attributable qualitative context and only one can occupy the public slot", () => {
  const approvedQuote = PillarQuoteSchema.parse({
    text: "The product gives our team a shared point of care in the guest experience.",
    speakerName: "Sample speaker",
    speakerRole: "Operations leader",
    uniqueContext: "A qualitative view of team stewardship that is not repeated in the pillar thesis.",
    publicationStatus: "PUBLISHED",
    claimReviewStatus: "APPROVED",
    provenance: approvedProvenance("test.approved-quote", ["Operations"]),
  });

  const pillarsWithTwoQuotes = [
    { ...WHY_BUDDAS_PILLARS[0], quote: approvedQuote },
    { ...WHY_BUDDAS_PILLARS[1], quote: { ...approvedQuote, speakerName: "Second speaker" } },
  ];

  assert.equal(selectPublicPillarQuotePillarId(pillarsWithTwoQuotes), "bakery-product");
  assert.equal(
    PillarQuoteSchema.safeParse({ ...approvedQuote, text: "This is our customer acquisition hook." }).success,
    false
  );
});

test("the comparative H2 stays withheld without an approved comparison record", () => {
  const claim = WHY_BUDDAS_PILLARS_SECTION.comparativeHeading;

  assert.equal(claim.text, "Why Budda's Outperforms Conventional Fast-Casual");
  assert.equal(claim.disposition, "WITHHELD");
  assert.equal(claim.claimReviewStatus, "REVIEW_REQUIRED");
  assert.equal(claim.comparisonDimension, null);
  assert.equal(claim.comparisonSet, null);
  assert.deepEqual(claim.approvedEvidenceIds, []);
});

test("the client-facing pillar model excludes withheld claims and review metadata", () => {
  const publicContent = getPublicWhyBuddasPillarsContent();
  const contextualLinks = publicContent.pillars.flatMap((pillar) =>
    pillar.contextualLink ? [pillar.contextualLink] : []
  );

  assert.equal(publicContent.pillars.length, 4);
  assert.deepEqual(contextualLinks, [
    {
      href: "/franchise/the-opportunity",
      label: "Explore the franchise opportunity",
      destinationId: "franchise-opportunity",
    },
  ]);
  assert.doesNotMatch(
    JSON.stringify(publicContent),
    /Why Budda's Outperforms Conventional Fast-Casual|sourceReference|claimReviewStatus/
  );
});

test("desktop and mobile pillar presentations keep all four pillars readable", async () => {
  const [root, desktop, mobile, proof] = await Promise.all([
    readFile(new URL("../src/components/public/why-buddas-pillars.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/public/why-buddas-pillars-desktop.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/public/why-buddas-pillars-mobile.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/public/why-buddas-pillar-proof.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(root, /WhyBuddasPillarsDesktop/);
  assert.match(root, /WhyBuddasPillarsMobile/);
  assert.match(root, /useSyncExternalStore/);
  assert.match(desktop, /<ol className=\{styles\.modelPillars\}>/);
  assert.match(desktop, /The Budda&apos;s/);
  assert.match(desktop, /One operating model\. Four connected responsibilities\./);
  assert.doesNotMatch(desktop, /role="tab"|role="tabpanel"|hidden=!isActive/);
  assert.match(mobile, /<ol className=\{styles\.mobileList\}>/);
  assert.match(mobile, /<section id=\{pillar\.id\}/);
  assert.doesNotMatch(mobile, /role="tab"|role="tabpanel"/);
  assert.match(proof, /href=\{pillar\.contextualLink\.href\}/);
  assert.match(proof, /why_buddas_pillar_resource_open/);
  assert.doesNotMatch(`${root}${desktop}${mobile}${proof}`, /Why Budda's Outperforms Conventional Fast-Casual/);
  assert.doesNotMatch(`${root}${desktop}${mobile}${proof}`, /\/images\/buddas-hero\.png|SUPPORTING_IMAGE|\$28\+|\+\$14/);
});
