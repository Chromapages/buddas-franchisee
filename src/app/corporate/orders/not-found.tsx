import Link from "next/link"; import { EmptyState } from "@/src/components/corporate/corporate-ui";
export default function OrderNotFound() { return <EmptyState title="Order not found" description="The order may be outside your authorized portfolio." action={<Link className="corporate-button-secondary" href="/corporate/orders">Return to orders</Link>} />; }
