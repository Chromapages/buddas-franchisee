export type ProcessCopyClassification =
  | "MARKETING"
  | "BUSINESS_POLICY"
  | "LEGAL"
  | "JURISDICTION_SENSITIVE"
  | "INTERNAL";

export type ProcessCopyReviewStatus =
  | "APPROVED"
  | "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW";

export type ProcessCopyPublicStatus = "PUBLIC" | "WITHHOLD";

export type ProcessTimingType = "LEGAL" | "TYPICAL" | "TARGET" | "ESTIMATED";

export type ProcessCopyGovernance = {
  classification: ProcessCopyClassification;
  reviewStatus: ProcessCopyReviewStatus;
  publicStatus: ProcessCopyPublicStatus;
  reviewedAt: string | null;
  effectiveDate: string | null;
  expiresAt: string | null;
  sourceOwner: string;
  sourceReference: string | null;
  reviewTrigger: string | null;
  displayRequirement: "MAY_SUMMARIZE" | "MUST_RENDER_IN_FULL";
};

export type GovernedProcessField<T> = {
  value: T;
  governance: ProcessCopyGovernance;
};

export type ProcessLink = {
  href: string;
  label: string;
  destinationId?: string;
};

export type ProcessStageDetail = {
  id: string;
  label: GovernedProcessField<string>;
  detail: GovernedProcessField<string>;
};

export type ProcessDiscoveryDayLogistics = {
  attendancePolicy: GovernedProcessField<string> | null;
  participationFormat: GovernedProcessField<string> | null;
  anticipatedDuration: GovernedProcessField<string> | null;
  requiredPrework: GovernedProcessField<string> | null;
  typicalAttendees: GovernedProcessField<string> | null;
  travelResponsibilityGuidance: GovernedProcessField<string> | null;
  visitDecisionBoundary: GovernedProcessField<string> | null;
};

export type ProcessLegalGovernance = {
  federalTiming: GovernedProcessField<string>;
  item23Context: GovernedProcessField<string>;
  independentAdvisorLanguage: GovernedProcessField<string>;
  operatorValidationLanguage: GovernedProcessField<string>;
  territoryAgreementLanguage: GovernedProcessField<string>;
};

export type FranchiseProcessStage = {
  id: "initial-inquiry" | "discovery-call" | "fdd-disclosure" | "discovery-day";
  slug: "initial-inquiry" | "discovery-call" | "fdd-disclosure" | "discovery-day";
  sequence: 1 | 2 | 3 | 4;
  number: "01" | "02" | "03" | "04";
  publicTitle: GovernedProcessField<string>;
  plainLanguageTitle: GovernedProcessField<string>;
  summary: GovernedProcessField<string>;
  buddasEvaluates: GovernedProcessField<string>;
  candidateEvaluates: GovernedProcessField<string>;
  decisionGate: GovernedProcessField<string>;
  decisionGateLabel: GovernedProcessField<string>;
  approvedTimingLabel: GovernedProcessField<string> | null;
  timingType: ProcessTimingType | null;
  location: GovernedProcessField<string> | null;
  deliveryFormat: GovernedProcessField<string> | null;
  detailDisclosureLabel: GovernedProcessField<string> | null;
  optionalDetails: readonly ProcessStageDetail[];
  relatedLinks: readonly GovernedProcessField<ProcessLink>[];
  internalOperationalContext: {
    stageOwner: GovernedProcessField<string>;
  };
  discoveryDayLogistics: ProcessDiscoveryDayLogistics | null;
};

export type FranchiseProcessPageContent = {
  metadata: {
    title: string;
    description: string;
    canonicalPath: string;
  };
  framing: {
    eyebrow: GovernedProcessField<string>;
    title: GovernedProcessField<string>;
    description: GovernedProcessField<string>;
    overviewLabel: GovernedProcessField<string>;
  };
  stages: readonly FranchiseProcessStage[];
  legalGovernance: ProcessLegalGovernance;
  closing: {
    eyebrow: GovernedProcessField<string>;
    title: GovernedProcessField<string>;
    description: GovernedProcessField<string>;
    afterApprovalLabel: GovernedProcessField<string>;
    afterApprovalSummary: GovernedProcessField<string>;
    afterApprovalLink: GovernedProcessField<ProcessLink>;
    primaryActionLabel: GovernedProcessField<string>;
    primaryBoundaryNote: GovernedProcessField<string>;
  };
};

