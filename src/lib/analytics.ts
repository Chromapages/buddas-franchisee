export type ProcessStageId =
  | "initial-inquiry"
  | "discovery-call"
  | "fdd-disclosure"
  | "discovery-day";

type FunnelEventName =
  | "franchise_home_viewed"
  | "franchise_hero_primary_clicked"
  | "franchise_hero_inquiry_clicked"
  | "franchise_opportunity_viewed"
  | "franchise_inquiry_started"
  | "franchise_inquiry_step_completed"
  | "franchise_inquiry_completed"
  | "franchise_cta_viewed"
  | "franchise_mutual_evaluation_started"
  | "franchise_process_opened"
  | "franchise_evaluation_form_completed"
  | "franchise_evaluation_form_abandoned"
  | "franchise_evaluation_error"
  | "franchise_candidate_profile_viewed"
  | "franchise_financial_qualifications_clicked"
  | "franchise_full_qualifications_clicked"
  | "franchise_candidate_inquiry_clicked"
  | "franchise_advantage_viewed"
  | "franchise_advantage_item_opened"
  | "franchise_advantage_deep_link_clicked"
  | "franchise_advantage_primary_cta_clicked"
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
  | "resource_open"
  | "operator_dashboard_viewed"
  | "operator_attention_item_opened"
  | "operator_active_work_opened"
  | "operator_attention_items_presented"
  | "operator_quick_action_selected"
  | "operator_location_switched"
  | "operator_order_opened"
  | "operator_orders_view_all"
  | "operator_support_opened"
  | "operator_resource_center_opened"
  | "operator_bulletin_opened"
  | "operator_dashboard_refreshed"
  | "operator_dashboard_fetch_failed"
  | "operator_dashboard_module_viewed"
  | "operator_dashboard_module_failed"
  | "operator_recent_order_opened"
  | "operator_sidebar_nav_selected"
  | "operator_bottom_nav_selected"
  | "operator_supplies_viewed"
  | "operator_supply_search_submitted"
  | "operator_supply_search_no_results"
  | "operator_supply_category_selected"
  | "operator_supply_filter_applied"
  | "operator_supply_filter_removed"
  | "operator_supply_sort_changed"
  | "operator_supply_product_opened"
  | "operator_supply_added"
  | "operator_supply_quantity_changed"
  | "operator_supply_removed"
  | "operator_supply_cart_update_failed"
  | "operator_supply_current_order_opened"
  | "operator_supply_cart_opened"
  | "operator_supply_checkout_started"
  | "operator_supply_order_submitted"
  | "operator_supply_order_failed"
  | "operator_orders_viewed"
  | "operator_orders_searched"
  | "operator_orders_filter_applied"
  | "operator_shipment_tracking_opened"
  | "operator_invoice_opened"
  | "operator_cancellation_started"
  | "operator_cancellation_submitted"
  | "operator_cancellation_abandoned"
  | "operator_orders_fetch_failed";

