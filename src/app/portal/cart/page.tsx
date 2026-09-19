import type { Metadata } from "next";
import { getPortalCart, getPortalCartRemoval } from "@/src/features/portal/cart";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { CartWorkspace } from "@/src/components/portal/cart-workspace";
import { OperatorEventOnMount } from "@/src/components/portal/operator-analytics";

export const metadata: Metadata = { title: "Wholesale Cart" };

export default async function CartPage() {
  const session = await requirePortalPermission("MANAGE_CART");
  const [cartItems, removedItem] = await Promise.all([getPortalCart(session), getPortalCartRemoval(session)]);

  return (
    <div className="portal-cart-page portal-page-stack">
      <OperatorEventOnMount event="operator_supply_cart_opened" properties={{ route: "/portal/cart", location_scope: "active_unit", cart_item_count: cartItems.reduce((total, item) => total + item.quantity, 0) }} />
      <div className="portal-page-header">
        <span className="portal-page-eyebrow">
          Wholesale logistics
        </span>
        <h1 className="portal-page-title">
          Supply cart
        </h1>
        <p className="text-sm text-bds-cocoa/80">
          Review supplies, adjust case counts, and verify the active unit before you continue to final order review.
        </p>
      </div>

      <CartWorkspace key={session.locationId} locationId={session.locationId} locationName={session.locationName} items={cartItems} removedItem={removedItem} />
    </div>
  );
}