export type PublicProcessStage = {
  id: FranchiseProcessStage["id"];
  slug: FranchiseProcessStage["slug"];
  sequence: FranchiseProcessStage["sequence"];
  number: FranchiseProcessStage["number"];
  publicTitle: string;
  plainLanguageTitle: string;
  summary: string;
  buddasEvaluates: string;
  candidateEvaluates: string;
  decisionGate: string;
  decisionGateLabel: string;
  approvedTimingLabel: string | null;
  timingType: ProcessTimingType | null;
  location: string | null;
  deliveryFormat: string | null;
  detailDisclosureLabel: string | null;
  optionalDetails: readonly {
    id: string;
    label: string;
    detail: string;
  }[];
  relatedLinks: readonly ProcessLink[];
};

export type PublicFranchiseProcessContent = {
  metadata: FranchiseProcessPageContent["metadata"];
  framing: {
    eyebrow: string;
    title: string;
    description: string;
    overviewLabel: string;
  };
  stages: readonly PublicProcessStage[];
  legalGovernance: {
    federalTiming: string | null;
    item23Context: string | null;
    independentAdvisorLanguage: string | null;
    operatorValidationLanguage: string | null;
    territoryAgreementLanguage: string | null;
  };
  closing: {
    eyebrow: string;
    title: string;
    description: string;
    afterApprovalLabel: string;
    afterApprovalSummary: string;
    afterApprovalLink: ProcessLink | null;
    primaryActionLabel: string;
    primaryBoundaryNote: string;
  };
};

export type ProcessGovernanceIssue = {
  path: string;
  reviewStatus: ProcessCopyReviewStatus;
  publicStatus: ProcessCopyPublicStatus;
  reviewedAt: string | null;
  effectiveDate: string | null;
  expiresAt: string | null;
};

const TODAY = new Date();

/**
 * This source governs public process orientation copy. It intentionally does
 * not model candidate progress, completion state, or application workflow.
 */

const buildGovernance = ({
  classification,
  reviewStatus,
  sourceOwner,
  sourceReference,
  reviewTrigger,
  displayRequirement = "MAY_SUMMARIZE",
  publicStatus = "PUBLIC",
  reviewedAt = null,
  effectiveDate = null,
  expiresAt = null,
}: {
  classification: ProcessCopyClassification;
  reviewStatus: ProcessCopyReviewStatus;
  sourceOwner: string;
  sourceReference: string | null;
  reviewTrigger: string | null;
  displayRequirement?: ProcessCopyGovernance["displayRequirement"];
  publicStatus?: ProcessCopyPublicStatus;
  reviewedAt?: string | null;
  effectiveDate?: string | null;
  expiresAt?: string | null;
}): ProcessCopyGovernance => ({
  classification,
  reviewStatus,
  publicStatus,
  reviewedAt,
  effectiveDate,
  expiresAt,
  sourceOwner,
  sourceReference,
  reviewTrigger,
  displayRequirement,
});

const marketingCopy = (value: string): GovernedProcessField<string> => ({
  value,
  governance: buildGovernance({
    classification: "MARKETING",
    reviewStatus: "APPROVED",
    sourceOwner: "Franchise Marketing",
    sourceReference: "Public franchise process page copy deck",
    reviewTrigger: "Any public process-page messaging change",
  }),
});

const governedCopy = (
  value: string,
  {
    classification,
    sourceOwner,
    sourceReference,
    reviewTrigger,
    displayRequirement,
    publicStatus,
  }: {
    classification: Exclude<ProcessCopyClassification, "MARKETING">;
    sourceOwner: string;
    sourceReference: string;
    reviewTrigger: string;
    displayRequirement?: ProcessCopyGovernance["displayRequirement"];
    publicStatus?: ProcessCopyPublicStatus;
  },
): GovernedProcessField<string> => ({
  value,
  governance: buildGovernance({
    classification,
    reviewStatus: "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW",
    sourceOwner,
    sourceReference,
    reviewTrigger,
    displayRequirement,
    publicStatus,
  }),
});

const governedLink = (
  value: ProcessLink,
  {
    classification = "BUSINESS_POLICY",
    sourceOwner = "Franchise Marketing",
    sourceReference = "Public franchise process page navigation map",
    reviewTrigger = "Any linked destination or process-page IA change",
    publicStatus = "PUBLIC",
  }: {
    classification?: Exclude<ProcessCopyClassification, "INTERNAL">;
    sourceOwner?: string;
    sourceReference?: string;
    reviewTrigger?: string;
    publicStatus?: ProcessCopyPublicStatus;
  } = {},
): GovernedProcessField<ProcessLink> => ({
  value,
  governance: buildGovernance({
    classification,
    reviewStatus: classification === "MARKETING" ? "APPROVED" : "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW",
    sourceOwner,
    sourceReference,
    reviewTrigger,
    publicStatus,
  }),
});