export type OperatorAnalyticsProperties = {
  role_category?: "admin" | "franchisee";
  location_scope_count?: number;
  attention_count?: number;
  active_work_count?: number;
  attention_type?: "required_update" | "support_reply" | "order_exception";
  route?: "/portal" | "/portal/cart" | "/portal/checkout" | "/portal/orders" | "/portal/support" | "/portal/resources" | "/portal/supplies" | "/portal/bulletins";
  quick_action?: "order_supplies" | "resume_order" | "track_orders" | "resource_center" | "get_support";
  action_id?: "order_supplies" | "resume_order" | "track_orders" | "resource_center" | "get_support";
  module_id?: "operator-status" | "quick-actions" | "recent-orders" | "operations-bulletins" | "resource-rail" | "support-rail";
  order_status_category?: "received" | "fulfillment" | "shipment" | "exception" | "complete";
  error_category?: "partial_failure" | "full_failure" | "stale" | "offline" | "unconfigured";
  category?: "Bakery & Dough" | "Packaging & Paper" | "Food Safety & PPE" | "Uniforms" | "Brand Materials" | "Cleaning & Sanitation" | "Equipment" | "Packaging" | "Signage & Uniforms";
  sku?: string;
  result_count?: number;
  filter_count?: number;
  sort?: "relevance" | "recently_ordered" | "name" | "price" | "availability" | "lead_time";
  location_scope?: "active_unit";
  quantity?: number;
  availability_state?: "AVAILABLE" | "NOT_AVAILABLE_FOR_LOCATION";
  lead_time_bucket?: "up_to_3_days" | "4_plus_days" | "unknown";
  cart_item_count?: number;
  product_count?: number;
  cart_action?: "add" | "update" | "remove" | "quick_reorder";
  time_to_first_product_added_ms?: number;
  search_match_type?: "exact_sku" | "exact_name" | "category" | "partial" | "no_results";
  purchase_path?: "repeat" | "discovery";
  supply_error_category?: "validation" | "provider" | "unknown";
  viewport_group?: "mobile" | "tablet" | "desktop";
  shipment_state?: "not_shipped" | "in_transit" | "delivered" | "delayed" | "exception";
  attention_reason?: "delayed" | "failed" | "cancellation";
};

type FunnelEventProperties = {
  form_version?: "inquiry-prequalifier-v1";
  cta_location?: "homepage_hero";
  form_step?: 1 | 2 | 3;
  viewport_group?: "mobile" | "tablet" | "desktop";
  referrer_category?: "direct" | "internal" | "search" | "social" | "external";
  entry_page?: string;
  traffic_source?: string;
  campaign?: string;
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
  item?: "product" | "production" | "operator" | "hospitality" | "growth";
  index?: 1 | 2 | 3 | 4 | 5;
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

type FranchiseFunnelEvent = Extract<
  FunnelEventName,
  | "franchise_home_viewed"
  | "franchise_hero_primary_clicked"
  | "franchise_hero_inquiry_clicked"
  | "franchise_opportunity_viewed"
  | "franchise_inquiry_started"
  | "franchise_inquiry_step_completed"
  | "franchise_inquiry_completed"
  | "franchise_cta_viewed"
  | "franchise_mutual_evaluation_started"
  | "franchise_process_opened"
  | "franchise_evaluation_form_completed"
  | "franchise_evaluation_form_abandoned"
  | "franchise_evaluation_error"
  | "franchise_candidate_profile_viewed"
  | "franchise_financial_qualifications_clicked"
  | "franchise_full_qualifications_clicked"
  | "franchise_candidate_inquiry_clicked"
>;

const franchiseFunnelContextKey = "buddas:franchise-funnel-context";
const safeAttributionToken = (value: string | null) => {
  const normalized = value?.trim().toLowerCase() || "";
  return /^[a-z0-9][a-z0-9._-]{0,63}$/.test(normalized) ? normalized : undefined;
};

const viewportGroup = () =>
  window.innerWidth < 48 * 16
    ? "mobile"
    : window.innerWidth < 67.25 * 16
      ? "tablet"
      : "desktop";

type FranchiseFunnelContext = {
  entryPage: string;
  trafficSource?: string;
  campaign?: string;
  referrerCategory: NonNullable<FunnelEventProperties["referrer_category"]>;
};

const referrerCategory = (): FranchiseFunnelContext["referrerCategory"] => {
  if (typeof document === "undefined" || !document.referrer) return "direct";
  try {
    const referrer = new URL(document.referrer);
    if (referrer.host === window.location.host) return "internal";
    if (/(google|bing|duckduckgo|yahoo)\./i.test(referrer.hostname)) return "search";
    if (/(facebook|instagram|linkedin|tiktok|x\.com|twitter)\./i.test(referrer.hostname)) return "social";
  } catch {
    return "external";
  }
  return "external";
};

const currentFranchiseFunnelContext = (): FranchiseFunnelContext => {
  const entryPage = window.location.pathname.startsWith("/")
    ? window.location.pathname
    : "/franchise";
  const parameters = new URLSearchParams(window.location.search);
  const current = {
    entryPage,
    trafficSource: safeAttributionToken(parameters.get("utm_source")),
    campaign: safeAttributionToken(parameters.get("utm_campaign")),
    referrerCategory: referrerCategory(),
  };

  try {
    const stored = window.sessionStorage.getItem(franchiseFunnelContextKey);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<FranchiseFunnelContext>;
      if (typeof parsed.entryPage === "string" && parsed.entryPage.startsWith("/")) {
        const trafficSource = safeAttributionToken(parsed.trafficSource ?? null);
        const campaign = safeAttributionToken(parsed.campaign ?? null);
        return {
          entryPage: parsed.entryPage,
          ...(trafficSource ? { trafficSource } : {}),
          ...(campaign ? { campaign } : {}),
          referrerCategory: parsed.referrerCategory === "internal" || parsed.referrerCategory === "search" || parsed.referrerCategory === "social" || parsed.referrerCategory === "external" || parsed.referrerCategory === "direct" ? parsed.referrerCategory : current.referrerCategory,
        };
      }
    }
    window.sessionStorage.setItem(franchiseFunnelContextKey, JSON.stringify(current));
  } catch {
    // Analytics must never block navigation or form use when storage is unavailable.
  }

  return current;
};

