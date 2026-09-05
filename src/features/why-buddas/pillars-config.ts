import { z } from "zod";

const PILLAR_PUBLICATION_STATUSES = ["DRAFT", "PUBLISHED", "WITHHELD", "ARCHIVED"] as const;
const PILLAR_CLAIM_REVIEW_STATUSES = ["APPROVED", "REVIEW_REQUIRED", "REJECTED", "EXPIRED"] as const;
const PILLAR_IDS = ["bakery-product", "daypart-format", "production-approach", "hospitality-standard"] as const;
const PILLAR_EVIDENCE_KINDS = [
  "QUALITATIVE",
  "QUANTITATIVE",
  "OPERATING_FACT",
  "PRODUCT_SYSTEM_FACT",
  "PROCESS_STANDARD",
  "SOURCE_STATEMENT",
] as const;
const PILLAR_IMAGE_SUBJECTS = ["PRODUCT_TRUTH", "OPERATING_SYSTEM", "PRODUCTION_PROCESS", "HOSPITALITY_SERVICE"] as const;
const PUBLIC_USE_PERMISSIONS = ["APPROVED", "WITHHELD", "EXPIRED"] as const;
const PILLAR_EVIDENCE_CLASSIFICATIONS = ["QUALITATIVE_OPERATING", "QUANTITATIVE_OPERATING", "FINANCIAL_PERFORMANCE"] as const;
const FINANCIAL_PERFORMANCE_APPROVAL_STATUSES = ["APPROVED", "PENDING_REVIEW", "REJECTED", "EXPIRED", "NOT_APPLICABLE"] as const;
const COMPARATIVE_CLAIM_DISPOSITIONS = ["PUBLISHED", "WITHHELD"] as const;

export const PillarPublicationStatusSchema = z.enum(PILLAR_PUBLICATION_STATUSES);
export const PillarClaimReviewStatusSchema = z.enum(PILLAR_CLAIM_REVIEW_STATUSES);
export const PillarIdSchema = z.enum(PILLAR_IDS);
export const PillarEvidenceKindSchema = z.enum(PILLAR_EVIDENCE_KINDS);
export const PillarImageSubjectSchema = z.enum(PILLAR_IMAGE_SUBJECTS);
export const PublicUsePermissionSchema = z.enum(PUBLIC_USE_PERMISSIONS);
export const PillarEvidenceClassificationSchema = z.enum(PILLAR_EVIDENCE_CLASSIFICATIONS);
export const FinancialPerformanceApprovalStatusSchema = z.enum(FINANCIAL_PERFORMANCE_APPROVAL_STATUSES);
export const ComparativeClaimDispositionSchema = z.enum(COMPARATIVE_CLAIM_DISPOSITIONS);

export const PillarProvenanceSchema = z.object({
  claimId: z.string().regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/),
  sourceId: z.string().min(1).nullable(),
  sourceReference: z.string().min(1).nullable(),
  measurementDefinition: z.string().min(1).nullable(),
  measurementPeriod: z.string().min(1).nullable(),
  applicableOutlets: z.array(z.string().min(1)).min(1).nullable(),
  contentOwners: z.array(z.string().min(1)).min(1),
  approvalOwner: z.string().min(1).nullable(),
  lastReviewedAt: z.string().date().nullable(),
  publicUsePermission: PublicUsePermissionSchema,
  fddItem19Mapping: z.string().min(1).nullable(),
  expiresAt: z.string().date().nullable(),
  reviewTrigger: z.string().min(1).nullable(),
});

export const PillarContentBlockSchema = z.object({
  label: z.string().min(1),
  text: z.string().min(1),
  claimReviewStatus: PillarClaimReviewStatusSchema,
  provenance: PillarProvenanceSchema,
});

export const FinancialPerformanceEvidenceSchema = z.object({
  approvedSourceReference: z.string().min(1),
  currentValue: z.string().min(1),
  sampleDefinition: z.string().min(1),
  measurementPeriod: z.string().min(1),
  limitations: z.string().min(1),
  writtenSubstantiationReference: z.string().min(1),
  franchiseApprovalStatus: FinancialPerformanceApprovalStatusSchema,
  requiresItem19: z.boolean(),
  item19ApprovalStatus: FinancialPerformanceApprovalStatusSchema,
});