const internalCopy = (value: string): GovernedProcessField<string> =>
  governedCopy(value, {
    classification: "INTERNAL",
    sourceOwner: "Franchise Development Leadership",
    sourceReference: "Franchise development operating model",
    reviewTrigger: "Any ownership or workflow change",
  });

const isExpired = (expiresAt: string | null) => {
  if (!expiresAt) return false;
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) return false;
  return expiry.getTime() < TODAY.getTime();
};

export const isGovernedProcessFieldPublic = <T>(field: GovernedProcessField<T> | null | undefined): field is GovernedProcessField<T> => {
  if (!field) return false;
  return field.governance.publicStatus === "PUBLIC" && !isExpired(field.governance.expiresAt);
};

const toPublicValue = <T>(field: GovernedProcessField<T> | null | undefined): T | null =>
  isGovernedProcessFieldPublic(field) ? field.value : null;

const PROCESS_LEGAL_GOVERNANCE: ProcessLegalGovernance = {
  federalTiming: governedCopy(
    "Under the FTC Franchise Rule, the FDD must be furnished at least 14 calendar days before you are asked to sign a binding agreement or make a payment to the franchisor or an affiliate in connection with the proposed franchise sale.",
    {
      classification: "JURISDICTION_SENSITIVE",
      sourceOwner: "Franchise Legal",
      sourceReference: "FTC Franchise Rule, 16 C.F.R. § 436.2(a)",
      reviewTrigger: "Any FDD edition, federal or state law, jurisdiction, or franchise-sales-process change",
      displayRequirement: "MUST_RENDER_IN_FULL",
    },
  ),
  item23Context: governedCopy(
    "Receive the current FDD, related agreements, and Item 23 receipt.",
    {
      classification: "LEGAL",
      sourceOwner: "Franchise Legal",
      sourceReference: "Current Franchise Disclosure Document and franchise sales process",
      reviewTrigger: "Any FDD edition, disclosure, Item 23, or franchise-sales-process change",
    },
  ),
  independentAdvisorLanguage: governedCopy(
    "Review the documents with independent legal and financial advisors as appropriate.",
    {
      classification: "LEGAL",
      sourceOwner: "Franchise Legal",
      sourceReference: "Current Franchise Disclosure Document and franchise sales process",
      reviewTrigger: "Any FDD edition, disclosure, legal-review, or advisor-guidance change",
    },
  ),
  operatorValidationLanguage: governedCopy(
    "Validate economics, ask questions, and speak with operating affiliates.",
    {
      classification: "LEGAL",
      sourceOwner: "Franchise Legal & Franchise Development",
      sourceReference: "Current Franchise Disclosure Document and franchise sales process",
      reviewTrigger: "Any FDD edition, disclosure, operator-validation, or diligence-process change",
    },
  ),
  territoryAgreementLanguage: governedCopy(
    "Territory and partnership questions may be discussed as part of the mutual review process.",
    {
      classification: "LEGAL",
      sourceOwner: "Franchise Legal & Franchise Development",
      sourceReference: "Franchise development territory and agreement process",
      reviewTrigger: "Any territory, agreement-execution, mutual-approval, or jurisdiction change",
    },
  ),
};

