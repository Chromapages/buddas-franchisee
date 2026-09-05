import type { StoredInquiry } from "./types";
import type { InquiryValues } from "./schema";

export type HubSpotContactProperties = {
  email: string;
  firstname: string;
  lastname: string;
  phone: string;
  city_state: string;
  market_of_interest: string;
  available_investment_range: string;
  preferred_development_timeline: string;
  hospitality_experience: string;
  lead_classification: string;
  broker_referral_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  inquiry_source_page?: string;
  franchise_inquiry_id: string;
};

export const formatHubSpotLead = (
  inquiry: StoredInquiry,
): { properties: HubSpotContactProperties } => {
  const payload = inquiry.payload as unknown as InquiryValues;

  const properties: HubSpotContactProperties = {
    email: payload.email,
    firstname: payload.firstName,
    lastname: payload.lastName,
    phone: payload.phone,
    city_state: payload.cityState,
    market_of_interest: payload.marketInterest,
    available_investment_range: payload.investmentRange,
    preferred_development_timeline: payload.preferredTimeline,
    hospitality_experience: payload.experience,
    lead_classification: inquiry.classification,
    franchise_inquiry_id: inquiry.id,
  };

  if (payload.brokerId) {
    properties.broker_referral_id = payload.brokerId;
  }
  if (inquiry.attribution?.utmSource) properties.utm_source = inquiry.attribution.utmSource;
  if (inquiry.attribution?.utmMedium) properties.utm_medium = inquiry.attribution.utmMedium;
  if (inquiry.attribution?.utmCampaign) properties.utm_campaign = inquiry.attribution.utmCampaign;
  if (inquiry.attribution?.utmContent) properties.utm_content = inquiry.attribution.utmContent;
  if (inquiry.attribution?.utmTerm) properties.utm_term = inquiry.attribution.utmTerm;
  if (inquiry.attribution?.sourcePage) properties.inquiry_source_page = inquiry.attribution.sourcePage;

  return { properties };
};