const FINANCIAL_PERFORMANCE_TERMS = /\b(sales|transaction(?: value)?|revenue|income|profit(?:s)?|margin(?:s)?|roi|return on investment|payback|unit economics?|ticket|cart lift|attach(?:ment)? rate)\b/i;
const QUOTE_OBJECTIVE_CLAIM_TERMS = /\b(customer acquisition|loyalty|repeat visits?|speed|throughput|scalab\w*|financial results?|margin(?:s)?|revenue|income|profit(?:s)?|roi|payback|unit economics?)\b/i;

export const PillarEvidenceItemSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    kind: PillarEvidenceKindSchema,
    classification: PillarEvidenceClassificationSchema,
    label: z.string().min(1),
    value: z.string().min(1).nullable(),
    explanation: z.string().min(1),
    publicationStatus: PillarPublicationStatusSchema,
    claimReviewStatus: PillarClaimReviewStatusSchema,
    provenance: PillarProvenanceSchema,
    financialPerformance: FinancialPerformanceEvidenceSchema.nullable(),
  })
  .superRefine((item, context) => {
    const content = [item.label, item.value, item.explanation].filter(Boolean).join(" ");
    const containsFinancialPerformanceLanguage = FINANCIAL_PERFORMANCE_TERMS.test(content);

    if (item.kind === "QUANTITATIVE" && item.value === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "Quantitative evidence requires an exact approved display value.",
      });
    }

    if (
      containsFinancialPerformanceLanguage &&
      item.classification !== "FINANCIAL_PERFORMANCE"
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["classification"],
        message: "Financial-performance language must use the FINANCIAL_PERFORMANCE classification.",
      });
    }

    if (item.classification !== "FINANCIAL_PERFORMANCE") {
      if (item.financialPerformance !== null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["financialPerformance"],
          message: "Only FINANCIAL_PERFORMANCE evidence may include a financial-performance approval record.",
        });
      }
      return;
    }

    if (item.kind !== "QUANTITATIVE" || item.value === null || item.financialPerformance === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["financialPerformance"],
        message: "Financial-performance evidence requires a current quantitative value and complete approval record.",
      });
      return;
    }

    if (item.value !== item.financialPerformance.currentValue) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "Public value must exactly match the approved current value; do not round or normalize it in presentation.",
      });
    }
  });

export const PillarImageSchema = z.object({
  assetId: z.string().min(1),
  src: z.string().startsWith("/"),
  alt: z.string().min(1),
  subject: PillarImageSubjectSchema,
  aspectRatio: z.literal("4:3"),
  objectPosition: z.string().min(1),
  publicationStatus: PillarPublicationStatusSchema,
  claimReviewStatus: PillarClaimReviewStatusSchema,
  provenance: PillarProvenanceSchema,
});

export const PillarQuoteSchema = z
  .object({
    text: z.string().min(1),
    speakerName: z.string().min(1),
    speakerRole: z.string().min(1),
    uniqueContext: z.string().min(1),
    publicationStatus: PillarPublicationStatusSchema,
    claimReviewStatus: PillarClaimReviewStatusSchema,
    provenance: PillarProvenanceSchema,
  })
  .superRefine((quote, context) => {
    if (QUOTE_OBJECTIVE_CLAIM_TERMS.test(quote.text)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["text"],
        message: "Quotes may add qualitative context but cannot substantiate acquisition, loyalty, financial, speed, or scalability claims.",
      });
    }
  });

export const PillarContextualLinkSchema = z.object({
  href: z.string().startsWith("/"),
  label: z.string().min(1),
  destinationId: z.string().min(1),
  publicationStatus: PillarPublicationStatusSchema,
});

export const PillarSchema = z.object({
  id: PillarIdSchema,
  number: z.string().regex(/^0[1-4]$/),
  publicationStatus: PillarPublicationStatusSchema,
  claimReviewStatus: PillarClaimReviewStatusSchema,
  provenance: PillarProvenanceSchema,
  publicTitle: PillarContentBlockSchema,
  shortLabel: PillarContentBlockSchema,
  operatingThesis: PillarContentBlockSchema,
  verifiedExplanatoryCopy: PillarContentBlockSchema.nullable(),
  evidenceHeading: PillarContentBlockSchema,
  evidenceItems: z.array(PillarEvidenceItemSchema),
  evidenceEmptyState: PillarContentBlockSchema,
  operatorLens: PillarContentBlockSchema,
  image: PillarImageSchema.nullable(),
  visualFallback: PillarContentBlockSchema,
  quote: PillarQuoteSchema.nullable(),
  contextualLink: PillarContextualLinkSchema.nullable(),
});

export const PillarsSchema = z.array(PillarSchema).length(4);

