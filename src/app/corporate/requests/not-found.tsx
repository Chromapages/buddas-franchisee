import Link from "next/link"; import { EmptyState } from "@/src/components/corporate/corporate-ui";
export default function RequestNotFound() { return <EmptyState title="Request not found" description="The request may be outside your authorized portfolio." action={<Link className="corporate-button-secondary" href="/corporate/requests">Return to requests</Link>} />; }