/**
 * Franchise funnel events carry only route, viewport, and sanitized UTM context.
 * Form values, contact details, and financial responses are intentionally absent.
 */
export const trackFranchiseFunnelEvent = (
  event: FranchiseFunnelEvent,
  properties: Pick<FunnelEventProperties, "form_version" | "form_step" | "cta_variant"> = {},
) => {
  if (typeof window === "undefined") return;

  const context = currentFranchiseFunnelContext();
  trackFunnelEvent(event, {
    viewport_group: viewportGroup(),
    entry_page: context.entryPage,
    referrer_category: context.referrerCategory,
    ...(context.trafficSource ? { traffic_source: context.trafficSource } : {}),
    ...(context.campaign ? { campaign: context.campaign } : {}),
    ...properties,
  });
};

const operatorRoutes = new Set(["/portal", "/portal/cart", "/portal/checkout", "/portal/orders", "/portal/support", "/portal/resources", "/portal/supplies", "/portal/bulletins"]);
const operatorRoles = new Set(["admin", "franchisee"]);
const attentionTypes = new Set(["required_update", "support_reply", "order_exception"]);
const quickActions = new Set(["order_supplies", "resume_order", "track_orders", "resource_center", "get_support"]);
const dashboardModuleIds = new Set(["operator-status", "quick-actions", "recent-orders", "operations-bulletins", "resource-rail", "support-rail"]);
const orderStatusCategories = new Set(["received", "fulfillment", "shipment", "exception", "complete"]);
const errorCategories = new Set(["partial_failure", "full_failure", "stale", "offline", "unconfigured"]);
const viewportGroups = new Set(["mobile", "tablet", "desktop"]);
const shipmentStates = new Set(["not_shipped", "in_transit", "delivered", "delayed", "exception"]);
const attentionReasons = new Set(["delayed", "failed", "cancellation"]);
const supplyCategories = new Set(["Bakery & Dough", "Packaging & Paper", "Food Safety & PPE", "Uniforms", "Brand Materials", "Cleaning & Sanitation", "Equipment", "Packaging", "Signage & Uniforms"]);
const supplySorts = new Set(["relevance", "recently_ordered", "name", "price", "availability", "lead_time"]);
const supplyStates = new Set(["AVAILABLE", "NOT_AVAILABLE_FOR_LOCATION"]);
const leadTimeBuckets = new Set(["up_to_3_days", "4_plus_days", "unknown"]);
const searchMatchTypes = new Set(["exact_sku", "exact_name", "category", "partial", "no_results"]);
const purchasePaths = new Set(["repeat", "discovery"]);
const supplyErrorCategories = new Set(["validation", "provider", "unknown"]);
const cartActions = new Set(["add", "update", "remove", "quick_reorder"]);

const enumValue = <T extends string>(value: unknown, allowed: Set<string>): T | undefined =>
  typeof value === "string" && allowed.has(value) ? value as T : undefined;
