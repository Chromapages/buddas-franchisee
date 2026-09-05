import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const read = (file) => fs.readFileSync(path.resolve(file), "utf8");
const page = read("src/app/franchise/process/page.tsx");
const content = read("src/features/franchise/process-content.ts");
const desktopDossier = read("src/components/public/process-desktop-dossier.tsx");
const closingCta = read("src/components/public/process-closing-cta.tsx");
const details = read("src/components/public/process-stage-details.tsx");
const interactionAnalytics = read("src/components/public/process-interaction-analytics.tsx");
const analytics = read("src/lib/analytics.ts");
const releaseGate = read("scripts/verify-process-release.ts");

test("process page reads metadata and stage content from the canonical process model", () => {
  assert.match(page, /const processContent = getPublicFranchiseProcessContent\(\)/);
  assert.match(page, /title: processContent\.metadata\.title/);
  assert.match(page, /canonical: processContent\.metadata\.canonicalPath/);
  assert.doesNotMatch(page, /process-mobile-overview/);
  assert.match(page, /<div className="lg:hidden">/);
  assert.match(page, /process-spine process-content-grid mt-6/);
  assert.match(page, /Franchise Disclosure Document review/);
  assert.match(page, /process-spine-stage/);
  assert.match(page, /Budda&apos;s evaluates/);
  assert.match(page, /You evaluate/);
  assert.match(page, /Decision gate:/);
  assert.match(page, /processContent\.legalGovernance\.federalTiming/);
  assert.match(desktopDossier, /data-process-analytics="overview-stage"/);
  assert.match(page, /data-process-analytics="related-link"/);
  assert.match(page, /<ProcessInteractionAnalytics \/>/);
  assert.match(page, /<ProcessClosingCta content=\{processContent\.closing\} \/>/);
});

test("process content model captures governed stage, legal, and closing content", () => {
  assert.match(content, /export type ProcessTimingType = "LEGAL" \| "TYPICAL" \| "TARGET" \| "ESTIMATED"/);
  assert.match(content, /publicStatus: ProcessCopyPublicStatus/);
  assert.match(content, /effectiveDate: string \| null/);
  assert.match(content, /sourceOwner: string/);
  assert.match(content, /export type ProcessLegalGovernance/);
  assert.match(content, /federalTiming/);
  assert.match(content, /item23Context/);
  assert.match(content, /independentAdvisorLanguage/);
  assert.match(content, /operatorValidationLanguage/);
  assert.match(content, /territoryAgreementLanguage/);
  assert.match(content, /approvedTimingLabel/);
  assert.match(content, /detailDisclosureLabel/);
  assert.match(content, /relatedLinks/);
  assert.match(content, /afterApprovalSummary/);
  assert.match(content, /primaryBoundaryNote/);
  for (const id of ["initial-inquiry", "discovery-call", "fdd-disclosure", "discovery-day"]) {
    assert.match(content, new RegExp(`id: "${id}"`));
  }
  assert.match(content, /getPublicFranchiseProcessContent/);
  assert.match(content, /getProcessReleaseBlockers/);
  assert.match(content, /Attendance does not itself confirm approval, a territory award, or agreement execution/);
});

test("process closing CTA and detail disclosure stay driven by accessible real controls", () => {
  assert.match(closingCta, /content: PublicFranchiseProcessContent\["closing"\]/);
  assert.match(closingCta, /Opening inquiry\.\.\./);
  assert.match(closingCta, /content\.primaryBoundaryNote/);
  assert.match(details, /aria-expanded=\{isOpen\}/);
  assert.match(details, /aria-controls=\{panelId\}/);
  assert.match(details, /hidden=\{!isOpen\}/);
  assert.match(details, /inert=\{!isOpen\}/);
  assert.match(details, /process_stage_detail_open/);
  assert.match(details, /process_stage_detail_close/);
  assert.match(closingCta, /process_after_approval_click/);
  assert.match(closingCta, /process_destination_id: "initial_inquiry"/);
});

test("process analytics records only stable stage and destination identifiers", () => {
  assert.match(interactionAnalytics, /Progressive enhancement only/);
  assert.match(interactionAnalytics, /process_overview_stage_click/);
  assert.match(interactionAnalytics, /process_related_link_click/);
  assert.match(interactionAnalytics, /process_stage_id: stageId/);
  assert.match(interactionAnalytics, /process_destination_id: link\.dataset\.processDestinationId/);
  assert.match(analytics, /export type ProcessStageId/);
  assert.match(analytics, /process_stage_detail_open/);
  assert.match(analytics, /process_after_approval_click/);
});

test("process release gate checks reviewedAt and effectiveDate across governed public fields", () => {
  assert.match(releaseGate, /getProcessReleaseBlockers/);
  assert.match(releaseGate, /effectiveDate=/);
  assert.match(releaseGate, /Process release gate failed/);
});
