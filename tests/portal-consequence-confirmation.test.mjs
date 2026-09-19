import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT_DIR = path.resolve(process.cwd());

test("1. High-Consequence Order Cancellation: has rich confirmation dialog preventing wrong-unit / wrong-order mistakes", () => {
  const ordersWorkspacePath = path.join(ROOT_DIR, "src/components/portal/orders-workspace.tsx");
  const content = fs.readFileSync(ordersWorkspacePath, "utf-8");
  const dialogPath = path.join(ROOT_DIR, "src/components/portal/order-cancellation-request.tsx");
  const dialogContent = fs.readFileSync(dialogPath, "utf-8");

  // Verify OrderDetail accepts locationName and locationId
  assert.ok(
    content.includes("locationName: string"),
    "OrderDetail should accept locationName for unit context",
  );
  assert.ok(
    content.includes("locationId: string"),
    "OrderDetail should accept locationId for unit context",
  );

  // Native dialog provides modal background isolation and Escape behavior.
  assert.ok(
    dialogContent.includes("<dialog"),
    "Order cancellation confirmation must use a native modal dialog",
  );
  assert.ok(
    dialogContent.includes("showModal()"),
    "Order cancellation confirmation must open modally",
  );

  // Verify context: unit name, unit ID, order ID, invoice ID, total dollar value, line items
  assert.ok(
    dialogContent.includes("{locationName} ({locationId})"),
    "Must display target unit name and ID to prevent wrong-unit mistakes",
  );
  assert.ok(
    dialogContent.includes("{order.id}"),
    "Must display order ID in confirmation dialog",
  );
  assert.ok(
    dialogContent.includes("{order.invoiceId}"),
    "Must display invoice ID in confirmation dialog",
  );
  assert.ok(
    dialogContent.includes("${order.total.toFixed(2)}"),
    "Must display total dollar amount in confirmation dialog",
  );
  assert.ok(
    dialogContent.includes("Line items"),
    "Must display line items summary in confirmation dialog",
  );
  assert.ok(
    dialogContent.includes("name=\"reason\""),
    "Must provide reason input for audit trail",
  );

  // Verify dismiss and confirm buttons
  assert.ok(
    dialogContent.includes("Keep order"),
    "Must offer a non-destructive dismiss button to keep the order",
  );
  assert.ok(
    dialogContent.includes("Submit cancellation request"),
    "Must offer an explicit confirmation button for a cancellation request",
  );
});

test("2. High-Consequence Supply Order Placement: has rich confirmation modal preventing wrong-unit mistakes", () => {
  const checkoutFormPath = path.join(ROOT_DIR, "src/components/portal/checkout-form.tsx");
  const content = fs.readFileSync(checkoutFormPath, "utf-8");

  // Verify alertdialog with aria-modal
  assert.ok(
    content.includes('role="alertdialog"'),
    "Checkout confirmation modal must use role='alertdialog'",
  );
  assert.ok(
    content.includes('aria-modal="true"'),
    "Checkout confirmation modal must specify aria-modal='true'",
  );

  // Verify unit verification context
  assert.ok(
    content.includes("{locationName} (Unit: {locationId})"),
    "Must prominently display target unit name and code in modal",
  );
  assert.ok(
    content.includes("${total.toFixed(2)}"),
    "Must prominently display total invoice amount in modal",
  );
  assert.ok(
    content.includes("destinationConfirmation"),
    "Must require destination confirmation checkbox before submission",
  );
  assert.ok(
    content.includes("Authorize &amp; Place Order"),
    "Must provide explicit authorization button in modal",
  );
  assert.ok(
    content.includes("Back to review"),
    "Must provide dismiss button to return to review",
  );
});