export const FRANCHISE_PROCESS_CONTENT: FranchiseProcessPageContent = {
  metadata: {
    title: "Budda's Pre-Award Mutual Evaluation Process",
    description:
      "Understand Budda's pre-award mutual evaluation process, from initial inquiry through Discovery Day and the diligence steps in between.",
    canonicalPath: "/franchise/process",
  },
  framing: {
    eyebrow: marketingCopy("A Two-Sided Evaluation"),
    title: marketingCopy("Budda's Pre-Award Mutual Evaluation Process"),
    description: governedCopy(
      "Both sides assess fit and decide whether to continue. Budda's reviews operating fit, market alignment, and partnership readiness.",
      {
        classification: "BUSINESS_POLICY",
        sourceOwner: "Franchise Development Leadership",
        sourceReference: "Franchise development evaluation process",
        reviewTrigger: "Any evaluation framing or qualification-process change",
      },
    ),
    overviewLabel: marketingCopy("Process overview: four stages"),
  },
  stages: [
    {
      id: "initial-inquiry",
      slug: "initial-inquiry",
      sequence: 1,
      number: "01",
      publicTitle: marketingCopy("Initial Inquiry"),
      plainLanguageTitle: governedCopy("Initial Inquiry & Fit Evaluation", {
        classification: "BUSINESS_POLICY",
        sourceOwner: "Franchise Development Leadership",
        sourceReference: "Franchise development evaluation process",
        reviewTrigger: "Any qualification or territory-process change",
      }),
      summary: governedCopy(
        "Submit your contact details, operational background, and target market interest. Our team reviews your profile against our current development territory plan within 2 business days.",
        {
          classification: "BUSINESS_POLICY",
          sourceOwner: "Franchise Development Leadership",
          sourceReference: "Franchise development service-level expectation",
          reviewTrigger: "Any response-time, intake, or territory-process change",
        },
      ),
      buddasEvaluates: governedCopy(
        "Your operational background, target-market interest, and fit with the current development territory plan.",
        {
          classification: "BUSINESS_POLICY",
          sourceOwner: "Franchise Development Leadership",
          sourceReference: "Franchise development qualification criteria",
          reviewTrigger: "Any qualification or territory-process change",
        },
      ),
      candidateEvaluates: governedCopy(
        "Assess the opportunity and target market, then decide whether further discussion is worthwhile.",
        {
          classification: "BUSINESS_POLICY",
          sourceOwner: "Franchise Development Leadership",
          sourceReference: "Franchise development evaluation process",
          reviewTrigger: "Any candidate decision-process change",
        },
      ),
      decisionGate: governedCopy(
        "A decision about whether a further conversation makes sense; either party may decide not to continue.",
        {
          classification: "BUSINESS_POLICY",
          sourceOwner: "Franchise Development Leadership",
          sourceReference: "Franchise development evaluation process",
          reviewTrigger: "Any candidate decision-process change",
        },
      ),
      decisionGateLabel: marketingCopy("Further-conversation decision"),
      approvedTimingLabel: governedCopy("Target response: within 2 business days", {
        classification: "BUSINESS_POLICY",
        sourceOwner: "Franchise Development Leadership",
        sourceReference: "Franchise development service-level expectation",
        reviewTrigger: "Any response-time or inquiry-routing change",
      }),
      timingType: "TARGET",
      location: null,
      deliveryFormat: null,
      detailDisclosureLabel: null,
      optionalDetails: [],
      relatedLinks: [
        governedLink(
          {
            href: "/franchise/the-opportunity#qualifications",
            label: "Review candidate qualifications",
            destinationId: "opportunity-qualifications",
          },
          {
            classification: "BUSINESS_POLICY",
            sourceOwner: "Franchise Marketing",
            sourceReference: "Franchise opportunity IA map",
            reviewTrigger: "Any linked destination or qualification IA change",
          },
        ),
      ],
      internalOperationalContext: {
        stageOwner: internalCopy("Franchise Development Team"),
      },
      discoveryDayLogistics: null,
    },
    {
      id: "discovery-call",
      slug: "discovery-call",
      sequence: 2,
      number: "02",
      publicTitle: marketingCopy("Discovery Call"),
      plainLanguageTitle: governedCopy("Discovery Call & Capital Verification", {
        classification: "BUSINESS_POLICY",
        sourceOwner: "Franchise Development Leadership",
        sourceReference: "Franchise development qualification criteria",
        reviewTrigger: "Any financial qualification or process change",
      }),
      summary: governedCopy(
        "A structured 45-minute conversation to explore your restaurant background, business goals, and review preliminary territory availability and financial thresholds.",
        {
          classification: "BUSINESS_POLICY",
          sourceOwner: "Franchise Development Leadership",
          sourceReference: "Franchise development qualification criteria",
          reviewTrigger: "Any financial qualification, territory, or call-process change",
        },
      ),
      buddasEvaluates: governedCopy(
        "Your restaurant background, business goals, financial readiness, and preliminary territory fit.",
        {
          classification: "BUSINESS_POLICY",
          sourceOwner: "Franchise Development Leadership",
          sourceReference: "Franchise development qualification criteria",
          reviewTrigger: "Any financial qualification or territory-process change",
        },
      ),
      candidateEvaluates: governedCopy(
        "Ask questions about operations, market availability, and financial thresholds before deciding whether to continue.",
        {
          classification: "BUSINESS_POLICY",
          sourceOwner: "Franchise Development Leadership",
          sourceReference: "Franchise development evaluation process",
          reviewTrigger: "Any financial qualification or candidate decision-process change",
        },
      ),
      decisionGate: governedCopy(
        "A shared decision about whether to continue with further diligence.",
        {
          classification: "BUSINESS_POLICY",
          sourceOwner: "Franchise Development Leadership",
          sourceReference: "Franchise development evaluation process",
          reviewTrigger: "Any candidate decision-process change",
        },
      ),
      decisionGateLabel: marketingCopy("Diligence decision"),
      approvedTimingLabel: governedCopy("Typical duration: 45 minutes", {
        classification: "BUSINESS_POLICY",
        sourceOwner: "Franchise Development Leadership",
        sourceReference: "Franchise development qualification criteria",
        reviewTrigger: "Any discovery-call duration or format change",
      }),
      timingType: "TYPICAL",
      location: null,
      deliveryFormat: null,
      detailDisclosureLabel: null,
      optionalDetails: [],
      relatedLinks: [
        governedLink(
          {
            href: "/franchise/the-opportunity#financial-requirements",
            label: "Review financial qualification and disclosure information",
            destinationId: "opportunity-financial-requirements",
          },
          {
            classification: "BUSINESS_POLICY",
            sourceOwner: "Franchise Marketing",
            sourceReference: "Franchise opportunity IA map",
            reviewTrigger: "Any linked destination or financial-disclosure IA change",
          },
        ),
      ],
      internalOperationalContext: {
        stageOwner: internalCopy("VP of Franchise Development"),
      },
      discoveryDayLogistics: null,
    },
    {
      id: "fdd-disclosure",
      slug: "fdd-disclosure",
      sequence: 3,
      number: "03",
      publicTitle: marketingCopy("FDD Disclosure"),
      plainLanguageTitle: governedCopy("FDD Disclosure & Legal Review", {
        classification: "LEGAL",
        sourceOwner: "Franchise Legal",
        sourceReference: "Current Franchise Disclosure Document and franchise sales process",
        reviewTrigger: "Any FDD edition, disclosure, legal-review, or jurisdiction change",
      }),
      summary: governedCopy(
        "Budda's provides the current Franchise Disclosure Document (FDD) and related agreements for your review. This is the substantive diligence stage: examine material information, validate economics, ask questions, and speak with operating affiliates before deciding whether to proceed.",
        {
          classification: "LEGAL",
          sourceOwner: "Franchise Legal",
          sourceReference: "Current Franchise Disclosure Document and franchise sales process",
          reviewTrigger: "Any FDD edition, disclosure, legal-review, or jurisdiction change",
        },
      ),
      buddasEvaluates: governedCopy(
        "Completion of the disclosure and diligence steps needed before an agreement is considered.",
        {
          classification: "LEGAL",
          sourceOwner: "Franchise Legal",
          sourceReference: "Current Franchise Disclosure Document and franchise sales process",
          reviewTrigger: "Any FDD edition, disclosure, legal-review, or jurisdiction change",
        },
      ),
      candidateEvaluates: governedCopy(
        "Review the FDD, validate information, and seek independent professional advice as appropriate to your diligence.",
        {
          classification: "LEGAL",
          sourceOwner: "Franchise Legal",
          sourceReference: "Current Franchise Disclosure Document and franchise sales process",
          reviewTrigger: "Any FDD edition, disclosure, legal-review, or jurisdiction change",
        },
      ),
      decisionGate: governedCopy(
        "Completion of independent diligence before an agreement is considered.",
        {
          classification: "LEGAL",
          sourceOwner: "Franchise Legal",
          sourceReference: "Current Franchise Disclosure Document and franchise sales process",
          reviewTrigger: "Any FDD edition, disclosure, legal-review, or jurisdiction change",
        },
      ),
      decisionGateLabel: marketingCopy("Discovery Day decision"),
      approvedTimingLabel: null,
      timingType: "LEGAL",
      location: null,
      deliveryFormat: null,
      detailDisclosureLabel: marketingCopy("Review FDD diligence checklist"),
      optionalDetails: [
        {
          id: "document-delivery",
          label: marketingCopy("Document delivery"),
          detail: PROCESS_LEGAL_GOVERNANCE.item23Context,
        },
        {
          id: "advisor-review",
          label: marketingCopy("Advisor review"),
          detail: PROCESS_LEGAL_GOVERNANCE.independentAdvisorLanguage,
        },
        {
          id: "business-diligence",
          label: marketingCopy("Business diligence"),
          detail: PROCESS_LEGAL_GOVERNANCE.operatorValidationLanguage,
        },
      ],
      relatedLinks: [
        governedLink(
          {
            href: "/franchise/faq",
            label: "Read franchise FAQs",
            destinationId: "faq-index",
          },
          {
            classification: "BUSINESS_POLICY",
            sourceOwner: "Franchise Marketing",
            sourceReference: "Franchise FAQ IA map",
            reviewTrigger: "Any linked destination or FAQ IA change",
          },
        ),
      ],
      internalOperationalContext: {
        stageOwner: internalCopy("Franchise Compliance & Legal Counsel"),
      },
      discoveryDayLogistics: null,
    },
    {
      id: "discovery-day",
      slug: "discovery-day",
      sequence: 4,
      number: "04",
      publicTitle: marketingCopy("Discovery Day"),
      plainLanguageTitle: governedCopy("Discovery Day & Territory Award", {
        classification: "LEGAL",
        sourceOwner: "Franchise Legal & Franchise Development",
        sourceReference: "Franchise development territory and agreement process",
        reviewTrigger: "Any territory, agreement-execution, mutual-approval, or jurisdiction change",
      }),
      summary: governedCopy(
        "Visit our flagship bakery and kitchen in La'ie, Hawai'i to observe the operating environment, meet the executive team, and assess the product and menu in context.",
        {
          classification: "LEGAL",
          sourceOwner: "Franchise Legal & Franchise Development",
          sourceReference: "Franchise development territory and agreement process",
          reviewTrigger: "Any territory, agreement-execution, mutual-approval, or jurisdiction change",
        },
      ),
      buddasEvaluates: governedCopy(
        "Operating fit and long-term partnership alignment through the in-person visit.",
        {
          classification: "BUSINESS_POLICY",
          sourceOwner: "Franchise Development Leadership",
          sourceReference: "Franchise development evaluation process",
          reviewTrigger: "Any evaluation or mutual-approval process change",
        },
      ),
      candidateEvaluates: governedCopy(
        "Assess the flagship operation in person, ask the executive team questions, and decide whether a long-term partnership fits.",
        {
          classification: "BUSINESS_POLICY",
          sourceOwner: "Franchise Development Leadership",
          sourceReference: "Franchise development evaluation process",
          reviewTrigger: "Any evaluation or mutual-approval process change",
        },
      ),
      decisionGate: governedCopy(
        "After the visit, either side may decide whether the approved mutual-review process should continue. Attendance does not itself confirm approval, a territory award, or agreement execution.",
        {
          classification: "LEGAL",
          sourceOwner: "Franchise Legal & Franchise Development",
          sourceReference: "Franchise development territory and agreement process",
          reviewTrigger: "Any territory, agreement-execution, mutual-approval, or jurisdiction change",
        },
      ),
      decisionGateLabel: marketingCopy("Mutual approval decision"),
      approvedTimingLabel: null,
      timingType: null,
      location: governedCopy("La'ie, Hawai'i", {
        classification: "BUSINESS_POLICY",
        sourceOwner: "Franchise Development Leadership",
        sourceReference: "Discovery Day operating overview",
        reviewTrigger: "Any Discovery Day location or logistics change",
      }),
      deliveryFormat: governedCopy("Flagship bakery visit", {
        classification: "BUSINESS_POLICY",
        sourceOwner: "Franchise Development Leadership",
        sourceReference: "Discovery Day operating overview",
        reviewTrigger: "Any Discovery Day format or logistics change",
      }),
      detailDisclosureLabel: marketingCopy("Review Discovery Day details"),
      optionalDetails: [
        {
          id: "territory-and-partnership",
          label: marketingCopy("Territory and partnership terms"),
          detail: PROCESS_LEGAL_GOVERNANCE.territoryAgreementLanguage,
        },
      ],
      relatedLinks: [],
      internalOperationalContext: {
        stageOwner: internalCopy("Executive Leadership & Founders"),
      },
      discoveryDayLogistics: {
        attendancePolicy: null,
        participationFormat: null,
        anticipatedDuration: null,
        requiredPrework: null,
        typicalAttendees: null,
        travelResponsibilityGuidance: null,
        visitDecisionBoundary: null,
      },
    },
  ] as const,
  legalGovernance: PROCESS_LEGAL_GOVERNANCE,
  closing: {
    eyebrow: marketingCopy("After mutual review"),
    title: marketingCopy("Mutual fit is evaluated throughout all four stages."),
    description: governedCopy(
      "Progression is never automatic. Either side may decide whether further pre-award evaluation makes sense before any agreement is considered.",
      {
        classification: "BUSINESS_POLICY",
        sourceOwner: "Franchise Development Leadership",
        sourceReference: "Franchise development evaluation process",
        reviewTrigger: "Any evaluation or mutual-approval process change",
      },
    ),
    afterApprovalLabel: marketingCopy("After mutual approval"),
    afterApprovalSummary: governedCopy(
      "Any agreement completion and operating development follow the approved process separately from this pre-award overview; mutual approval does not guarantee a specific location or opening date.",
      {
        classification: "BUSINESS_POLICY",
        sourceOwner: "Franchise Development Leadership",
        sourceReference: "Franchise development operating runway",
        reviewTrigger: "Any post-approval process or opening-sequence change",
      },
    ),
    afterApprovalLink: governedLink(
      {
        href: "/franchise/the-opportunity#support-runway",
        label: "Review the operating support runway",
        destinationId: "opportunity-support-runway",
      },
      {
        classification: "BUSINESS_POLICY",
        sourceOwner: "Franchise Marketing",
        sourceReference: "Franchise opportunity IA map",
        reviewTrigger: "Any linked destination or support-runway IA change",
      },
    ),
    primaryActionLabel: marketingCopy("Start Initial Inquiry"),
    primaryBoundaryNote: governedCopy(
      "An inquiry is not an application, territory reservation, or offer of a franchise.",
      {
        classification: "LEGAL",
        sourceOwner: "Franchise Legal",
        sourceReference: "Franchise inquiry boundary statement",
        reviewTrigger: "Any offering, territory, or inquiry-process change",
      },
    ),
  },
};

