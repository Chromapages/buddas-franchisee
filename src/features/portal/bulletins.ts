import type {
  AudienceContext,
  PortalBulletin,
  PortalLocation,
  PortalRole,
  TargetingEvaluation,
} from "./types.ts";
import { evaluateAudienceTargeting } from "./targeting.ts";

export const isBulletinActive = (
  bulletin: PortalBulletin,
  now = new Date(),
): boolean => {
  if (bulletin.supersededById) {
    return false;
  }
  if (!bulletin.expiresAt) {
    return true;
  }

  const expiresAt = new Date(bulletin.expiresAt);
  return Number.isNaN(expiresAt.getTime()) || expiresAt >= now;
};

const resolveAudienceContext = (
  contextOrLocationId: AudienceContext | string,
  role?: PortalRole,
  locationProfile?: PortalLocation | null,
): AudienceContext => {
  if (typeof contextOrLocationId === "object") {
    return contextOrLocationId;
  }
  return {
    unitId: contextOrLocationId,
    role: role || "franchisee",
    market: locationProfile?.market,
    equipmentConfig: locationProfile?.equipmentConfig,
    launchStage: locationProfile?.launchStage,
    storeFormat: locationProfile?.storeFormat,
  };
};

export const isBulletinForOperator = (
  bulletin: PortalBulletin,
  contextOrLocationId: AudienceContext | string,
  role?: PortalRole,
  locationProfile?: PortalLocation | null,
): boolean => {
  const context = resolveAudienceContext(
    contextOrLocationId,
    role,
    locationProfile,
  );
  return evaluateAudienceTargeting(bulletin.audience, context).isTargeted;
};

export const explainBulletinForOperator = (
  bulletin: PortalBulletin,
  contextOrLocationId: AudienceContext | string,
  role?: PortalRole,
  locationProfile?: PortalLocation | null,
): TargetingEvaluation => {
  const context = resolveAudienceContext(
    contextOrLocationId,
    role,
    locationProfile,
  );
  return evaluateAudienceTargeting(bulletin.audience, context);
};

export const getVisibleBulletins = (
  bulletins: PortalBulletin[],
  contextOrLocationId: AudienceContext | string,
  role?: PortalRole,
  locationProfile?: PortalLocation | null,
  now = new Date(),
): PortalBulletin[] =>
  bulletins
    .filter(
      (bulletin) =>
        isBulletinActive(bulletin, now) &&
        isBulletinForOperator(
          bulletin,
          contextOrLocationId,
          role,
          locationProfile,
        ),
    )
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

export const requiresBulletinAction = (bulletin: PortalBulletin): boolean =>
  bulletin.priority === "ACTION_REQUIRED";
