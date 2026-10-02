import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ordersListHref, parseOrdersListQuery, serializeOrdersListQuery } from "../src/features/portal/orders-query.ts";
import { getCancellationWorkflowPresentation, getOrderStatusPresentation, normalizeBackendOperationalStatus } from "../src/features/portal/order-status-presentation.ts";

const read = (path) => readFileSync(path, "utf8");

test("mobile Orders uses a location-scoped list and a dedicated detail route", () => {
  const page = read("src/app/portal/orders/page.tsx");
  const detail = read("src/app/portal/orders/[orderId]/page.tsx");
  const mobile = read("src/components/portal/mobile-orders-workspace.tsx");
  const row = read("src/components/portal/mobile-order-list-item.tsx");
  const presentation = read("src/features/portal/order-status-presentation.ts");
  const authorization = read("src/features/portal/authorization.ts");
  const storage = read("src/features/portal/storage-adapter.ts");
  const firestore = read("src/features/portal/firestore-storage.ts");

  assert.match(page, /MobileOrdersWorkspace/);
  assert.match(detail, /getOrdersByLocation\(session\.locationId\)/);
  assert.match(detail, /orders\.find\(\(candidate\) => candidate\.id === orderId\)/);
  assert.doesNotMatch(detail, /getOrderById\(/);
  assert.match(authorization, /VIEW_ORDER_DOCUMENTS/);
  assert.match(authorization, /getOrderCapabilities/);
  assert.match(storage, /getOrderById\(orderId: string, locationId: string\)/);
  assert.match(storage, /cancelOrder\(orderId: string, reason: string \| undefined, locationId: string\)/);
  assert.match(firestore, /collection\("units"\)\.doc\(locationId\)\.collection\("orders"\)\.doc\(orderId\)/);
  assert.doesNotMatch(firestore, /const units = await this\.getLocations\(\)/);
  assert.match(detail, /Order unavailable/);
  const mobileDetail = read("src/components/portal/mobile-order-detail.tsx");
  const ordersWorkspace = read("src/components/portal/orders-workspace.tsx");
  const desktopDetail = read("src/components/portal/desktop-order-detail.tsx");
  const summaryFacts = read("src/components/portal/order-summary-facts.tsx");
  assert.doesNotMatch(ordersWorkspace, /OrderPreview/);
  assert.doesNotMatch(ordersWorkspace, /Preview order/);
  assert.match(ordersWorkspace, /<Link href=\{href\} className=\{actionLabel === "View" \? undefined : "is-primary"\}/);
  assert.match(mobileDetail, /mobile-order-detail__header-status/);
  assert.match(mobileDetail, /Placed \{formatPortalDate\(order\.createdAt, locationId\)\}/);
  assert.match(mobileDetail, /Invoice \{order\.invoiceId\}/);
  assert.doesNotMatch(mobileDetail, /mobile-order-detail__invoice/);
 assert.match(mobileDetail, /getOrderStatusPresentation/);
  assert.match(mobileDetail, /<OrderSummaryFacts order=\{order\}/);
  assert.match(desktopDetail, /<OrderSummaryFacts order=\{order\}/);
  assert.match(summaryFacts, /<dl className="order-summary-facts">/);
  assert.match(presentation, /Action required: shipment delayed/);
  assert.match(presentation, /Cancellation request pending/);
  const shipments = read("src/components/portal/shipment-details.tsx");
  assert.match(mobileDetail, /<ShipmentDetails shipments=\{shipments\}/);
  assert.match(mobileDetail, /canViewTracking=\{canViewShipmentTracking\}/);
  assert.match(shipments, /normalizeBackendOperationalStatus\("shipment", shipment\.stage\)/);
  assert.match(shipments, /if \(!validShipments\.length\) return null/);
  assert.doesNotMatch(shipments, /Not assigned yet/);
  const lineItem = read("src/components/portal/order-line-item.tsx");
  assert.match(mobileDetail, /<OrderLineItem/);
  assert.match(lineItem, /variant\?: string/);
  assert.match(lineItem, /cancelledQuantity\?: number/);
  assert.match(lineItem, /backorderedQuantity\?: number/);
  assert.match(lineItem, /shipmentAssignment\?: string/);
  assert.match(lineItem, /fulfillmentState\?: string/);
  assert.match(lineItem, /thumbnailUrl\?\.startsWith\("\/images\/catalog\/"\)/);
  assert.match(mobile, /const href = `\/portal\/orders\/\$\{encodeURIComponent\(order\.id\)\}/);
  assert.match(row, /Open order \$\{order\.id\}/);
  assert.match(mobile, /ordersListScrollKey/);
  assert.match(mobile, /router\.replace\(ordersListHref/);
  assert.match(mobile, /item\.sku\.toLowerCase\(\)\.includes\(normalizedQuery\)/);
  assert.match(mobile, /item\.name\.toLowerCase\(\)\.includes\(normalizedQuery\)/);
  assert.match(mobile, /Search orders by order ID, invoice ID, SKU, or item name/);
  assert.match(mobile, /Filter\{activeFilterCount/);
  assert.match(mobile, /<OrderControlDialog open=\{filterOpen\}/);
  assert.match(mobile, /<OrderControlDialog open=\{sortOpen\}/);
  assert.match(mobile, /dialog\.showModal\(\)/);
  assert.match(mobile, /<MobileOrderListItem/);
  assert.match(row, /invoiceMatched/);
  assert.match(row, /getOrderStatusPresentation/);
  assert.match(presentation, /Fulfillment window/);
  assert.match(presentation, /Shipment delayed/);
  assert.match(presentation, /Order cancelled/);
  assert.match(row, /href=\{href\}/);
  assert.match(mobile, /No active shipments/);
  assert.match(mobile, /Nothing needs attention/);
  assert.match(mobile, /No orders match “\$\{queryText\}”/);
  assert.match(mobile, /No supply orders yet/);
  assert.match(mobile, /setStatus\("ALL"\)/);
  assert.doesNotMatch(mobile, /setSort\("newest"\)/);
});

test("Orders list query state is bounded and safe to carry through detail navigation", () => {
  const parsed = parseOrdersListQuery({ q: "  INV-2026-8564 ", status: "PROCESSING", sort: "highest-total", view: "in-motion" });
  assert.deepEqual(parsed, { query: "INV-2026-8564", status: "PROCESSING", sort: "highest-total", view: "in-motion" });
  assert.equal(ordersListHref(parsed), "/portal/orders?q=INV-2026-8564&status=PROCESSING&sort=highest-total&view=in-motion");
  assert.equal(serializeOrdersListQuery(parseOrdersListQuery({ status: "NOT_A_STATUS", sort: "unsafe", view: "untrusted" })), "");
});

test("normalized status presentation centralizes current and future order dimensions", () => {
  const processing = getOrderStatusPresentation("PROCESSING", "3-5 Business Days");
  assert.deepEqual(processing.primary, {
    domain: "order",
    backendValue: "PROCESSING",
    label: "Processing",
    semantic: "neutral",
    icon: "package",
   priority: "routine",
   explanatoryCopy: "Order is being fulfilled.",
    accessibleLabel: "Order status: Processing. Order is being fulfilled.",
  });
  assert.equal(processing.nextStep, "Fulfillment window: 3-5 Business Days");
  const delayed = getOrderStatusPresentation("DELAYED");
  assert.equal(delayed.exception?.title, "Action required: shipment delayed");
  assert.equal(delayed.exception?.actionRequired, true);
  assert.deepEqual(normalizeBackendOperationalStatus("fulfillment", "picking")?.label, "Picking");
  assert.deepEqual(normalizeBackendOperationalStatus("shipment", "carrier received")?.label, "Carrier received");
  assert.deepEqual(normalizeBackendOperationalStatus("cancellation", "partially-approved")?.label, "Partially approved");
  assert.equal(normalizeBackendOperationalStatus("shipment", "invented_state"), null);
});

test("cancellation requests use a dedicated permission, a scoped database update, and a native modal", () => {
  const authorization = read("src/features/portal/authorization.ts");
  const action = read("src/features/portal/actions.ts");
  const storage = read("src/features/portal/db-storage.ts");
  const dialog = read("src/components/portal/order-cancellation-request.tsx");

  assert.match(authorization, /REQUEST_ORDER_CANCELLATION/);
  assert.match(action, /assertPortalPermission\(session, "REQUEST_ORDER_CANCELLATION"\)/);
  assert.match(action, /status: "success" \| "error"/);
  assert.match(storage, /WHERE order_id = \$1 AND location_id = \$2/);
  assert.match(dialog, /<dialog/);
  assert.match(dialog, /showModal\(\)/);
  assert.match(dialog, /reasonRef\.current\?\.focus\(\)/);
  assert.match(dialog, /restoreTriggerFocus/);
  assert.match(dialog, /requesting cancellation of the entire order/);
  assert.match(dialog, /Item-level and partial cancellation are not available/);
  assert.match(dialog, /Submit cancellation request/);
  assert.doesNotMatch(dialog, /window\.confirm|confirm\(/);

  const status = read("src/components/portal/order-cancellation-status.tsx");
  assert.match(status, /getCancellationWorkflowPresentation/);
  assert.match(status, /Cancellation request/);
});

test("cancellation workflow only derives outcomes supplied by the order state", () => {
  assert.equal(getCancellationWorkflowPresentation("PROCESSING"), null);
  assert.equal(getCancellationWorkflowPresentation("CANCELLATION_REQUESTED")?.state, "PENDING");
  assert.equal(getCancellationWorkflowPresentation("PROCESSING", "approved")?.state, "APPROVED");
  assert.equal(getCancellationWorkflowPresentation("PROCESSING", "partially-approved")?.state, "PARTIALLY_APPROVED");
  assert.equal(getCancellationWorkflowPresentation("PROCESSING", "rejected")?.state, "REJECTED");
  assert.equal(getCancellationWorkflowPresentation("CANCELLED")?.state, "CANCELLED");
  assert.equal(getCancellationWorkflowPresentation("PROCESSING", "invented outcome"), null);
});

test("Firestore Orders normalize the centralized status mapping before rendering", () => {
  const storage = read("src/features/portal/firestore-storage.ts");
  assert.match(storage, /getOrdersByLocation[\s\S]*normalizeOrderStatus\(order\.status\)/);
});

test("order documents appear only for a matching unit-scoped invoice and use a protected delivery route", () => {
  const documents = read("src/features/portal/order-documents.ts");
  const documentComponent = read("src/components/portal/order-documents.tsx");
  const detailPage = read("src/app/portal/orders/[orderId]/page.tsx");
  const documentRoute = read("src/app/portal/orders/[orderId]/documents/[documentId]/route.ts");

  assert.match(documents, /document\.unitId === order\.locationId/);
  assert.match(documents, /document\.referenceId === order\.invoiceId/);
  assert.match(detailPage, /getAuthorizedOrderDocuments/);
  assert.match(detailPage, /\/portal\/orders\/\$\{encodeURIComponent\(order\.id\)\}\/documents\//);
  assert.match(documentRoute, /requirePortalPermission\("VIEW_ORDERS"\)/);
  assert.match(documentRoute, /assertPortalPermission\(session, "VIEW_ORDER_DOCUMENTS"\)/);
  assert.match(documentRoute, /getOrdersByLocation\(session\.locationId\)/);
  assert.match(documentRoute, /NextResponse\.redirect\(document\.downloadUrl\)/);
  assert.match(documentComponent, /aria-label=\{`Download \$\{documentName\}`\}/);
  assert.doesNotMatch(documentComponent, /\bShare\b|\bPrint\b|\bView\b/);
});