export const PillarComparativeClaimSchema = z.object({
  text: z.string().min(1),
  comparisonDimension: z.string().min(1).nullable(),
  comparisonSet: z.string().min(1).nullable(),
  approvedEvidenceIds: z.array(z.string().min(1)),
  disposition: ComparativeClaimDispositionSchema,
  claimReviewStatus: PillarClaimReviewStatusSchema,
  provenance: PillarProvenanceSchema,
});

export const PillarSectionSchema = z.object({
  eyebrow: PillarContentBlockSchema,
  publicHeading: PillarContentBlockSchema,
  orientationCopy: PillarContentBlockSchema,
  comparativeHeading: PillarComparativeClaimSchema,
});

export type PillarPublicationStatus = z.infer<typeof PillarPublicationStatusSchema>;
export type PillarClaimReviewStatus = z.infer<typeof PillarClaimReviewStatusSchema>;
export type PillarId = z.infer<typeof PillarIdSchema>;
export type PillarEvidenceItem = z.infer<typeof PillarEvidenceItemSchema>;
export type FinancialPerformanceEvidence = z.infer<typeof FinancialPerformanceEvidenceSchema>;
export type PillarImage = z.infer<typeof PillarImageSchema>;
export type PillarQuote = z.infer<typeof PillarQuoteSchema>;
export type PillarContextualLink = z.infer<typeof PillarContextualLinkSchema>;
export type Pillar = z.infer<typeof PillarSchema>;
export type PillarSection = z.infer<typeof PillarSectionSchema>;
export type PublicPillarText = Pick<
  z.infer<typeof PillarContentBlockSchema>,
  "text"
>;
export type PublicPillarLabeledBlock = Pick<
  z.infer<typeof PillarContentBlockSchema>,
  "label" | "text"
>;

export type PublicPillar = {
  id: Pillar["id"];
  number: Pillar["number"];
  publicTitle: PublicPillarText;
  shortLabel: PublicPillarText;
  operatingThesis: PublicPillarText;
  verifiedExplanatoryCopy: PublicPillarText | null;
  evidenceHeading: PublicPillarLabeledBlock;
  evidenceItems: readonly Pick<PillarEvidenceItem, "id" | "label" | "value" | "explanation" | "kind" | "classification">[];
  evidenceEmptyState: PublicPillarText;
  operatorLens: PublicPillarLabeledBlock;
  image: Pick<PillarImage, "src" | "alt" | "objectPosition"> | null;
  visualFallback: PublicPillarLabeledBlock;
  quote: Pick<PillarQuote, "text" | "speakerName" | "speakerRole"> | null;
  contextualLink: Pick<PillarContextualLink, "href" | "label" | "destinationId"> | null;
};

export type PublicPillarSection = {
  eyebrow: PublicPillarText;
  publicHeading: PublicPillarText;
  orientationCopy: PublicPillarText;
};

const reviewRequiredProvenance = (claimId: string, contentOwners: string[]) => ({
  claimId,
  sourceId: "why-buddas-four-pillars",
  sourceReference: null,
  measurementDefinition: null,
  measurementPeriod: null,
  applicableOutlets: null,
  contentOwners,
  approvalOwner: null,
  lastReviewedAt: null,
  publicUsePermission: "WITHHELD" as const,
  fddItem19Mapping: null,
  expiresAt: null,
  reviewTrigger: "Attach a durable source reference before approving this public claim.",
});

const reviewRequiredCopy = (claimId: string, label: string, text: string, contentOwners: string[]) => ({
  label,
  text,
  claimReviewStatus: "REVIEW_REQUIRED" as const,
  provenance: reviewRequiredProvenance(claimId, contentOwners),
});

const evidenceEmptyState = (claimId: string, contentOwners: string[]) =>
  reviewRequiredCopy(
    claimId,
    "Evidence status",
    "No approved public evidence item is currently available for this pillar.",
    contentOwners
  );

/**
 * The original comparison stays in the governance record but is withheld from
 * the public H2 until Brand, Franchise Development, and Legal attach a defined
 * comparison dimension, comparison set, and approved evidence references.
 */