const boundedCount = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : undefined;
const boundedSupplyCount = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(10_000, Math.max(0, Math.round(value))) : undefined;
const boundedDuration = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(3_600_000, Math.max(0, Math.round(value))) : undefined;
const safeSku = (value: unknown): string | undefined =>
  typeof value === "string" && /^[A-Z0-9][A-Z0-9_-]{0,31}$/.test(value) ? value : undefined;

/** Runtime allow-listing prevents IDs, visible copy, money, unit data, and auth fields from entering operator analytics. */
export const trackOperatorWorkspaceEvent = (event: OperatorWorkspaceEvent, properties: OperatorAnalyticsProperties = {}) => {
  if (typeof window === "undefined") return;
  const safeProperties = {
    role_category: enumValue(properties.role_category, operatorRoles),
    location_scope_count: boundedCount(properties.location_scope_count),
    attention_count: boundedCount(properties.attention_count),
    active_work_count: boundedCount(properties.active_work_count),
    attention_type: enumValue(properties.attention_type, attentionTypes),
    route: enumValue(properties.route, operatorRoutes),
    quick_action: enumValue(properties.quick_action, quickActions),
    action_id: enumValue(properties.action_id, quickActions),
    module_id: enumValue(properties.module_id, dashboardModuleIds),
    order_status_category: enumValue(properties.order_status_category, orderStatusCategories),
    error_category: enumValue(properties.error_category, errorCategories),
    category: enumValue(properties.category, supplyCategories),
    sku: safeSku(properties.sku),
    result_count: boundedSupplyCount(properties.result_count),
    filter_count: boundedCount(properties.filter_count),
    sort: enumValue(properties.sort, supplySorts),
    location_scope: properties.location_scope === "active_unit" ? "active_unit" : undefined,
    quantity: boundedCount(properties.quantity),
    availability_state: enumValue(properties.availability_state, supplyStates),
    lead_time_bucket: enumValue(properties.lead_time_bucket, leadTimeBuckets),
    cart_item_count: boundedSupplyCount(properties.cart_item_count),
    product_count: boundedSupplyCount(properties.product_count),
    cart_action: enumValue(properties.cart_action, cartActions),
    time_to_first_product_added_ms: boundedDuration(properties.time_to_first_product_added_ms),
    search_match_type: enumValue(properties.search_match_type, searchMatchTypes),
    purchase_path: enumValue(properties.purchase_path, purchasePaths),
    supply_error_category: enumValue(properties.supply_error_category, supplyErrorCategories),
    viewport_group: enumValue(properties.viewport_group, viewportGroups),
    shipment_state: enumValue(properties.shipment_state, shipmentStates),
    attention_reason: enumValue(properties.attention_reason, attentionReasons),
  };
  const payload = Object.fromEntries(Object.entries({ event, workspace: "operator", ...safeProperties }).filter(([, value]) => value !== undefined));
  const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
  analyticsWindow.dataLayer?.push(payload);
  window.dispatchEvent(new CustomEvent("buddas:analytics", { detail: payload }));
};

const locationSwitchMarker = "buddas:operator-location-switch";
/** The target stays in same-tab storage solely to confirm the redirect; it is never added to analytics. */
export const markOperatorLocationSwitch = (targetLocationId: string) => {
  try { window.sessionStorage.setItem(locationSwitchMarker, JSON.stringify({ targetLocationId, markedAt: Date.now() })); } catch { /* Analytics cannot block the form. */ }
};
export const consumeConfirmedOperatorLocationSwitch = (activeLocationId: string): boolean => {
  try {
    const raw = window.sessionStorage.getItem(locationSwitchMarker);
    window.sessionStorage.removeItem(locationSwitchMarker);
    if (!raw) return false;
    const marker = JSON.parse(raw) as { targetLocationId?: unknown; markedAt?: unknown };
    return marker.targetLocationId === activeLocationId && typeof marker.markedAt === "number" && Date.now() - marker.markedAt < 60_000;
  } catch { return false; }
};
