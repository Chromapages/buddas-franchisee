import {
  OPPORTUNITY_DOSSIER_CONTENT,
  type GovernedOpportunityCopy,
} from "../src/features/franchise/opportunity-content.ts";

type SensitiveCopy = { path: string; copy: GovernedOpportunityCopy };

const sensitiveCopy: SensitiveCopy[] = [];

const collectSensitiveCopy = (value: unknown, path: string) => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectSensitiveCopy(item, `${path}[${index}]`));
    return;
  }

  if (!value || typeof value !== "object") return;

  const record = value as Record<string, unknown>;
  if ("text" in record && "governance" in record) {
    const copy = record as unknown as GovernedOpportunityCopy;
    if (copy.governance.classification !== "EDITORIAL") sensitiveCopy.push({ path, copy });
    return;
  }

  Object.entries(record).forEach(([key, child]) => collectSensitiveCopy(child, `${path}.${key}`));
};

collectSensitiveCopy(OPPORTUNITY_DOSSIER_CONTENT, "OPPORTUNITY_DOSSIER_CONTENT");

const unresolved = sensitiveCopy.filter(({ copy }) => {
  const { governance } = copy;
  return governance.verificationStatus !== "VERIFIED"
    || governance.reviewStatus !== "APPROVED"
    || !governance.reviewedAt
    || !governance.sourceReference;
});

if (unresolved.length) {
  const report = unresolved.map(({ path, copy }) => {
    const { governance } = copy;
    return `${path}: ${governance.verificationStatus}; owner=${governance.owner}; source=${governance.sourceReference ?? "missing"}`;
  }).join("\n");
  throw new Error(`Opportunity release blocked by unverified sensitive copy:\n${report}`);
}

console.log(`Verified ${sensitiveCopy.length} sensitive opportunity-copy records.`);