export const WHY_BUDDAS_PILLARS_SECTION: PillarSection = PillarSectionSchema.parse({
  eyebrow: reviewRequiredCopy("why-buddas.section.eyebrow", "Section context", "The Four Pillars of Distinction", ["Brand"]),
  publicHeading: reviewRequiredCopy("why-buddas.section.heading", "Section title", "Four parts of the Budda's model to examine.", ["Brand", "Franchise Development"]),
  orientationCopy: reviewRequiredCopy("why-buddas.section.orientation", "Section orientation", "Review the product, daypart format, daily execution, and hospitality standards that shape the Budda's operating model.", ["Brand", "Product", "Operations"]),
  comparativeHeading: {
    text: "Why Budda's Outperforms Conventional Fast-Casual",
    comparisonDimension: null,
    comparisonSet: null,
    approvedEvidenceIds: [],
    disposition: "WITHHELD",
    claimReviewStatus: "REVIEW_REQUIRED",
    provenance: reviewRequiredProvenance("why-buddas.section.comparative-heading", ["Brand", "Franchise Development", "Legal"]),
  },
});

/**
 * The single source for pillar UI, claims, and review state. Presentation
 * components read only from this record and never supply claim text or values.
 */
export const WHY_BUDDAS_PILLARS: readonly Pillar[] = PillarsSchema.parse([
  {
    id: "bakery-product",
    number: "01",
    publicationStatus: "PUBLISHED",
    claimReviewStatus: "REVIEW_REQUIRED",
    provenance: reviewRequiredProvenance("why-buddas.bakery-product", ["Brand", "Product", "Operations"]),
    publicTitle: reviewRequiredCopy("why-buddas.bakery-product.title", "Pillar 01 · Signature product", "The Budda Roll anchors the bakery-and-grill format.", ["Brand", "Product"]),
    shortLabel: reviewRequiredCopy("why-buddas.bakery-product.short-label", "Navigation label", "Bakery product", ["Brand", "Product"]),
    operatingThesis: reviewRequiredCopy("why-buddas.bakery-product.operating-thesis", "Why it matters operationally", "The bakery format makes product standards and service presentation part of the daily operating model.", ["Operations", "Product"]),
    verifiedExplanatoryCopy: null,
    evidenceHeading: reviewRequiredCopy("why-buddas.bakery-product.evidence-heading", "Evidence", "Approved evidence", ["Brand", "Product", "Operations"]),
    evidenceItems: [],
    evidenceEmptyState: evidenceEmptyState("why-buddas.bakery-product.evidence-empty", ["Brand", "Product", "Operations"]),
    operatorLens: reviewRequiredCopy("why-buddas.bakery-product.operator-lens", "Operator lens", "Review how bakery production, product standards, and service presentation work together in the operating model.", ["Operations", "Product"]),
    image: null,
    visualFallback: reviewRequiredCopy("why-buddas.bakery-product.visual-fallback", "Product visual", "A product-truth visual appears only after Brand approves an accurate Budda Roll asset for this pillar.", ["Brand", "Product"]),
    quote: null,
    contextualLink: {
      href: "/franchise/the-opportunity#opportunity-thesis",
      label: "Review the operator's bakery-and-grill model",
      destinationId: "opportunity-thesis",
      publicationStatus: "PUBLISHED",
    },
  },
  {
    id: "daypart-format",
    number: "02",
    publicationStatus: "PUBLISHED",
    claimReviewStatus: "REVIEW_REQUIRED",
    provenance: reviewRequiredProvenance("why-buddas.daypart-format", ["Product", "Operations"]),
    publicTitle: reviewRequiredCopy("why-buddas.daypart-format.title", "Pillar 02 · Service architecture", "The menu is organized for breakfast, lunch, and dinner occasions.", ["Product", "Operations"]),
    shortLabel: reviewRequiredCopy("why-buddas.daypart-format.short-label", "Navigation label", "Daypart format", ["Product", "Operations"]),
    operatingThesis: reviewRequiredCopy("why-buddas.daypart-format.operating-thesis", "Why it matters operationally", "A multi-occasion format requires the operator to understand menu breadth, service rhythm, and planning across the day.", ["Operations", "Product"]),
    verifiedExplanatoryCopy: null,
    evidenceHeading: reviewRequiredCopy("why-buddas.daypart-format.evidence-heading", "Evidence", "Approved evidence", ["Product", "Operations"]),
    evidenceItems: [],
    evidenceEmptyState: evidenceEmptyState("why-buddas.daypart-format.evidence-empty", ["Product", "Operations"]),
    operatorLens: reviewRequiredCopy("why-buddas.daypart-format.operator-lens", "Operator lens", "Review the menu breadth, service rhythm, and operational planning required across those occasions.", ["Operations", "Product"]),
    image: null,
    visualFallback: reviewRequiredCopy("why-buddas.daypart-format.visual-fallback", "Operating visual", "A daypart or operating-system visual appears only after Brand and Operations approve its product and service context.", ["Brand", "Operations"]),
    quote: null,
    contextualLink: null,
  },
  {
    id: "production-approach",
    number: "03",
    publicationStatus: "PUBLISHED",
    claimReviewStatus: "REVIEW_REQUIRED",
    provenance: reviewRequiredProvenance("why-buddas.production-approach", ["Operations", "Product"]),
    publicTitle: reviewRequiredCopy("why-buddas.production-approach.title", "Pillar 03 · Daily execution", "Defined bakery and grill steps shape daily execution.", ["Operations", "Product"]),
    shortLabel: reviewRequiredCopy("why-buddas.production-approach.short-label", "Navigation label", "Production approach", ["Operations", "Product"]),
    operatingThesis: reviewRequiredCopy("why-buddas.production-approach.operating-thesis", "Why it matters operationally", "The operating format connects baking, grilling, and assembly, making documented steps and team execution material to daily work.", ["Operations", "Product"]),
    verifiedExplanatoryCopy: null,
    evidenceHeading: reviewRequiredCopy("why-buddas.production-approach.evidence-heading", "Evidence", "Approved evidence", ["Operations", "Product"]),
    evidenceItems: [],
    evidenceEmptyState: evidenceEmptyState("why-buddas.production-approach.evidence-empty", ["Operations", "Product"]),
    operatorLens: reviewRequiredCopy("why-buddas.production-approach.operator-lens", "Operator lens", "Review the documented steps, team training, and standards responsibility required to carry out the format.", ["Operations", "Product"]),
    image: null,
    visualFallback: reviewRequiredCopy("why-buddas.production-approach.visual-fallback", "Process visual", "A production-process visual appears only after Operations and Brand approve the depicted workflow as current.", ["Operations", "Brand"]),
    quote: null,
    contextualLink: null,
  },
  {
    id: "hospitality-standard",
    number: "04",
    publicationStatus: "PUBLISHED",
    claimReviewStatus: "REVIEW_REQUIRED",
    provenance: reviewRequiredProvenance("why-buddas.hospitality-standard", ["Brand", "Franchise Development", "Operations"]),
    publicTitle: reviewRequiredCopy("why-buddas.hospitality-standard.title", "Pillar 04 · Operator stewardship", "Guest experience is part of the operating model.", ["Brand", "Franchise Development"]),
    shortLabel: reviewRequiredCopy("why-buddas.hospitality-standard.short-label", "Navigation label", "Hospitality standard", ["Brand", "Franchise Development"]),
    operatingThesis: reviewRequiredCopy("why-buddas.hospitality-standard.operating-thesis", "Why it matters operationally", "The operating model connects product stewardship, team leadership, and guest-service standards to the owner's daily responsibility.", ["Brand", "Franchise Development", "Operations"]),
    verifiedExplanatoryCopy: null,
    evidenceHeading: reviewRequiredCopy("why-buddas.hospitality-standard.evidence-heading", "Evidence", "Approved evidence", ["Brand", "Franchise Development", "Operations"]),
    evidenceItems: [],
    evidenceEmptyState: evidenceEmptyState("why-buddas.hospitality-standard.evidence-empty", ["Brand", "Franchise Development", "Operations"]),
    operatorLens: reviewRequiredCopy("why-buddas.hospitality-standard.operator-lens", "Operator lens", "Review the leadership expectations and guest-service standards the operator would be responsible for sustaining.", ["Brand", "Franchise Development"]),
    image: null,
    visualFallback: reviewRequiredCopy("why-buddas.hospitality-standard.visual-fallback", "Service visual", "A hospitality or team-service visual appears only after Brand approves the asset, its rights, and its operating context.", ["Brand", "Operations"]),
    quote: null,
    contextualLink: null,
  },
]);

