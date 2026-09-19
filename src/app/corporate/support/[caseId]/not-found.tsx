import Link from "next/link";
import { EmptyState } from "@/src/components/corporate/corporate-ui";

export default function SupportNotFound() {
  return <EmptyState title="Support case not found" description="The reference may be unavailable in your current scope." action={<Link className="corporate-button-secondary" href="/corporate/support">Return to support</Link>} />;
}