test("3. Low-Risk Reversible Cart Item Removal: prefers Undo over blocking confirmation dialogs", () => {
  const cartWorkspacePath = path.join(ROOT_DIR, "src/components/portal/cart-workspace.tsx");
  const content = fs.readFileSync(cartWorkspacePath, "utf-8");

  // Verify NO blocking confirmation dialog ("Are you sure?")
  assert.ok(
    !content.includes("Are you sure you want to remove"),
    "Cart item removal must NOT force users through an 'Are you sure?' dialog",
  );
  assert.ok(
    !content.includes('role="alertdialog"'),
    "Cart item removal should not use a blocking alertdialog",
  );

  // Verify Undo mechanism
  assert.ok(
    content.includes("undoRef") && content.includes("Undo removal"),
    "Cart workspace must offer a focused Undo removal action",
  );
  assert.ok(
    content.includes("restoring: true"),
    "Cart workspace must restore the removed quantity through its guarded mutation path",
  );
  assert.ok(
    content.includes('role="status"'),
    "Undo banner must use an accessible role='status' live region",
  );
  assert.ok(
    content.includes('aria-live="polite"'),
    "Undo banner must use aria-live='polite'",
  );
});

test("4. Low-Risk Reversible Saved View Deletion: prefers Undo in Orders & Support workspaces", () => {
  const ordersPath = path.join(ROOT_DIR, "src/components/portal/orders-workspace.tsx");
  const ordersContent = fs.readFileSync(ordersPath, "utf-8");

  assert.ok(
    ordersContent.includes("handleUndoDeleteView"),
    "Orders workspace must have handleUndoDeleteView",
  );
  assert.ok(
    !ordersContent.includes("Are you sure you want to delete this view"),
    "Orders workspace should not show a blocking dialog for view deletion",
  );
  assert.ok(
    ordersContent.includes('role="status"'),
    "Orders workspace must display an accessible undo banner",
  );

  const supportPath = path.join(ROOT_DIR, "src/components/portal/support-workspace.tsx");
  const supportContent = fs.readFileSync(supportPath, "utf-8");

  assert.ok(
    supportContent.includes("handleUndoDeleteView"),
    "Support workspace must have handleUndoDeleteView",
  );
  assert.ok(
    !supportContent.includes("Are you sure you want to delete this view"),
    "Support workspace should not show a blocking dialog for view deletion",
  );
  assert.ok(
    supportContent.includes('role="status"'),
    "Support workspace must display an accessible undo banner",
  );
});

test("5. Ordinary Non-Destructive Actions: ZERO confirmation dialogs for navigation, bulletins, and resources", () => {
  const bulletinsPath = path.join(ROOT_DIR, "src/components/portal/interactive-bulletin-list.tsx");
  const bulletinsContent = fs.readFileSync(bulletinsPath, "utf-8");

  assert.ok(
    !bulletinsContent.includes('role="alertdialog"'),
    "Bulletins board should not have blocking confirmation dialogs for reading",
  );
  assert.ok(
    !bulletinsContent.includes("Are you sure"),
    "Reading bulletins should not prompt 'Are you sure?'",
  );

  const resourcePath = path.join(ROOT_DIR, "src/components/portal/resource-action.tsx");
  const resourceContent = fs.readFileSync(resourcePath, "utf-8");

  assert.ok(
    !resourceContent.includes('role="alertdialog"'),
    "Resource library should not have blocking confirmation dialogs for opening/downloading",
  );
  assert.ok(
    !resourceContent.includes("Are you sure"),
    "Opening resources should not prompt 'Are you sure?'",
  );
});

test("6. Cart Actions: guarded cart commands are exported", () => {
  const cartActions = fs.readFileSync(path.join(ROOT_DIR, "src/features/portal/cart-actions.ts"), "utf-8");
  assert.match(cartActions, /export const restorePortalCartItemAction\s*=/);
  assert.match(cartActions, /export const removePortalCartItemAction\s*=/);
  assert.match(cartActions, /export const updatePortalCartItemAction\s*=/);
  assert.match(cartActions, /export const addPortalCartItemAction\s*=/);
});