export const hasApprovedPublicUse = (
  claimReviewStatus: PillarClaimReviewStatus,
  provenance: z.infer<typeof PillarProvenanceSchema>,
  asOf = new Date(),
) => {
  const expiresAt = provenance.expiresAt === null ? null : Date.parse(provenance.expiresAt);

  return (
    claimReviewStatus === "APPROVED" &&
    provenance.publicUsePermission === "APPROVED" &&
    provenance.sourceReference !== null &&
    provenance.approvalOwner !== null &&
    provenance.lastReviewedAt !== null &&
    (expiresAt === null || (Number.isFinite(expiresAt) && expiresAt >= asOf.getTime()))
  );
};

export const getApprovedPillarEvidence = (pillar: Pillar, asOf = new Date()) =>
  pillar.evidenceItems.filter(
    (item) =>
      item.publicationStatus === "PUBLISHED" &&
      hasApprovedPublicUse(item.claimReviewStatus, item.provenance, asOf) &&
      (item.classification !== "FINANCIAL_PERFORMANCE" ||
        (item.financialPerformance?.franchiseApprovalStatus === "APPROVED" &&
          (!item.financialPerformance.requiresItem19 ||
            item.financialPerformance.item19ApprovalStatus === "APPROVED")))
  );

export const getApprovedPillarQuote = (pillar: Pillar, asOf = new Date()) =>
  pillar.quote?.publicationStatus === "PUBLISHED" &&
  hasApprovedPublicUse(pillar.quote.claimReviewStatus, pillar.quote.provenance, asOf)
    ? pillar.quote
    : null;

