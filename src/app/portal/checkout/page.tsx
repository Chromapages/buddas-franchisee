import { getPortalCart } from "@/src/features/portal/cart";
import { redirect } from "next/navigation";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { CheckoutForm } from "@/src/components/portal/checkout-form";
import { getCheckoutFingerprint } from "@/src/features/portal/checkout-review";

type CheckoutPageProps = {
  searchParams: Promise<{ destination?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const session = await requirePortalPermission("CREATE_ORDER");
  const { destination } = await searchParams;
  const cartItems = await getPortalCart(session);
  if (cartItems.length === 0) redirect("/portal/cart");

  const orderItems = cartItems.map((item) => ({
    sku: item.product.sku,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    packSize: item.product.packSize,
  }));

  const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="portal-checkout-page portal-page-stack">
      <div className="portal-page-header">
        <span className="portal-page-eyebrow">
          Wholesale ordering / Checkout
        </span>
        <h1 className="portal-page-title">
          Review &amp; place your order
        </h1>
        <p className="text-sm text-bds-cocoa/80">
          Check the receiving unit, supplies, and costs before submitting.
        </p>
      </div>

      <CheckoutForm
        locationId={session.locationId}
        locationName={session.locationName}
        orderItems={orderItems}
        total={total}
        reviewFingerprint={getCheckoutFingerprint(session.locationId, orderItems)}
        destinationParam={destination}
      />
    </div>
  );
}
