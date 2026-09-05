import type {
  AudienceContext,
  OperationalAudience,
  PortalLocation,
  PortalRole,
  TargetingEvaluation,
  TargetingRuleMatch,
} from "./types";

export const buildAudienceContext = (
  location: PortalLocation,
  role: PortalRole,
): AudienceContext => ({
  unitId: location.id,
  market: location.market,
  role,
  equipmentConfig: location.equipmentConfig,
  launchStage: location.launchStage,
  storeFormat: location.storeFormat,
});

export const evaluateAudienceTargeting = (
  audience: OperationalAudience | undefined,
  context: AudienceContext,
): TargetingEvaluation => {
  // Universal if audience is undefined or completely empty
  if (
    !audience ||
    (!audience.unitIds?.length &&
      !audience.markets?.length &&
      !audience.roles?.length &&
      !audience.equipmentConfigs?.length &&
      !audience.launchStages?.length &&
      !audience.storeFormats?.length)
  ) {
    return {
      isTargeted: true,
      isUniversal: true,
      summary: "Universal update for all franchise units and operators.",
      reasons: ["No operational targeting restrictions configured."],
      matchedRules: [],
      unmatchedRules: [],
    };
  }

  const matchedRules: TargetingRuleMatch[] = [];
  const unmatchedRules: TargetingRuleMatch[] = [];
  const reasons: string[] = [];

  // 1. Specific Unit Targeting
  if (audience.unitIds && audience.unitIds.length > 0) {
    if (audience.unitIds.includes(context.unitId)) {
      matchedRules.push({
        dimension: "unit",
        criteria: audience.unitIds,
        actual: context.unitId,
      });
    } else {
      unmatchedRules.push({
        dimension: "unit",
        criteria: audience.unitIds,
        actual: context.unitId,
      });
      reasons.push(
        `Unit '${context.unitId}' is not in targeted units [${audience.unitIds.join(", ")}].`,
      );
    }
  }

  // 2. Market / Regional Operational Territory
  if (audience.markets && audience.markets.length > 0) {
    const marketMatches =
      context.market &&
      audience.markets.some(
        (m) => m.toLowerCase() === context.market?.toLowerCase(),
      );
    if (marketMatches) {
      matchedRules.push({
        dimension: "market",
        criteria: audience.markets,
        actual: context.market,
      });
    } else {
      unmatchedRules.push({
        dimension: "market",
        criteria: audience.markets,
        actual: context.market,
      });
      reasons.push(
        `Unit market '${context.market || "unspecified"}' does not match targeted markets [${audience.markets.join(", ")}].`,
      );
    }
  }

  // 3. Operator Role
  if (audience.roles && audience.roles.length > 0) {
    if (audience.roles.includes(context.role)) {
      matchedRules.push({
        dimension: "role",
        criteria: audience.roles,
        actual: context.role,
      });
    } else {
      unmatchedRules.push({
        dimension: "role",
        criteria: audience.roles,
        actual: context.role,
      });
      reasons.push(
        `Operator role '${context.role}' does not match targeted roles [${audience.roles.join(", ")}].`,
      );
    }
  }

  // 4. Equipment Configuration (Hardware packages installed)
  if (audience.equipmentConfigs && audience.equipmentConfigs.length > 0) {
    const installed = context.equipmentConfig || [];
    const matchingEquipment = audience.equipmentConfigs.filter((eq) =>
      installed.includes(eq),
    );
    if (matchingEquipment.length > 0) {
      matchedRules.push({
        dimension: "equipment",
        criteria: audience.equipmentConfigs,
        actual: installed,
      });
    } else {
      unmatchedRules.push({
        dimension: "equipment",
        criteria: audience.equipmentConfigs,
        actual: installed,
      });
      reasons.push(
        `Unit equipment [${installed.join(", ") || "none"}] lacks required operational equipment [${audience.equipmentConfigs.join(", ")}].`,
      );
    }
  }

  // 5. Store Launch Stage (Lifecycle status)
  if (audience.launchStages && audience.launchStages.length > 0) {
    if (context.launchStage && audience.launchStages.includes(context.launchStage)) {
      matchedRules.push({
        dimension: "launchStage",
        criteria: audience.launchStages,
        actual: context.launchStage,
      });
    } else {
      unmatchedRules.push({
        dimension: "launchStage",
        criteria: audience.launchStages,
        actual: context.launchStage,
      });
      reasons.push(
        `Unit launch stage '${context.launchStage || "unspecified"}' is not in targeted stages [${audience.launchStages.join(", ")}].`,
      );
    }
  }

  // 6. Store Format (Physical layout)
  if (audience.storeFormats && audience.storeFormats.length > 0) {
    if (context.storeFormat && audience.storeFormats.includes(context.storeFormat)) {
      matchedRules.push({
        dimension: "storeFormat",
        criteria: audience.storeFormats,
        actual: context.storeFormat,
      });
    } else {
      unmatchedRules.push({
        dimension: "storeFormat",
        criteria: audience.storeFormats,
        actual: context.storeFormat,
      });
      reasons.push(
        `Unit store format '${context.storeFormat || "unspecified"}' is not in targeted formats [${audience.storeFormats.join(", ")}].`,
      );
    }
  }

  const unitMatches = unmatchedRules.length === 0;
  const isAdmin = context.role === "admin";
  const isTargeted = unitMatches || isAdmin;

  if (isAdmin && !unitMatches) {
    reasons.push(
      "Bypassed by corporate administrator privilege: administrators retain full visibility across all operational communications.",
    );
  }

  const summary = unitMatches
    ? `Targeted match on ${matchedRules.map((r) => r.dimension).join(", ")}.`
    : isAdmin
      ? `Visible to administrator (unit requirements not met: ${unmatchedRules.map((r) => r.dimension).join(", ")}).`
      : `Excluded: ${unmatchedRules.map((r) => r.dimension).join(", ")} requirements not met.`;

  return {
    isTargeted,
    isUniversal: false,
    summary,
    reasons,
    matchedRules,
    unmatchedRules,
  };
};

export const formatAudienceBadgeText = (
  audience: OperationalAudience | undefined,
): string | null => {
  if (!audience) return null;
  const parts: string[] = [];

  if (audience.markets?.length) {
    parts.push(`Market: ${audience.markets.join(", ")}`);
  }
  if (audience.equipmentConfigs?.length) {
    parts.push(`Equipment: ${audience.equipmentConfigs.join(", ")}`);
  }
  if (audience.launchStages?.length) {
    parts.push(`Stage: ${audience.launchStages.join(", ")}`);
  }
  if (audience.storeFormats?.length) {
    parts.push(`Format: ${audience.storeFormats.join(", ")}`);
  }
  if (audience.roles?.length) {
    parts.push(`Role: ${audience.roles.join(", ")}`);
  }
  if (audience.unitIds?.length) {
    parts.push(`Unit: ${audience.unitIds.join(", ")}`);
  }

  if (parts.length === 0) return null;
  return parts.join(" · ");
};