export const getPublicFranchiseProcessContent = (): PublicFranchiseProcessContent => ({
  metadata: FRANCHISE_PROCESS_CONTENT.metadata,
  framing: {
    eyebrow: toPublicValue(FRANCHISE_PROCESS_CONTENT.framing.eyebrow) ?? "",
    title: toPublicValue(FRANCHISE_PROCESS_CONTENT.framing.title) ?? "",
    description: toPublicValue(FRANCHISE_PROCESS_CONTENT.framing.description) ?? "",
    overviewLabel: toPublicValue(FRANCHISE_PROCESS_CONTENT.framing.overviewLabel) ?? "",
  },
  stages: FRANCHISE_PROCESS_CONTENT.stages.flatMap((stage) => {
    const publicTitle = toPublicValue(stage.publicTitle);
    const plainLanguageTitle = toPublicValue(stage.plainLanguageTitle);
    const summary = toPublicValue(stage.summary);
    const buddasEvaluates = toPublicValue(stage.buddasEvaluates);
    const candidateEvaluates = toPublicValue(stage.candidateEvaluates);
    const decisionGate = toPublicValue(stage.decisionGate);
    const decisionGateLabel = toPublicValue(stage.decisionGateLabel);

    if (
      !publicTitle ||
      !plainLanguageTitle ||
      !summary ||
      !buddasEvaluates ||
      !candidateEvaluates ||
      !decisionGate ||
      !decisionGateLabel
    ) {
      return [];
    }

    return [
      {
        id: stage.id,
        slug: stage.slug,
        sequence: stage.sequence,
        number: stage.number,
        publicTitle,
        plainLanguageTitle,
        summary,
        buddasEvaluates,
        candidateEvaluates,
        decisionGate,
        decisionGateLabel,
        approvedTimingLabel: toPublicValue(stage.approvedTimingLabel),
        timingType: stage.timingType,
        location: toPublicValue(stage.location),
        deliveryFormat: toPublicValue(stage.deliveryFormat),
        detailDisclosureLabel: toPublicValue(stage.detailDisclosureLabel),
        optionalDetails: stage.optionalDetails
          .filter((detail) => isGovernedProcessFieldPublic(detail.label) && isGovernedProcessFieldPublic(detail.detail))
          .map((detail) => ({
            id: detail.id,
            label: detail.label.value,
            detail: detail.detail.value,
          })),
        relatedLinks: stage.relatedLinks.filter(isGovernedProcessFieldPublic).map((link) => link.value),
      },
    ];
  }),
  legalGovernance: {
    federalTiming: toPublicValue(FRANCHISE_PROCESS_CONTENT.legalGovernance.federalTiming),
    item23Context: toPublicValue(FRANCHISE_PROCESS_CONTENT.legalGovernance.item23Context),
    independentAdvisorLanguage: toPublicValue(FRANCHISE_PROCESS_CONTENT.legalGovernance.independentAdvisorLanguage),
    operatorValidationLanguage: toPublicValue(FRANCHISE_PROCESS_CONTENT.legalGovernance.operatorValidationLanguage),
    territoryAgreementLanguage: toPublicValue(FRANCHISE_PROCESS_CONTENT.legalGovernance.territoryAgreementLanguage),
  },
  closing: {
    eyebrow: toPublicValue(FRANCHISE_PROCESS_CONTENT.closing.eyebrow) ?? "",
    title: toPublicValue(FRANCHISE_PROCESS_CONTENT.closing.title) ?? "",
    description: toPublicValue(FRANCHISE_PROCESS_CONTENT.closing.description) ?? "",
    afterApprovalLabel: toPublicValue(FRANCHISE_PROCESS_CONTENT.closing.afterApprovalLabel) ?? "",
    afterApprovalSummary: toPublicValue(FRANCHISE_PROCESS_CONTENT.closing.afterApprovalSummary) ?? "",
    afterApprovalLink: toPublicValue(FRANCHISE_PROCESS_CONTENT.closing.afterApprovalLink),
    primaryActionLabel: toPublicValue(FRANCHISE_PROCESS_CONTENT.closing.primaryActionLabel) ?? "",
    primaryBoundaryNote: toPublicValue(FRANCHISE_PROCESS_CONTENT.closing.primaryBoundaryNote) ?? "",
  },
});