export const selectPublicPillarQuotePillarId = (pillars: readonly Pillar[]) =>
  pillars.find((pillar) => getApprovedPillarQuote(pillar) !== null)?.id ?? null;

const toPublicText = ({ text }: z.infer<typeof PillarContentBlockSchema>): PublicPillarText => ({
  text,
});

const toPublicLabeledBlock = ({ label, text }: z.infer<typeof PillarContentBlockSchema>): PublicPillarLabeledBlock => ({
  label,
  text,
});

/**
 * The browser receives only fields approved for presentation. Withheld claims,
 * governance metadata, and expired or unapproved evidence stay server-side.
 */
export const getPublicWhyBuddasPillarsContent = (): {
  section: PublicPillarSection;
  pillars: readonly PublicPillar[];
} => {
  const publicQuotePillarId = selectPublicPillarQuotePillarId(WHY_BUDDAS_PILLARS);

  return {
  section: {
    eyebrow: toPublicText(WHY_BUDDAS_PILLARS_SECTION.eyebrow),
    publicHeading: toPublicText(WHY_BUDDAS_PILLARS_SECTION.publicHeading),
    orientationCopy: toPublicText(WHY_BUDDAS_PILLARS_SECTION.orientationCopy),
  },
  pillars: WHY_BUDDAS_PILLARS.filter(
    (pillar) => pillar.publicationStatus === "PUBLISHED"
  ).map((pillar) => ({
    id: pillar.id,
    number: pillar.number,
    publicTitle: toPublicText(pillar.publicTitle),
    shortLabel: toPublicText(pillar.shortLabel),
    operatingThesis: toPublicText(pillar.operatingThesis),
    verifiedExplanatoryCopy:
      pillar.verifiedExplanatoryCopy &&
      hasApprovedPublicUse(
        pillar.verifiedExplanatoryCopy.claimReviewStatus,
        pillar.verifiedExplanatoryCopy.provenance,
      )
        ? toPublicText(pillar.verifiedExplanatoryCopy)
        : null,
    evidenceHeading: toPublicLabeledBlock(pillar.evidenceHeading),
    evidenceItems: getApprovedPillarEvidence(pillar).map(
      ({ id, kind, classification, label, value, explanation }) => ({
        id,
        kind,
        classification,
        label,
        value,
        explanation,
      })
    ),
    evidenceEmptyState: toPublicText(pillar.evidenceEmptyState),
    operatorLens: toPublicLabeledBlock(pillar.operatorLens),
    image:
      pillar.image?.publicationStatus === "PUBLISHED" &&
      hasApprovedPublicUse(pillar.image.claimReviewStatus, pillar.image.provenance)
        ? {
            src: pillar.image.src,
            alt: pillar.image.alt,
            objectPosition: pillar.image.objectPosition,
          }
        : null,
    visualFallback: toPublicLabeledBlock(pillar.visualFallback),
    quote:
      pillar.id === publicQuotePillarId && getApprovedPillarQuote(pillar)
        ? (() => {
            const quote = getApprovedPillarQuote(pillar);
            return quote
              ? {
                  text: quote.text,
                  speakerName: quote.speakerName,
                  speakerRole: quote.speakerRole,
                }
              : null;
          })()
        : null,
    contextualLink:
      pillar.contextualLink?.publicationStatus === "PUBLISHED"
        ? {
            href: pillar.contextualLink.href,
            label: pillar.contextualLink.label,
            destinationId: pillar.contextualLink.destinationId,
          }
        : null,
  })),
  };
};
