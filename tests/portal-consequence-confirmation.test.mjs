import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT_DIR = path.resolve(process.cwd());

test("1. High-Consequence Order Cancellation: has rich confirmation dialog preventing wrong-unit / wrong-order mistakes", () => {
  const ordersWorkspacePath = path.join(ROOT_DIR, "src/components/portal/orders-workspace.tsx");
  const content = fs.readFileSync(ordersWorkspacePath, "utf-8");

  // Verify OrderDetail accepts locationName and locationId
  assert.ok(
    content.includes("locationName: string"),
    "OrderDetail should accept locationName for unit context",
  );
  assert.ok(
    content.includes("locationId: string"),
    "OrderDetail should accept locationId for unit context",
  );

  // Verify alertdialog with aria-modal
  assert.ok(
    content.includes('role="alertdialog"'),
    "Order cancellation confirmation must use role='alertdialog'",
  );
  assert.ok(
    content.includes('aria-modal="true"'),
    "Order cancellation confirmation must specify aria-modal='true'",
  );

  // Verify context: unit name, unit ID, order ID, invoice ID, total dollar value, line items
  assert.ok(
    content.includes("{locationName} ({locationId || order.locationId})"),
    "Must display target unit name and ID to prevent wrong-unit mistakes",
  );
  assert.ok(
    content.includes("{order.id}"),
    "Must display order ID in confirmation dialog",
  );
  assert.ok(
    content.includes("{order.invoiceId}"),
    "Must display invoice ID in confirmation dialog",
  );
  assert.ok(
    content.includes("${order.total.toFixed(2)}"),
    "Must display total dollar amount in confirmation dialog",
  );
  assert.ok(
    content.includes("Line Items"),
    "Must display line items summary in confirmation dialog",
  );
  assert.ok(
    content.includes("name=\"reason\""),
    "Must provide reason input for audit trail",
  );

  // Verify dismiss and confirm buttons
  assert.ok(
    content.includes("Keep order"),
    "Must offer a non-destructive dismiss button to keep the order",
  );
  assert.ok(
    content.includes("Yes, cancel order"),
    "Must offer an explicit confirmation button for cancellation",
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
    content.includes("handleUndoRemove"),
    "Cart workspace must support handleUndoRemove",
  );
  assert.ok(
    content.includes("restorePortalCartItemAction"),
    "Cart workspace must call restorePortalCartItemAction on undo",
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
  const bulletinsPath = path.join(ROOT_DIR, "src/components/portal/bulletins-board.tsx");
  const bulletinsContent = fs.readFileSync(bulletinsPath, "utf-8");

  assert.ok(
    !bulletinsContent.includes('role="alertdialog"'),
    "Bulletins board should not have blocking confirmation dialogs for reading",
  );
  assert.ok(
    !bulletinsContent.includes("Are you sure"),
    "Reading bulletins should not prompt 'Are you sure?'",
  );

  const resourcePath = path.join(ROOT_DIR, "src/components/portal/resource-library.tsx");
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

test("6. Cart Actions: restorePortalCartItemAction exports correctly", async () => {
  const cartActions = await import("../src/features/portal/cart-actions.ts");
  assert.equal(typeof cartActions.restorePortalCartItemAction, "function");
  assert.equal(typeof cartActions.removePortalCartItemAction, "function");
  assert.equal(typeof cartActions.updatePortalCartItemAction, "function");
  assert.equal(typeof cartActions.addPortalCartItemAction, "function");
});
