export type TerritoryStatus =
  | "APPROVED"
  | "PENDING_REGISTRATION"
  | "RESTRICTED"
  | "FUTURE_EXPANSION";

export type TerritoryEvaluation = {
  stateCode: string;
  stateName: string;
  status: TerritoryStatus;
  isAvailableForActiveOffering: boolean;
  message: string;
};
