export type ExpansionApplicationStatus =
  | "SUBMITTED"
  | "QUALIFICATION_REVIEW"
  | "TERRITORY_REVIEW"
  | "FDD_DILIGENCE"
  | "MUTUAL_APPROVAL"
  | "AGREEMENT_EXECUTION"
  | "BUILDOUT"
  | "ACTIVE"
  | "DECLINED"
  | "WITHDRAWN";

export type ExpansionStatusDefinition = {
  label: string;
  meaning: string;
  allowedNextStates: readonly ExpansionApplicationStatus[];
  terminal: boolean;
};

export const EXPANSION_STATUS: Record<ExpansionApplicationStatus, ExpansionStatusDefinition> = {
  SUBMITTED: { label: "Submitted", meaning: "Franchise Development has received the request.", allowedNextStates: ["QUALIFICATION_REVIEW", "DECLINED", "WITHDRAWN"], terminal: false },
  QUALIFICATION_REVIEW: { label: "Qualification review", meaning: "The team is reviewing readiness and portfolio context.", allowedNextStates: ["TERRITORY_REVIEW", "DECLINED", "WITHDRAWN"], terminal: false },
  TERRITORY_REVIEW: { label: "Territory review", meaning: "The requested market is under preliminary availability review; no territory is reserved.", allowedNextStates: ["FDD_DILIGENCE", "DECLINED", "WITHDRAWN"], terminal: false },
  FDD_DILIGENCE: { label: "FDD & diligence", meaning: "Required disclosure and independent diligence steps are in progress.", allowedNextStates: ["MUTUAL_APPROVAL", "DECLINED", "WITHDRAWN"], terminal: false },
  MUTUAL_APPROVAL: { label: "Mutual approval", meaning: "Both parties are deciding whether to proceed toward an agreement.", allowedNextStates: ["AGREEMENT_EXECUTION", "DECLINED"], terminal: false },
  AGREEMENT_EXECUTION: { label: "Agreement execution", meaning: "Approved franchise and territory documents are being completed.", allowedNextStates: ["BUILDOUT", "DECLINED"], terminal: false },
  BUILDOUT: { label: "Buildout", meaning: "The approved unit is in the pre-opening development process.", allowedNextStates: ["ACTIVE"], terminal: false },
  ACTIVE: { label: "Active unit", meaning: "The provisioned unit is available in the Operator Workspace.", allowedNextStates: [], terminal: true },
  DECLINED: { label: "Not proceeding", meaning: "The request will not proceed in its current form.", allowedNextStates: [], terminal: true },
  WITHDRAWN: { label: "Withdrawn", meaning: "The operator withdrew this request.", allowedNextStates: [], terminal: true },
};

export const EXPANSION_STATUS_IDS = Object.keys(EXPANSION_STATUS) as ExpansionApplicationStatus[];
export const canTransitionExpansionStatus = (current: ExpansionApplicationStatus, next: ExpansionApplicationStatus): boolean => EXPANSION_STATUS[current].allowedNextStates.includes(next);
export const isExpansionStatus = (value: unknown): value is ExpansionApplicationStatus => typeof value === "string" && EXPANSION_STATUS_IDS.includes(value as ExpansionApplicationStatus);
