export type ProcessStageId =
  | "initial-inquiry"
  | "discovery-call"
  | "fdd-disclosure"
  | "discovery-day";

type FunnelEventName =
  | "hero_opportunity_cta_click"
  | "hero_inquiry_link_click"
  | "franchise_inquiry_form_submitted"
  | "sidebar_contact_click"
  | "candidate_profile_variant_view"
  | "candidate_profile_scroll_depth"
  | "candidate_profile_all_criteria_view"
  | "candidate_profile_dwell"
  | "candidate_profile_primary_click"
  | "candidate_profile_investment_click"
  | "candidate_profile_criterion_expand"
  | "candidate_profile_inquiry_progression"
  | "candidate_profile_fdd_click"
  | "faq_inquiry_cta_click"
  | "faq_search"
  | "faq_search_cleared"
  | "faq_filter_applied"
  | "faq_open_all"
  | "faq_close_all"
  | "faq_print"
  | "faq_deep_link_click"
  | "faq_helpfulness_feedback"
  | "faq_open"
  | "faq_close"
  | "faq_related_open"
  | "faq_deep_link_visit"
  | "cta_button_tap"
  | "inline_qualification_complete"
  | "global_cta_view"
  | "global_cta_primary_click"
  | "global_cta_secondary_click"
  | "process_inquiry_click"
  | "process_overview_stage_click"
  | "process_stage_detail_open"
  | "process_stage_detail_close"
  | "process_related_link_click"
  | "process_after_approval_click"
  | "web_vital"
  | "opportunity_index_navigation"
  | "opportunity_context_link_click"
  | "opportunity_territory_filter"
  | "opportunity_territory_search"
  | "opportunity_territory_status_selected"
  | "opportunity_how_it_works_click"
  | "opportunity_request_info_click"
  | "footer_inquiry_click"
  | "footer_email_click"
  | "footer_phone_click"
  | "footer_nav_section_open"
  | "footer_nav_link_click"
  | "footer_legal_link_click"
  | "mobile_nav_open"
  | "mobile_nav_close"
  | "mobile_nav_link_click"
  | "mobile_nav_request_info_click"
  | "why_buddas_pillar_selected"
  | "why_buddas_pillar_resource_open"
  | "portal_order_detail_open";

export type OperatorWorkspaceEvent =
  | "dashboard_order_open"
  | "catalog_view"
  | "order_submit"
  | "support_ticket_create"
  | "bulletin_acknowledge"
  | "resource_open";

type FunnelEventProperties = {
  form_version?: "inquiry-prequalifier-v1";
  cta_location?: "homepage_hero";
  form_step?: 1 | 2 | 3;
  candidate_profile_variant?: "tabs" | "stacked";
  candidate_criterion?: "operate" | "capitalize" | "steward";
  dwell_seconds?: number;
  scroll_depth?: 33 | 67 | 100;
  faq_category?: string;
  faq_position?: "inline" | "bottom";
  faq_query?: string;
  faq_zero_results?: boolean;
  faq_question_id?: string;
  faq_helpful?: boolean;
  faq_feedback_timestamp?: string;
  faq_slug?: string;
  related_source_id?: string;
  faq_viewport?: "mobile" | "tablet" | "desktop";
  faq_result_count?: number;
  faq_item_position?: number;
  faq_filter_id?: string;
  faq_search_topic?: "concept" | "financials" | "territory" | "supply" | "support" | "timeline" | "other";
  faq_destination_id?: string;
  page_path?: string;
  page_type?: string;
  cta_variant?: string;
  placement?: string;
  candidate_destination?: "qualifications" | "investment";
  destination?: string;
  secondary_destination?: string;
  process_interaction?: "inquiry_transition" | "overview_stage" | "detail_disclosure" | "related_link" | "after_approval";
  process_stage_id?: ProcessStageId;
  process_destination_id?: string;
  web_vital_name?: "LCP" | "INP" | "CLS";
  web_vital_value?: number;
  web_vital_rating?: "good" | "needs-improvement" | "poor";
  opportunity_section_id?: string;
  opportunity_destination_id?: string;
  territory_filter_id?: "all" | "current_status" | "under_review";
  territory_result_count?: number;
  territory_status_category?: "current_status" | "under_review";
  has_search_query?: boolean;
  footer_nav_group?: string;
  footer_destination?: string;
  nav_item?: string;
  nav_destination?: string;
  why_buddas_pillar_id?: "bakery-product" | "daypart-format" | "production-approach" | "hospitality-standard";
  why_buddas_destination_id?: string;
  order_status_category?: "received" | "fulfillment" | "shipment" | "exception" | "complete";
};

/** Emits allow-listed funnel metadata only; no inquiry values are collected. */
export const trackFunnelEvent = (
  event: FunnelEventName,
  properties: FunnelEventProperties = {},
) => {
  if (typeof window === "undefined") return;

  const payload = { event, ...properties };
  const analyticsWindow = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
  };

  analyticsWindow.dataLayer?.push(payload);
  window.dispatchEvent(new CustomEvent("buddas:analytics", { detail: payload }));
};

/** Operator analytics deliberately accepts no IDs, text, monetary values, unit data, or auth/session fields. */
export const trackOperatorWorkspaceEvent = (event: OperatorWorkspaceEvent) => {
  if (typeof window === "undefined") return;
  const payload = { event, workspace: "operator" };
  const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
  analyticsWindow.dataLayer?.push(payload);
  window.dispatchEvent(new CustomEvent("buddas:analytics", { detail: payload }));
};