const appendGovernanceIssue = (
  issues: ProcessGovernanceIssue[],
  path: string,
  field: GovernedProcessField<unknown> | null | undefined,
) => {
  if (!field) return;
  if (field.governance.publicStatus !== "PUBLIC") return;

  if (
    field.governance.reviewStatus === "APPROVED" &&
    field.governance.reviewedAt !== null &&
    field.governance.effectiveDate !== null &&
    !isExpired(field.governance.expiresAt)
  ) {
    return;
  }

  issues.push({
    path,
    reviewStatus: field.governance.reviewStatus,
    publicStatus: field.governance.publicStatus,
    reviewedAt: field.governance.reviewedAt,
    effectiveDate: field.governance.effectiveDate,
    expiresAt: field.governance.expiresAt,
  });
};

export const getProcessReleaseBlockers = (): ProcessGovernanceIssue[] => {
  const issues: ProcessGovernanceIssue[] = [];

  appendGovernanceIssue(issues, "framing.description", FRANCHISE_PROCESS_CONTENT.framing.description);

  for (const stage of FRANCHISE_PROCESS_CONTENT.stages) {
    appendGovernanceIssue(issues, `${stage.id}.plainLanguageTitle`, stage.plainLanguageTitle);
    appendGovernanceIssue(issues, `${stage.id}.summary`, stage.summary);
    appendGovernanceIssue(issues, `${stage.id}.buddasEvaluates`, stage.buddasEvaluates);
    appendGovernanceIssue(issues, `${stage.id}.candidateEvaluates`, stage.candidateEvaluates);
    appendGovernanceIssue(issues, `${stage.id}.decisionGate`, stage.decisionGate);
    appendGovernanceIssue(issues, `${stage.id}.decisionGateLabel`, stage.decisionGateLabel);
    appendGovernanceIssue(issues, `${stage.id}.approvedTimingLabel`, stage.approvedTimingLabel);
    appendGovernanceIssue(issues, `${stage.id}.location`, stage.location);
    appendGovernanceIssue(issues, `${stage.id}.deliveryFormat`, stage.deliveryFormat);
    appendGovernanceIssue(issues, `${stage.id}.detailDisclosureLabel`, stage.detailDisclosureLabel);
    for (const detail of stage.optionalDetails) {
      appendGovernanceIssue(issues, `${stage.id}.optionalDetails.${detail.id}.detail`, detail.detail);
    }
    for (const link of stage.relatedLinks) {
      appendGovernanceIssue(issues, `${stage.id}.relatedLinks.${link.value.label}`, link);
    }
  }

  appendGovernanceIssue(issues, "legalGovernance.federalTiming", FRANCHISE_PROCESS_CONTENT.legalGovernance.federalTiming);
  appendGovernanceIssue(issues, "legalGovernance.item23Context", FRANCHISE_PROCESS_CONTENT.legalGovernance.item23Context);
  appendGovernanceIssue(
    issues,
    "legalGovernance.independentAdvisorLanguage",
    FRANCHISE_PROCESS_CONTENT.legalGovernance.independentAdvisorLanguage,
  );
  appendGovernanceIssue(
    issues,
    "legalGovernance.operatorValidationLanguage",
    FRANCHISE_PROCESS_CONTENT.legalGovernance.operatorValidationLanguage,
  );
  appendGovernanceIssue(
    issues,
    "legalGovernance.territoryAgreementLanguage",
    FRANCHISE_PROCESS_CONTENT.legalGovernance.territoryAgreementLanguage,
  );
  appendGovernanceIssue(issues, "closing.description", FRANCHISE_PROCESS_CONTENT.closing.description);
  appendGovernanceIssue(issues, "closing.afterApprovalSummary", FRANCHISE_PROCESS_CONTENT.closing.afterApprovalSummary);
  appendGovernanceIssue(issues, "closing.afterApprovalLink", FRANCHISE_PROCESS_CONTENT.closing.afterApprovalLink);
  appendGovernanceIssue(issues, "closing.primaryBoundaryNote", FRANCHISE_PROCESS_CONTENT.closing.primaryBoundaryNote);

  return issues;
};
